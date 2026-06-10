export type RenameMap = Record<string, string>;

/** Maximum length of a custom game name. */
export const MAX_NAME_LENGTH = 64;

const STORAGE_KEY = "GameRenamer.config";

export const state = {
    currentMap:  {} as RenameMap,
    sortEnabled: false,
    appIdMap:    {} as Record<string, number>,
};

export function loadPersistedConfig(): void {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            if (saved.renameMap && typeof saved.renameMap === "object") state.currentMap = saved.renameMap;
            if (typeof saved.sortByCustomName === "boolean") state.sortEnabled = saved.sortByCustomName;
            if (saved.appIdMap && typeof saved.appIdMap === "object") {
                state.appIdMap = Object.fromEntries(
                    Object.entries(saved.appIdMap).map(([k, v]) => [k, Number(v)])
                );
            }
            return;
        }
    } catch {}
    // Migrate from old separate keys (first run after upgrade)
    try {
        const raw = localStorage.getItem("GameRenamer.renameMap");
        if (raw) state.currentMap = JSON.parse(raw);
    } catch {}
    try {
        const raw = localStorage.getItem("GameRenamer.appIdMap");
        if (raw) {
            const parsed = JSON.parse(raw);
            state.appIdMap = Object.fromEntries(
                Object.entries(parsed).map(([k, v]) => [k, Number(v)])
            );
        }
    } catch {}
}

export function saveConfig(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sortByCustomName: state.sortEnabled,
        renameMap: state.currentMap,
        appIdMap: state.appIdMap,
    }));
}
