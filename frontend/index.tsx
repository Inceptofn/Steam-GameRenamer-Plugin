import { Millennium, definePlugin, sleep, IconsModule, pluginConfig } from "@steambrew/client";
import { state, RenameMap } from "./state";
import { renameNodes, watchDocument } from "./dom";
import { applyAllCustomSortAs } from "./steam";
import { injectContextMenu } from "./contextMenu";
import { SettingsContent } from "./settings";

/** Called by Millennium for every new Steam popup window. */
async function OnPopupCreation(popup: any) {
    await sleep(500);
    const doc: Document = popup.m_popup.document;
    if (!doc) return;
    watchDocument(doc);
    injectContextMenu(doc);
}

export default definePlugin(async () => {
    console.log("[FreakByDaylight] Starting up");

    Promise.all([
        pluginConfig.get<RenameMap>("renameMap").catch((): null => null),
        pluginConfig.get<Record<string, number>>("appIdMap").catch((): null => null),
        pluginConfig.get<boolean>("sortByCustomName").catch((): null => null),
    ]).then(([storedMap, storedIds, storedSort]) => {
        if (storedMap == null) {
            // One-time migration from localStorage on the first run after switching to pluginConfig.
            try {
                const raw = localStorage.getItem("FreakByDaylight.renameMap");
                if (raw) state.currentMap = JSON.parse(raw);
            } catch {}
        } else {
            state.currentMap = storedMap;
            // Data is confirmed in pluginConfig — remove the stale localStorage copy so it
            // can never override pluginConfig if a future read fails.
            localStorage.removeItem("FreakByDaylight.renameMap");
        }

        if (storedIds == null) {
            try {
                const raw = localStorage.getItem("FreakByDaylight.appIdMap");
                if (raw) state.appIdMap = JSON.parse(raw);
            } catch {}
        } else {
            state.appIdMap = storedIds;
            localStorage.removeItem("FreakByDaylight.appIdMap");
        }

        state.sortEnabled = storedSort ?? false;
        if (!state.sortEnabled) applyAllCustomSortAs(false);

        // Re-apply renames to any documents that opened before config resolved.
        for (const doc of state.watchedDocuments) {
            renameNodes(doc.documentElement, state.currentMap);
        }
    });

    Millennium.AddWindowCreateHook!(OnPopupCreation);
    return {
        title:   "Game Renamer",
        icon:    <IconsModule.Settings />,
        content: <SettingsContent />,
    };
});
