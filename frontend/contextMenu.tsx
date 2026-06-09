import { pluginConfig, showModal, ConfirmModal, TextField } from "@steambrew/client";
import React, { useState } from "react";
import { state } from "./state";
import { findAppId, applyMapChange } from "./dom";
import { setCustomSortAs } from "./steam";

// ─── Rename modal ─────────────────────────────────────────────────────────────

/**
 * Modal dialog for entering a new display name.
 *
 * `window.prompt` returns null immediately inside Steam's CEF environment without ever
 * showing a dialog, so Steam's own ConfirmModal + showModal is used instead.
 */
export const RenameModal = ({
    originalName,
    currentValue,
    appId,
    onConfirm,
    closeModal,
}: {
    originalName: string;
    currentValue: string;
    appId?: number | null;
    onConfirm: (value: string) => void;
    closeModal?: () => void;
}) => {
    const [value, setValue] = useState(currentValue);

    const overview  = appId != null ? (window.appStore as any)?.GetAppOverviewByAppID?.(appId) : null;
    const landscape = overview ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${overview.appid}/header.jpg` : "";

    return (
        <ConfirmModal
            strTitle={<span data-customtitle-ignore="">{`Rename "${originalName}"`}</span>}
            strDescription="Enter the name you'd like to display instead:"
            strOKButtonText="Save"
            closeModal={closeModal}
            onOK={() => onConfirm(value)}
        >
            <TextField
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value)}
            />
            {landscape && (
                <div style={{ display: "flex", marginTop: "12px", height: "160px" }}>
                    <img src={landscape} style={{ flex: 1, height: "160px", objectFit: "cover", borderRadius: "4px" }} />
                </div>
            )}
        </ConfirmModal>
    );
};

// ─── Context menu helpers ─────────────────────────────────────────────────────

/**
 * Finds the "Properties…" text leaf inside a newly added DOM node.
 * Returns null if the node isn't a game context menu.
 */
function findPropertiesLabel(root: HTMLElement): HTMLElement | null {
    const isProperties = (text: string) => /^properties(\.\.\.|…)?$/i.test(text);

    if (root.children.length === 0 && isProperties(root.textContent?.trim() ?? "")) {
        return root;
    }

    for (const el of Array.from(root.querySelectorAll("*")) as HTMLElement[]) {
        if (el.children.length === 0 && isProperties(el.textContent?.trim() ?? "")) {
            return el;
        }
    }

    return null;
}

/**
 * Climbs from `label` to the element that represents the single clickable row.
 *
 * Steam nests labels inside several span wrappers, so `label` is often a deep leaf.
 * The actual row is the first ancestor whose parent contains multiple sibling rows
 * (Play, Manage, Properties, …). Stopping too early would cause the entire menu
 * to be cloned instead of just one row.
 */
function findMenuRow(label: HTMLElement): HTMLElement {
    const looksLikeRow = (el: Element) => {
        const text = el.textContent?.trim() ?? "";
        return text.length > 0 && text.length <= 100 && !text.includes("\n");
    };

    let row = label;
    for (let depth = 0; depth < 8; depth++) {
        const parent = row.parentElement;
        if (!parent) break;
        const siblingRows = Array.prototype.filter.call(parent.children, looksLikeRow) as Element[];
        if (siblingRows.length > 1) break;
        row = parent;
    }

    return row;
}

/**
 * Records the child-index path from `row` down to `label`.
 * Used to locate the same leaf node in a clone, without relying on class names.
 */
function buildLabelPath(label: HTMLElement, row: HTMLElement): number[] {
    const path: number[] = [];

    for (let node: Node | null = label; node && node !== row; node = node.parentNode) {
        const parent = node.parentNode;
        if (!parent) return [];
        path.unshift(Array.prototype.indexOf.call(parent.childNodes, node));
    }

    return path;
}

/**
 * Walks up from `from` toward `stopAt` to find the element whose React props
 * include an `onMouseEnter` handler. That handler manages the menu's focused-item
 * state and closes any open submenu when called.
 */
function findReactPropsElement(from: Element, stopAt: Element): Element | null {
    for (let el: Element | null = from; el && el !== stopAt; el = el.parentElement) {
        const propsKey = Object.keys(el).find(k => k.startsWith("__reactProps$"));
        if (propsKey && typeof (el as any)[propsKey].onMouseEnter === "function") {
            return el;
        }
    }
    return null;
}

/**
 * Walks the fiber tree rooted at `container` and calls `fnOnMenuItemSelected`,
 * which is the menu component's own close callback (equivalent to clicking a real item).
 */
function closeContextMenu(container: Element) {
    const fiberKey = Object.keys(container).find(k => k.startsWith("__reactFiber$"));
    if (!fiberKey) return;

    for (let fiber: any = (container as any)[fiberKey]; fiber; fiber = fiber.return) {
        const props = fiber.memoizedProps;
        if (props && typeof props.fnOnMenuItemSelected === "function") {
            props.fnOnMenuItemSelected();
            break;
        }
    }
}

/**
 * Inspects a newly added DOM node and, if it is part of a game context menu,
 * inserts a Rename item above the Properties row.
 */
function tryInjectRenameItem(
    root: HTMLElement,
    doc: Document,
    gameName: string,
    appId: number | null,
) {
    if (root.classList?.contains("freakbydaylight-rename-item")) return;

    const label = findPropertiesLabel(root);
    if (!label) return;

    const row       = findMenuRow(label);
    const container = row.parentElement;
    if (!container) return;

    if (container.querySelector(".freakbydaylight-rename-item")) return;
    if (!gameName && appId == null) return;

    // Prefer the display_name from appStore — it's Steam's raw game name, unaffected
    // by our DOM renaming and free of status badges like "- Update Queued".
    // Fall back to reverse-mapping the captured DOM text if appStore isn't available.
    const storedName = appId != null
        ? ((window.appStore as any)?.GetAppOverviewByAppID?.(appId)?.display_name as string | undefined)
        : undefined;

    let originalName: string;
    if (storedName) {
        originalName = storedName;
    } else {
        if (!gameName) return;
        const reverseMap: Record<string, string> = {};
        for (const [orig, renamed] of Object.entries(state.currentMap)) reverseMap[renamed] = orig;
        originalName = reverseMap[gameName] ?? gameName;
    }

    // ── Build the clone ──────────────────────────────────────────────────────

    const labelPath = buildLabelPath(label, row);
    const newItem   = row.cloneNode(true) as HTMLElement;
    newItem.classList.add("freakbydaylight-rename-item");

    let labelInClone: Node = newItem;
    for (const index of labelPath) {
        const next = labelInClone.childNodes[index];
        if (!next) { labelInClone = newItem; break; }
        labelInClone = next;
    }
    labelInClone.textContent = state.currentMap[originalName]
        ? `Rename: "${state.currentMap[originalName]}"`
        : "Set custom name…";

    // ── Hover handling ───────────────────────────────────────────────────────

    const clearSiblingHover = () => {
        for (const sibling of Array.from(container.children)) {
            if (sibling === newItem) continue;
            sibling.dispatchEvent(new MouseEvent("mouseout",    { bubbles: true, cancelable: true, relatedTarget: newItem }));
            sibling.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, cancelable: true, relatedTarget: newItem }));
        }
    };

    const propertiesPropsEl = findReactPropsElement(label, container);

    newItem.addEventListener("mouseenter", () => {
        if (propertiesPropsEl) {
            const propsKey = Object.keys(propertiesPropsEl).find(k => k.startsWith("__reactProps$"))!;
            const props    = (propertiesPropsEl as any)[propsKey];
            props.onMouseEnter?.(new MouseEvent("mouseenter", { bubbles: true,  cancelable: true }));
            props.onMouseLeave?.(new MouseEvent("mouseleave", { bubbles: false, cancelable: true }));
        }
        clearSiblingHover();
    });

    newItem.addEventListener("mousemove", clearSiblingHover);

    // ── Click handling ───────────────────────────────────────────────────────

    newItem.addEventListener("click", () => {
        const currentValue = state.currentMap[originalName] ?? originalName;

        // Remove the item before the menu tears down so React's container
        // still matches what it originally rendered.
        newItem.remove();
        closeContextMenu(container);

        showModal(
            <RenameModal
                originalName={originalName}
                currentValue={currentValue}
                appId={appId}
                onConfirm={async (value) => {
                    const trimmed   = value.trim();
                    const reverting = trimmed === "" || trimmed === originalName;

                    const next = { ...state.currentMap };
                    if (reverting) {
                        delete next[originalName];
                    } else {
                        next[originalName] = trimmed;
                    }
                    applyMapChange(next);

                    if (appId != null) {
                        state.appIdMap[originalName] = appId;
                        pluginConfig.set("appIdMap", state.appIdMap);

                        if (state.sortEnabled) {
                            setCustomSortAs(appId, reverting ? "" : trimmed);
                        }
                    }
                }}
            />,
            doc.defaultView ?? undefined
        );
    });

    container.insertBefore(newItem, row);
}

/**
 * Injects a "Rename" item into Steam's game context menu for every popup window.
 *
 * Steam reminifies its CSS module class names on every build, so querying by class is
 * fragile. Instead, the "Properties…" row (always present, label never changes) is
 * located by its text and cloned as a styling template, giving correct appearance with
 * no dependency on minified identifiers.
 */
export function injectContextMenu(doc: Document) {
    let lastRightClickedName:  string        = "";
    let lastRightClickedAppId: number | null = null;

    // The context menu contains no game name, so capture it from the right-clicked row
    // before the menu opens. Walk upward keeping the widest ancestor whose text is a
    // single short line — this lands on the title rather than a badge or container
    // that mixes in playtime or other text.
    doc.addEventListener("contextmenu", (e) => {
        let name = "";
        let el = e.target as HTMLElement | null;

        for (let depth = 0; el && depth < 10; depth++, el = el.parentElement) {
            const text = el.textContent?.trim() ?? "";
            if (!text || text.includes("\n") || text.length > 100) break;
            // Stop as soon as a parent has more text than the child — it has mixed in
            // sibling content such as status badges ("- Update Queued", etc.).
            if (name && text.length > name.length) break;
            name = text;
        }

        lastRightClickedName  = name;
        lastRightClickedAppId = findAppId(e.target as Element | null);
    }, true);

    // Watch for new nodes — each context menu appears as a fresh DOM subtree.
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;
                tryInjectRenameItem(addedNode as HTMLElement, doc, lastRightClickedName, lastRightClickedAppId);
            }
        }
    });

    // Observe documentElement rather than body: Steam mounts some menus as overlays
    // directly under <html>, outside <body>, which a body-scoped observer would miss.
    observer.observe(doc.documentElement, { childList: true, subtree: true });
}
