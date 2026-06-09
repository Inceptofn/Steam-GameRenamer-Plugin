export type RenameMap = Record<string, string>;

export const state = {
    currentMap:      {} as RenameMap,
    sortEnabled:     false,
    appIdMap:        {} as Record<string, number>,
    watchedDocuments: new Set<Document>(),
};
