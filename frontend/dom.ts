import { state, RenameMap } from "./state";

/**
 * True if the node, or any ancestor, carries an attribute ending in `-ignore`.
 * Used to opt the plugin's own UI (settings panel, rename modal) out of text rewriting
 * so it keeps showing the real game names.
 */
export function isIgnored(node: Node): boolean {
    let el: Element | null = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
    for (; el; el = el.parentElement) {
        for (const attr of el.attributes) {
            if (attr.name.endsWith("-ignore")) return true;
        }
    }
    return false;
}

/**
 * Rewrites rendered text under `root`: any text node whose trimmed content is exactly
 * an `original` name becomes its `renamed` value. Exact whole-node matching (not
 * substring) keeps it from corrupting unrelated text or re-growing already-renamed
 * nodes (e.g. when a renamed name contains the original as a substring).
 *
 * The data layer already renames the library list/search/tooltips; this exists for the
 * one surface that reads a different source — the detail-page header (strDisplayName).
 */
export function renameNodes(root: Node, map: RenameMap) {
    const entries = Object.entries(map).filter(([o, r]) => o && r && o !== r);
    if (entries.length === 0) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    for (let node: Node | null = walker.nextNode(); node; node = walker.nextNode()) {
        const value = node.nodeValue;
        if (!value) continue;
        const trimmed = value.trim();
        if (!trimmed || isIgnored(node)) continue;
        for (const [original, renamed] of entries) {
            if (trimmed === original) {
                node.nodeValue = value.replace(original, renamed);
                break;
            }
        }
    }
}

/**
 * Applies a rename-map change to every watched document, replacing the previous output
 * (original, or an earlier custom name) with the new one — so already-rendered pages
 * update without waiting for Steam to re-render them.
 */
export function applyRenameToDocuments(prev: RenameMap, next: RenameMap) {
    const transition: RenameMap = {};
    for (const key of new Set([...Object.keys(prev), ...Object.keys(next)])) {
        const before = prev[key] ?? key;
        const after  = next[key] ?? key;
        if (before !== after) transition[before] = after;
    }
    if (Object.keys(transition).length === 0) return;
    for (const doc of state.watchedDocuments) renameNodes(doc.documentElement, transition);
}

/**
 * Watches `doc` and rewrites game names as Steam mutates the DOM. Added subtrees are
 * batched onto the next animation frame (Steam's list virtualization fires rapid bursts
 * while scrolling); in-place text edits are handled immediately since there is no added
 * node to batch.
 */
export function watchDocument(doc: Document) {
    if (state.watchedDocuments.has(doc)) return;
    state.watchedDocuments.add(doc);
    renameNodes(doc.documentElement, state.currentMap);

    const view = doc.defaultView ?? window;
    let pending: Node[] = [];
    let scheduled = false;
    const flush = () => {
        scheduled = false;
        const nodes = pending;
        pending = [];
        for (const node of nodes) renameNodes(node, state.currentMap);
    };

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const added of mutation.addedNodes) {
                if (added.nodeType === Node.ELEMENT_NODE && !isIgnored(added)) pending.push(added);
            }
            if (mutation.type === "characterData" && mutation.target.nodeValue && !isIgnored(mutation.target)) {
                const value = mutation.target.nodeValue;
                const trimmed = value.trim();
                for (const [original, renamed] of Object.entries(state.currentMap)) {
                    if (original && renamed && trimmed === original) {
                        mutation.target.nodeValue = value.replace(original, renamed);
                        break;
                    }
                }
            }
        }
        if (pending.length > 0 && !scheduled) {
            scheduled = true;
            view.requestAnimationFrame(flush);
        }
    });

    observer.observe(doc.documentElement, { childList: true, subtree: true, characterData: true });
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
