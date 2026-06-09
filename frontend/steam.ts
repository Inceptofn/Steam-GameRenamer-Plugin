import { state } from "./state";

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
