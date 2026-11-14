# Playbase

One home for all my games. Visitors open a single link and browse a carousel of every game, with details for each one, then play it right in the browser. Each game stays self-contained in its own folder.

**Live site:** https://babatundeawo.github.io/playbase/

## Games

| Game | Folder | What it is |
| --- | --- | --- |
| Naija Monopoly | `games/naija-monopoly` | Nigerian-themed Monopoly, 2-4 players, computer opponents |
| QuizMaster | `games/quizmaster` | 400-question quiz with online leaderboards |
| Millionaire Mindset | `games/millionaire-mindset` | 15-question prize ladder with lifelines |
| Kingdom Quiz | `games/bible-trivia-game` | Host-led Bible trivia with live audience voting |
| Bible Family Feud | `games/bible-family-feud` | Two-team Family Feud for church events |

## How it works

```
hub/            the carousel page (reads games.json, knows nothing about any one game)
games/<id>/     one folder per game, each with its own game.json
scripts/        build.mjs assembles everything into dist/, serve.mjs previews it, game-bar/ is the Home bar
docs/           adding a game, deployment
.github/        the workflow that builds and publishes the site
```

The hub has a light and a dark theme (it follows the device, with a toggle to choose), and takes its colour from the featured game. Inside each game, a small Home / Back to start bar is added by the build.

Every game describes itself in `games/<id>/game.json`: title, description, tags, colour, cover and how to build it. The build reads those files, builds each game, and generates the catalogue the hub displays. Adding a game means adding a folder. See [docs/ADDING-A-GAME.md](docs/ADDING-A-GAME.md).

## Run it on your computer

Needs Node 22 and Python 3.

```bash
node scripts/build.mjs --preview     # builds everything with placeholder secrets
node scripts/serve.mjs               # then open http://localhost:8080/playbase/
```

## Publishing

Merging into `main` builds and publishes the site. One-time setup is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Where the games came from

Each game was moved here from its own repository with its code unchanged apart from the changes needed to run from a subfolder (site addresses, offline cache names, build paths) and two small fixes that stop decorations from making a phone screen scroll sideways (Bible Family Feud and QuizMaster). The original repositories are untouched.

Each game keeps its own licence and credits in its folder.
