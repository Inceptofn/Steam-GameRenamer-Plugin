import { state, RenameMap, saveConfig } from "./state";

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
    store?.SetCustomSortAs?.call(store, appId, sortAs);
}

/**
 * Applies or clears the sort-as string for every game that has a known appId.
 * Called when the "Sort library by custom name" toggle changes.
 */
export function applyAllCustomSortAs(enabled: boolean) {
    for (const [originalName, renamedName] of Object.entries(state.currentMap)) {
        const appId = state.appIdMap[originalName];
        if (appId != null) {
            setCustomSortAs(appId, enabled ? renamedName : "");
        }
    }
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
