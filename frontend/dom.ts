import { state, RenameMap, saveConfig } from "./state";

/**
 * Returns true if the node (or any of its ancestors) carries an attribute ending in
 * `-ignore`. Used to opt plugin-owned UI elements out of text rewriting.
 */
export function isIgnored(node: Node): boolean {
    let el: Element | null = node.nodeType === Node.ELEMENT_NODE
        ? (node as Element)
        : node.parentElement;

    while (el) {
        for (const attr of el.attributes) {
            if (attr.name.endsWith("-ignore")) return true;
        }
        el = el.parentElement;
    }

    return false;
}

/**
 * Walks all text nodes under `root` and replaces occurrences of each key in `map`
 * with its value, skipping nodes inside ignored subtrees.
 */
export function renameNodes(root: Node, map: RenameMap) {
    const entries = Object.entries(map);
    if (entries.length === 0) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node: Node | null;

    while ((node = walker.nextNode())) {
        if (!node.nodeValue || isIgnored(node)) continue;

        let text = node.nodeValue;
        for (const [original, renamed] of entries) {
            if (original && text.includes(original)) {
                text = text.split(original).join(renamed);
            }
        }

        if (text !== node.nodeValue) node.nodeValue = text;
    }
}

/**
 * Walks the DOM upward from `start`, following each element's React fiber chain,
 * and returns the first appId found in any component's memoizedProps.
 *
 * Steam's library rows don't expose the appId as a DOM attribute, but the React fiber
 * chain carries it in several shapes depending on which component renders the row.
 */
export function findAppId(start: Element | null): number | null {
    for (let el: Element | null = start; el; el = el.parentElement) {
        const fiberKey = Object.keys(el).find(k => k.startsWith("__reactFiber$"));
        if (!fiberKey) continue;

        for (let fiber: any = (el as any)[fiberKey]; fiber; fiber = fiber.return) {
            const props = fiber.memoizedProps;
            if (!props || typeof props !== "object") continue;

            if (typeof props.appid === "number")                            return props.appid;
            if (typeof props.appId === "number")                            return props.appId;
            if (props.overview && typeof props.overview.appid === "number") return props.overview.appid;
            if (props.item     && typeof props.item.appid    === "number")  return props.item.appid;
        }
    }

    return null;
}

/**
 * Commits a new rename map and immediately updates all watched documents.
 *
 * Renaming is forward-only: once applied, the DOM contains the renamed text, not the
 * original. Re-applying the new map would search for the original and find nothing.
 * A one-shot transition (previous output → new output) is built so already-renamed
 * text updates correctly, without waiting for Steam to re-render the affected rows.
 */
export function applyMapChange(next: RenameMap) {
    const prev = state.currentMap;

    const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
    const transition: RenameMap = {};

    for (const key of allKeys) {
        const before = prev[key] ?? key;
        const after  = next[key] ?? key;
        if (before !== after) transition[before] = after;
    }

    state.currentMap = next;
    saveConfig();

    if (Object.keys(transition).length > 0) {
        for (const doc of state.watchedDocuments) {
            renameNodes(doc.documentElement, transition);
        }
    }
}

/**
 * Attaches a MutationObserver to `doc` that renames text nodes as Steam mutates the DOM.
 *
 * Newly added subtrees are batched and processed on the next animation frame rather
 * than synchronously, because Steam's list virtualization produces rapid bursts of DOM
 * mutations while scrolling and synchronous processing causes visible stutter.
 */
export function watchDocument(doc: Document) {
    state.watchedDocuments.add(doc);
    renameNodes(doc.documentElement, state.currentMap);

    const view = doc.defaultView ?? window;
    let pendingNodes: Element[] = [];
    let frameRequested = false;

    const flushPending = () => {
        frameRequested = false;
        const nodes = pendingNodes;
        pendingNodes = [];
        for (const node of nodes) renameNodes(node, state.currentMap);
    };

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode.nodeType === Node.ELEMENT_NODE && !isIgnored(addedNode)) {
                    pendingNodes.push(addedNode as Element);
                }
            }

            // Character data mutations (Steam updating text in-place) need immediate handling
            // since there is no "added node" to batch — the text node already exists.
            if (mutation.type === "characterData" && mutation.target.nodeValue && !isIgnored(mutation.target)) {
                let text = mutation.target.nodeValue;
                for (const [original, renamed] of Object.entries(state.currentMap)) {
                    if (original && text.includes(original)) {
                        text = text.split(original).join(renamed);
                    }
                }
                if (text !== mutation.target.nodeValue) mutation.target.nodeValue = text;
            }
        }

        if (pendingNodes.length > 0 && !frameRequested) {
            frameRequested = true;
            view.requestAnimationFrame(flushPending);
        }
    });

    observer.observe(doc.documentElement, { childList: true, subtree: true, characterData: true });
}
