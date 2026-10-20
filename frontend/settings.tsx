import { Field, TextField, DialogButton, ToggleField } from "@steambrew/client";
import React, { useState } from "react";
import { state, saveConfig, MAX_NAME_LENGTH } from "./state";
import type { RenameMap } from "./state";
import { applyMapChange, applyAllCustomSortAs } from "./steam";
import { format, strings } from "./locales";

/** Uppercase, muted section heading — mirrors the theme settings' section style. */
const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <div
        style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            opacity: 0.5,
            margin: "18px 0 2px",
        }}
    >
        {children}
    </div>
);

export const SettingsContent = () => {
    const locale = strings();
    const [map,         setMap        ] = useState<RenameMap>(() => ({ ...state.currentMap }));
    const [sortChecked, setSortChecked] = useState(() => state.sortEnabled);

    const updateMap = (next: RenameMap) => {
        setMap(next);
        applyMapChange(next);
    };

    const removeEntry = (key: string) => {
        const next = { ...map };
        delete next[key];
        updateMap(next);
    };

    const updateEntry = (key: string, value: string) => {
        updateMap({ ...map, [key]: value.slice(0, MAX_NAME_LENGTH) });
    };

    const fullWidth: React.CSSProperties = { width: "100%", boxSizing: "border-box" };
    const rowControls: React.CSSProperties = { display: "flex", gap: "8px", alignItems: "center", width: "100%" };

    const entries = Object.entries(map);

    return (
        // data-gr-ignore opts this panel out of DOM text rewriting so the rule list
        // keeps showing the real (original) game names, not their custom names.
        <div style={fullWidth} data-gr-ignore="">

            <SectionHeader>{locale.options}</SectionHeader>
            <ToggleField
                label={locale.sortLabel}
                description={locale.sortDescription}
                checked={sortChecked}
                onChange={(checked) => {
                    state.sortEnabled = checked;
                    setSortChecked(checked);
                    saveConfig();
                    applyAllCustomSortAs(checked);
                }}
                bottomSeparator="none"
            />

            <SectionHeader>{format(locale.yourRenames, { count: entries.length })}</SectionHeader>
            {entries.length === 0 ? (
                <div style={{ fontSize: "13px", opacity: 0.5, padding: "4px 0 8px" }}>
                    {locale.noCustomNames}
                </div>
            ) : (
                entries.map(([original, renamed]) => (
                    // Compact row: original name on the left (Field label), custom-name
                    // field + remove button on the right (inline children).
                    <Field key={original} label={original} bottomSeparator="standard">
                        <div style={rowControls}>
                            <TextField
                                style={{ flex: 1 }}
                                value={renamed}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEntry(original, e.currentTarget.value)}
                            />
                            <DialogButton
                                style={{ width: "auto", minWidth: 0, padding: "0 12px" }}
                                onClick={() => removeEntry(original)}
                            >
                                ✕
                            </DialogButton>
                        </div>
                    </Field>
                ))
            )}

        </div>
    );
};
