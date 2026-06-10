import { state, RenameMap, saveConfig } from "./state";
import { applyRenameToDocuments } from "./dom";

// ─── Sort-as ───────────────────────────────────────────────────────────────────

/**
 * Sets Steam's internal sort-as string for a game.
 *
 * `appStore.SetCustomSortAs` is absent from the community typings. It was found by
 * scanning every object on `window` — it matches the "Custom Sort Name" field in
 * Steam's own Properties dialog.
 *
 * Pass an empty string to clear the override and restore default sort order.
 */
export function setCustomSortAs(appId: number, sortAs: string) {
    const store = window.appStore as any;
    if (!store?.SetCustomSortAs) return;
    // Skip when it's already correct: avoids needless work and prevents a feedback
    // loop with the overview-change listener (SetCustomSortAs itself emits a change).
    const ov = store.GetAppOverviewByAppID?.(appId);
    if (ov && (ov.sort_as ?? "") === sortAs) return;
    store.SetCustomSortAs.call(store, appId, sortAs);
}

function liveSortAs(appId: number): string {
    const ov = (window.appStore as any)?.GetAppOverviewByAppID?.(appId);
    return ov?.sort_as ?? "";
}

/**
 * Turns our custom sort order ON for one game: stashes the user's own sort-as the
 * first time (so it can be restored later) and sets the renamed name as the sort key.
 */
export function enableSortFor(original: string, appId: number, renamed: string) {
    if (!(original in state.originalSortAs)) {
        state.originalSortAs[original] = liveSortAs(appId);
    }
    setCustomSortAs(appId, renamed);
}

/**
 * Turns our custom sort order OFF for one game by restoring the user's *own* sort-as.
 * If we never overrode this game, it's left completely untouched — we must never blank
 * out a custom sort name the user set themselves.
 */
export function disableSortFor(original: string, appId: number) {
    if (!(original in state.originalSortAs)) return;
    setCustomSortAs(appId, state.originalSortAs[original]);
    delete state.originalSortAs[original];
}

/**
 * Applies or restores the sort-as string for every renamed game.
 * Called when the "Sort library by custom name" toggle changes and at startup.
 */
export function applyAllCustomSortAs(enabled: boolean) {
    for (const [original, renamed] of Object.entries(state.currentMap)) {
        const appId = state.appIdMap[original] ?? findAppIdByName(original);
        if (appId == null) continue;
        if (enabled) enableSortFor(original, appId, renamed);
        else         disableSortFor(original, appId);
    }
    saveConfig();
}

// ─── Display-name override (data layer) ─────────────────────────────────────────

const ORIGINAL_MARKER = "__gr_originalName";

function appMap(): Map<number, any> | null {
    return (window.appStore as any)?.m_mapApps ?? null;
}

/** The real, pre-override name of a game, or null if its overview isn't loaded yet. */
export function getOriginalName(appId: number): string | null {
    const ov = (window.appStore as any)?.GetAppOverviewByAppID?.(appId);
    if (!ov) return null;
    return ov[ORIGINAL_MARKER] ?? ov.display_name ?? null;
}

/** Finds the appId of a game by its original (pre-override) display name. */
export function findAppIdByName(name: string): number | null {
    const map = appMap();
    if (!map) return null;
    for (const ov of map.values()) {
        const original = ov[ORIGINAL_MARKER] ?? ov.display_name;
        if (original === name) return ov.appid;
    }
    return null;
}

/**
 * Overrides a game's library name at Steam's data layer, or restores the original
 * when `name` is null/blank/equal to the original.
 *
 * `display_name` is a plain field on the app overview; React renders the library from
 * it but only repaints a row when that overview's entry in the MobX-observable
 * `m_mapApps` changes *reference* (writing the field in place is a no-op for repaint).
 * So a prototype-preserving clone — keeping every `BIs…()` method intact — carries the
 * new name and is written back into the map, repainting the visible row immediately and
 * updating every other place Steam reads the name (detail page, search, tooltips).
 *
 * The true original is stashed on the clone (`__gr_originalName`) so renaming stays
 * reversible and the context menu can still surface the real name after an override.
 */
export function setDisplayName(appId: number, name: string | null) {
    const map = appMap();
    const ov = map?.get(appId);
    if (!map || !ov) return;

    const original = ov[ORIGINAL_MARKER] ?? ov.display_name;

    // Skip if the overview is already in the desired state. This keeps the
    // overview-change listener from churning repaints on every Steam update.
    const overriding = !!(name && name !== original);
    const desiredName   = overriding ? name     : original;
    const desiredMarker = overriding ? original : undefined;
    if (ov.display_name === desiredName && (ov[ORIGINAL_MARKER] ?? undefined) === desiredMarker) return;

    const clone = Object.assign(Object.create(Object.getPrototypeOf(ov)), ov);

    if (name && name !== original) {
        clone[ORIGINAL_MARKER] = original;
        clone.display_name = name;
    } else {
        delete clone[ORIGINAL_MARKER];
        clone.display_name = original;
    }

    map.set(appId, clone);
}

// ─── Rename map application ─────────────────────────────────────────────────────

/**
 * Commits a new rename map and pushes the differences to Steam's data layer.
 * Only entries that actually changed are touched.
 */
export function applyMapChange(next: RenameMap) {
    const prev = state.currentMap;
    state.currentMap = next;

    const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
    for (const original of allKeys) {
        if (prev[original] === next[original]) continue;

        const appId = state.appIdMap[original] ?? findAppIdByName(original);
        if (appId == null) continue;

        const renamed = next[original];
        setDisplayName(appId, renamed ?? null);

        if (renamed != null) state.appIdMap[original] = appId;
        else                 delete state.appIdMap[original];
    }

    // Update already-rendered surfaces the data layer doesn't reach (detail-page header).
    applyRenameToDocuments(prev, next);
    saveConfig();
}

/** Re-applies every saved rename. Called once the app list is ready at startup. */
export function applyAllRenames() {
    for (const [original, renamed] of Object.entries(state.currentMap)) {
        const appId = state.appIdMap[original] ?? findAppIdByName(original);
        if (appId == null) continue;
        state.appIdMap[original] = appId;
        setDisplayName(appId, renamed);
    }
    saveConfig();
}

/**
 * Re-pushes every saved rename (and our sort-as override, when enabled) to the live
 * app store. Idempotent — guards in setDisplayName/setCustomSortAs make repeated calls
 * cheap. Used to recover after Steam replaces overview objects post-startup.
 */
function reapplyAll() {
    for (const [original, renamed] of Object.entries(state.currentMap)) {
        const appId = state.appIdMap[original] ?? findAppIdByName(original);
        if (appId == null) continue;
        setDisplayName(appId, renamed);
        // Only re-push sort-as we already own; never stash a clobbered value as "original".
        if (state.sortEnabled && original in state.originalSortAs) {
            setCustomSortAs(appId, renamed);
        }
    }
}

/**
 * Steam streams app-overview updates after startup that replace overview objects in
 * m_mapApps, wiping our display-name override and resetting sort-as. Re-apply on every
 * such change (coalesced) so custom names survive a restart and stay put.
 */
export function subscribeToOverviewChanges() {
    let pending = false;
    SteamClient.Apps.RegisterForAppOverviewChanges(() => {
        if (pending) return;
        pending = true;
        setTimeout(() => { pending = false; reapplyAll(); }, 100);
    });
}
