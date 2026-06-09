import { Millennium, definePlugin, sleep, IconsModule } from "@steambrew/client";
import { state, loadPersistedConfig } from "./state";
import { renameNodes, watchDocument } from "./dom";
import { injectContextMenu } from "./contextMenu";
import { SettingsContent } from "./settings";
import { applyAllCustomSortAs } from "./steam";

async function OnPopupCreation(popup: any) {
    await sleep(500);
    const doc: Document = popup.m_popup?.document;
    if (!doc) return;
    watchDocument(doc);
    injectContextMenu(doc);
}

export default definePlugin(async () => {
    loadPersistedConfig();
    applyAllCustomSortAs(state.sortEnabled);

    for (const doc of state.watchedDocuments) {
        renameNodes(doc.documentElement, state.currentMap);
    }

    Millennium.AddWindowCreateHook!(OnPopupCreation);
    return {
        title:   "Game Renamer",
        icon:    <IconsModule.Settings />,
        content: <SettingsContent />,
    };
});
