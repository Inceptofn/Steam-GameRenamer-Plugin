import { Millennium, definePlugin, sleep, IconsModule } from "@steambrew/client";
import { state, loadPersistedConfig } from "./state";
import { injectContextMenu } from "./contextMenu";
import { SettingsContent } from "./settings";
import { applyAllCustomSortAs, applyAllRenames, subscribeToOverviewChanges } from "./steam";
import { watchDocument } from "./dom";

async function OnPopupCreation(popup: any) {
    await sleep(500);
    const doc: Document = popup.m_popup?.document;
    if (!doc) return;
    watchDocument(doc);
    injectContextMenu(doc);
}

/** Waits until Steam's app list is populated so renames have overviews to write to. */
async function whenAppsReady(): Promise<void> {
    for (let i = 0; i < 60; i++) {
        if (((window.appStore as any)?.m_mapApps?.size ?? 0) > 0) return;
        await sleep(500);
    }
}

export default definePlugin(async () => {
    loadPersistedConfig();

    whenAppsReady().then(() => {
        applyAllRenames();
        applyAllCustomSortAs(state.sortEnabled);
    });

    // Rewrite any already-open windows; AddWindowCreateHook covers ones opened later.
    for (const doc of state.watchedDocuments) watchDocument(doc);

    // Steam keeps refreshing app overviews after startup, which wipes our overrides.
    // Re-apply on every overview change so custom names persist across restarts.
    subscribeToOverviewChanges();

    Millennium.AddWindowCreateHook!(OnPopupCreation);
    return {
        title:   "Game Renamer",
        icon:    <IconsModule.Settings />,
        content: <SettingsContent />,
    };
});
