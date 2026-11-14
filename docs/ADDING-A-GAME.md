# Adding a game

A game is a folder with a `game.json` file. Add one and it appears in the carousel on the next deploy. You never edit the hub page.

## Steps

1. Create `games/<id>/` (lowercase, dashes, for example `games/word-hunt/`).
2. Put the whole game inside it, as it would run on its own.
3. Add `games/<id>/game.json` (template below). The `id` must match the folder name.
4. Add a cover screenshot inside the folder and point `cover` at it (landscape, about 1440 x 900 works best).
5. Open a pull request. The checks build everything and report problems; nothing goes live until you merge.

## game.json

```json
{
  "id": "word-hunt",
  "title": "Word Hunt",
  "tagline": "One short line shown under the title.",
  "description": "Two or three sentences about how the game works.",
  "category": "Puzzle",
  "tags": ["Puzzle", "Solo"],
  "players": "1 player",
  "features": ["First thing worth knowing", "Second thing"],
  "accent": "#2f7d5b",
  "cover": "docs/cover.png",
  "featured": false,
  "order": 10,
  "build": {
    "install": "npm install",
    "command": "node scripts/build.mjs",
    "output": "dist",
    "env": { "SITE_URL": "{site}" },
    "checks": ["npm test"]
  }
}
```

| Field | What it does |
| --- | --- |
| `category` | Games with the same category share a row. |
| `accent` | The game's own colour. The hub tints its top section, buttons and card edge with it. Pick a mid-to-strong colour; the hub chooses white or dark button text automatically. |
| `bar` | Optional. `false` leaves out the Home and Back to start bar for this game. |
| `featured` | `true` makes it the game shown at the top. If none is set, a random game is shown each visit. |
| `order` | Lower numbers come first. Optional. |
| `build.install` | Optional. Runs first, for example `npm install`. |
| `build.command` | Builds the game. |
| `build.output` | The folder the build produces. It must contain `index.html`. |
| `build.env` | `{site}` becomes the game's full address with a slash at the end, and `{siteNoSlash}` the same without it. A value starting with `$` is read from a repository secret. |
| `build.checks` | Optional commands that must pass. |

A game with no build step still needs a `build.command` that produces its `output` folder. Keep the finished site in a `public/` folder and use `"command": "node -e \"require('fs').cpSync('public', 'dist', {recursive: true})\""`.

## The Home and Back to start bar

The build adds a small floating bar to the bottom-left of every game's `index.html`:

- **Home** goes to the carousel.
- **Back to start** goes to the game's front page. If the player has already done something, it first asks, because it ends the current round.

On a long page the bar slides out of the way while scrolling down and returns when scrolling up. You do not need to add anything to your game. Two things to know:

- It is added to `index.html` only, so a game's other pages (like Bible Family Feud's host window) are left alone.
- Keep the bottom-left corner of your game's front screen free of important buttons that never scroll.

## Rules that keep games from affecting each other

- **Use relative links.** The game is served from `/playbase/games/<id>/`, not from the top of a site. Write `css/app.css`, not `/css/app.css`.
- **Name your offline cache with a prefix of your own**, for example `pb-word-hunt-`, and only delete caches that start with it. Every game shares one web address, so a game that clears "all caches" would wipe the others.
- **Prefix saved settings** (localStorage keys) with the game's name for the same reason.
- **Keep each game's own backend separate.** Games that use Firebase keep their own project and rules.

## Trying it on your computer

```bash
node scripts/build.mjs --preview          # build everything with placeholder secrets
node scripts/build.mjs --only word-hunt   # build one game (faster)
node scripts/serve.mjs                    # open http://localhost:8080/playbase/
```
