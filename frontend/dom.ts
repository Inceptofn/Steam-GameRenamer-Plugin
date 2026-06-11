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

/** The detail-page title (appDetails.strDisplayName) for an appId, if loaded. */
function detailsName(appId: number | undefined): string | null {
    if (appId == null) return null;
    return (window as any).appDetailsStore?.GetAppData?.(appId)?.details?.strDisplayName ?? null;
}

/**
 * The rename map plus an alias for any game whose detail-page title differs from its
 * library name. Some titles are spelled differently in the two places — e.g. the
 * library shows "Sonic Adventure 2" while the game page shows "Sonic Adventure™ 2".
 * The rule's key is the library spelling, so without this alias the DOM layer would
 * never match the header text. Both spellings map to the same custom name.
 */
export function withDetailAliases(map: RenameMap): RenameMap {
    const out: RenameMap = { ...map };
    for (const [original, renamed] of Object.entries(map)) {
        const alt = detailsName(state.appIdMap[original]);
        if (alt && !(alt in out)) out[alt] = renamed;
    }
    return out;
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
        if (before === after) continue;
        transition[before] = after;
        // When a game is newly renamed, also transition its (possibly different)
        // detail-page spelling so an open game page updates immediately, not just on
        // the next navigation.
        if (!(key in prev)) {
            const alt = detailsName(state.appIdMap[key]);
            if (alt && alt !== before) transition[alt] = after;
        }
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
    renameNodes(doc.documentElement, withDetailAliases(state.currentMap));

    const view = doc.defaultView ?? window;
    let pending: Node[] = [];
    let scheduled = false;
    const flush = () => {
        scheduled = false;
        const map = withDetailAliases(state.currentMap);
        const nodes = pending;
        pending = [];
        for (const node of nodes) renameNodes(node, map);
    };

    const observer = new MutationObserver((mutations) => {
        // Compute the aliased map once per batch (it reads appDetailsStore), reused below.
        let charMap: RenameMap | null = null;
        for (const mutation of mutations) {
            for (const added of mutation.addedNodes) {
                if (added.nodeType === Node.ELEMENT_NODE && !isIgnored(added)) pending.push(added);
            }
            if (mutation.type === "characterData" && mutation.target.nodeValue && !isIgnored(mutation.target)) {
                if (!charMap) charMap = withDetailAliases(state.currentMap);
                const value = mutation.target.nodeValue;
                const trimmed = value.trim();
                for (const [original, renamed] of Object.entries(charMap)) {
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
