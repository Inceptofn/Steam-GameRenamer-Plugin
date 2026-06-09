# Game Renamer

A Millennium plugin that lets you display custom names for games in your Steam library.

## Features

- Right-click any game in your library and select **Set custom name…** to rename it
- The original game name is shown in the rename dialog alongside its header artwork
- Renaming is non-destructive — clear the custom name at any time to restore the original
- **Sort by custom name** — optionally sets Steam's internal sort field so the library sort order reflects your custom names
  - Toggle this on or off from the plugin settings
  - Disabling the toggle clears all custom sort overrides immediately

## Configuration

- Open Millennium settings and click **Configure** on the Game Renamer plugin
- Add or remove rename rules manually from the settings panel
- Toggle **Sort library by custom name** on or off

## Prerequisites

- [Millennium](https://steambrew.app/)

## Installation

- Copy the plugin ID from the [Millennium plugins](https://steambrew.app/plugins) page
- Click **Plugins** and **Install a plugin** in the Millennium settings and paste the ID
- Allow 10 seconds for the plugin to load after each startup

## Installation — dev build

- Clone or download this repository
- Place the folder under your Millennium plugins directory (usually `C:\Program Files (x86)\Steam\plugins`)
- Enable the plugin in the Millennium settings if needed
- Run `npm install && npm run build` inside the plugin folder
- Allow 10 seconds for the plugin to load after each startup
