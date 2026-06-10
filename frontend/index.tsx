import { Millennium, definePlugin, sleep, IconsModule } from "@steambrew/client";
import { state, loadPersistedConfig } from "./state";
import { injectContextMenu } from "./contextMenu";
import { SettingsContent } from "./settings";
import { applyAllCustomSortAs, applyAllRenames } from "./steam";

async function OnPopupCreation(popup: any) {
    await sleep(500);
    const doc: Document = popup.m_popup?.document;
    if (!doc) return;
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

    Millennium.AddWindowCreateHook!(OnPopupCreation);
    return {
        title:   "Game Renamer",
        icon:    <IconsModule.Settings />,
        content: <SettingsContent />,
    };
});
