import { showModal, ConfirmModal, TextField } from "@steambrew/client";
import React, { useState } from "react";
import { state, saveConfig, MAX_NAME_LENGTH } from "./state";
import { findAppId } from "./dom";
import { enableSortFor, disableSortFor, applyMapChange, getOriginalName } from "./steam";

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
            strTitle={`Rename "${originalName}"`}
            strDescription="Enter the name you'd like to display instead:"
            strOKButtonText="Save"
            closeModal={closeModal}
            onOK={() => onConfirm(value)}
        >
            <TextField
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value.slice(0, MAX_NAME_LENGTH))}
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

/** The element's React fiber, or null. */
function getReactFiber(el: Element): any {
    const key = Object.keys(el).find(k => k.startsWith("__reactFiber$"));
    return key ? (el as any)[key] : null;
}

/**
 * Steam's localized label for the game context menu's "Manage" submenu.
 *
 * Resolved from Steam's own localization system (`#GameAction_Manage`) rather than
 * matching the English word, so the Manage flyout is found in every UI language. Cached
 * after the first successful lookup.
 */
let cachedManageLabel: string | null = null;
function manageLabel(): string | null {
    if (cachedManageLabel) return cachedManageLabel;
    const lm = (window as any).LocalizationManager;
    const resolved = lm?.LocalizeString?.("#GameAction_Manage");
    if (typeof resolved === "string" && resolved.trim()) cachedManageLabel = resolved.trim();
    return cachedManageLabel;
}

/**
 * If `root` is (part of) the Manage submenu flyout, returns one of its item rows;
 * otherwise null.
 *
 * Steam mounts each submenu as its own DOM subtree, and every menu carries its title in
 * the React fiber as `{ label, children: [...] }`. The flyout's enclosing menu fiber has
 * `label` equal to the localized "Manage" string, while the top-level menu's enclosing
 * fiber has the game's name — so matching that label pinpoints the Manage flyout without
 * reading on-screen text or relying on row order/count. Tracking the *highest* labelled
 * menu fiber skips the Manage item's own submenu definition nested in the top-level menu
 * (whose label is also "Manage") and lands on the subtree's true container.
 */
function findManageFlyout(root: HTMLElement): HTMLElement | null {
    const wanted = manageLabel();
    if (!wanted) return null;

    const item = (root.matches?.('[role="menuitem"]')
        ? root
        : root.querySelector('[role="menuitem"]')) as HTMLElement | null;
    if (!item) return null;

    let menuLabel: string | null = null;
    for (let fiber = getReactFiber(item), depth = 0; fiber && depth < 15; fiber = fiber.return, depth++) {
        const props = fiber.memoizedProps;
        if (props && typeof props.label === "string" && Array.isArray(props.children)) {
            menuLabel = props.label;
        }
    }

    return menuLabel === wanted ? item : null;
}

/** The leaf element inside a menu row that holds its visible text. */
function findRowLabelLeaf(row: HTMLElement): HTMLElement {
    if (row.children.length === 0) return row;
    for (const el of Array.from(row.querySelectorAll("*")) as HTMLElement[]) {
        if (el.children.length === 0 && (el.textContent?.trim() ?? "")) return el;
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
 * Inspects a newly added DOM node and, if it is the game's Manage submenu flyout,
 * inserts a Rename item at the top of it.
 */
function tryInjectRenameItem(
    root: HTMLElement,
    doc: Document,
    gameName: string,
    appId: number | null,
) {
    if (root.classList?.contains("renamed-item")) return;

    const row = findManageFlyout(root);
    if (!row) return;

    const container = row.parentElement;
    if (!container) return;

    if (container.querySelector(".renamed-item")) return;
    if (!gameName && appId == null) return;

    // Resolve the game's *original* name. getOriginalName returns the pre-override
    // name even after we've overwritten display_name (it reads the stashed original),
    // and free of status badges like "- Update Queued". Fall back to reverse-mapping
    // the captured row text when there's no appId.
    const storedName = appId != null ? getOriginalName(appId) : null;

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

    const label     = findRowLabelLeaf(row);
    const labelPath = buildLabelPath(label, row);
    const newItem   = row.cloneNode(true) as HTMLElement;
    newItem.classList.add("renamed-item");

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

    const rowPropsEl = findReactPropsElement(label, container);

    newItem.addEventListener("mouseenter", () => {
        if (rowPropsEl) {
            const propsKey = Object.keys(rowPropsEl).find(k => k.startsWith("__reactProps$"))!;
            const props    = (rowPropsEl as any)[propsKey];
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
                    const trimmed   = value.trim().slice(0, MAX_NAME_LENGTH);
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

                        if (state.sortEnabled) {
                            if (reverting) disableSortFor(originalName, appId);
                            else           enableSortFor(originalName, appId, trimmed);
                        }
                        saveConfig();
                    }
                }}
            />,
            doc.defaultView ?? undefined
        );
    });

    // Place Rename at the top of the Manage flyout.
    container.insertBefore(newItem, container.firstElementChild);
}

/**
 * Injects a "Rename" item into Steam's game context menu for every popup window.
 *
 * Steam reminifies its CSS module class names on every build, so querying by class is
 * fragile. Instead the Manage submenu flyout is identified through its React fiber (its
 * menu label matches Steam's localized "Manage" string), and one of its rows is cloned
 * as a styling template — giving correct appearance with no dependency on minified
 * identifiers or on the UI language.
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
