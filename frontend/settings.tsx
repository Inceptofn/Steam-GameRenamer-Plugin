import { Field, TextField, DialogButton, ToggleField, pluginConfig } from "@steambrew/client";
import React, { useState, useEffect } from "react";
import { state, RenameMap } from "./state";
import { applyMapChange } from "./dom";
import { applyAllCustomSortAs } from "./steam";

/** Plugin settings panel rendered inside Millennium's Configure tab. */
export const SettingsContent = () => {
    const [map,         setMap        ] = useState<RenameMap>(() => ({ ...state.currentMap }));
    const [newOriginal, setNewOriginal] = useState("");
    const [newRenamed,  setNewRenamed ] = useState("");
    const [sortChecked, setSortChecked] = useState(() => state.sortEnabled);

    // Sync from pluginConfig on mount in case the component rendered before startup
    // config loading resolved (Millennium renders settings content immediately).
    useEffect(() => {
        pluginConfig.get<boolean>("sortByCustomName")
            .then(val => { const v = val ?? false; state.sortEnabled = v; setSortChecked(v); })
            .catch(() => {});
        pluginConfig.get<RenameMap>("renameMap")
            .then(val => { if (val != null) { state.currentMap = val; setMap({ ...val }); } })
            .catch(() => {});
    }, []);

    const updateMap = (next: RenameMap) => {
        setMap(next);
        applyMapChange(next);
    };

    const addEntry = () => {
        const orig = newOriginal.trim();
        const repl = newRenamed.trim();
        if (!orig || !repl) return;
        updateMap({ ...map, [orig]: repl });
        setNewOriginal("");
        setNewRenamed("");
    };

    const removeEntry = (key: string) => {
        const next = { ...map };
        delete next[key];
        updateMap(next);
    };

    const updateEntry = (key: string, value: string) => {
        updateMap({ ...map, [key]: value });
    };

    // Field lays its direct children out in a single row. A single column-flex wrapper
    // gives full control over layout inside each settings entry.
    const fullWidth: React.CSSProperties = { width: "100%", boxSizing: "border-box" };
    const column:    React.CSSProperties = { display: "flex", flexDirection: "column", width: "100%", rowGap: "8px" };
    const label:     React.CSSProperties = { fontSize: "12px", opacity: 0.6 };

    return (
        <div data-freakbydaylight-ignore="" style={fullWidth}>

            <ToggleField
                label="Sort library by custom name"
                description="Sets Steam's sort-as field when you rename a game. Turn off to stop affecting library sort order."
                checked={sortChecked}
                onChange={(checked) => {
                    state.sortEnabled = checked;
                    setSortChecked(checked);
                    pluginConfig.set("sortByCustomName", checked);
                    applyAllCustomSortAs(checked);
                }}
                bottomSeparator="standard"
            />

            {Object.entries(map).map(([original, renamed]) => (
                <Field key={original} label={original} bottomSeparator="standard" childrenLayout="below" focusable>
                    <div style={column}>
                        <div style={label}>Rename to</div>
                        <TextField
                            style={fullWidth}
                            value={renamed}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEntry(original, e.currentTarget.value)}
                        />
                        <DialogButton style={fullWidth} onClick={() => removeEntry(original)}>
                            Remove
                        </DialogButton>
                    </div>
                </Field>
            ))}

            <Field
                label="Add rename rule"
                description="Enter the original game name and what to rename it to."
                bottomSeparator="none"
                childrenLayout="below"
                focusable
            >
                <div style={column}>
                    <div style={label}>Original name</div>
                    <TextField
                        style={fullWidth}
                        placeholder="e.g. Counter-Strike 2"
                        value={newOriginal}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOriginal(e.currentTarget.value)}
                    />
                    <div style={label}>New name</div>
                    <TextField
                        style={fullWidth}
                        placeholder="e.g. Frag Simulator 2"
                        value={newRenamed}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRenamed(e.currentTarget.value)}
                    />
                    <DialogButton style={fullWidth} onClick={addEntry}>
                        Add rule
                    </DialogButton>
                </div>
            </Field>

        </div>
    );
};
