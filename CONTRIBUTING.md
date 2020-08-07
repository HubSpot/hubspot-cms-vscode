# Contributing
Anyone should feel free to fork/PR this. Open source for the win!
Please make sure and explain your changes thoroughly, update version and changelog where needed.

_NOTE_: HubL tags, functions, expression tests and filters are all pulled from the `cos-rendering/v1/hubldoc` api, so do not update any `snippets/auto-gen/...` json files manually. Run `npm run generate` to re-generate these JSON files when HubL changes occur. `snippets/man_gen/...` files are for any extra/helpful snippets used in HubL - these files are maintained manually.

### To run this extension locally:
- `git clone` repo
- Open this project in Visual Studio Code
- Press `f5` to launch a new VSCode window with the extension installed
- Press `CMD` + `R` to reload the window after having made any changes
