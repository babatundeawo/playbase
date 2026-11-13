<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo-dark.svg">
  <img src="docs/assets/logo-light.svg" alt="Naija Monopoly" width="360">
</picture>

**Own Naija, one roll at a time.** A Nigerian-themed Monopoly with the full official rules, free in your browser.

[![Deploy site](https://github.com/babatundeawo/naija-monopoly/actions/workflows/deploy.yml/badge.svg)](https://github.com/babatundeawo/naija-monopoly/actions/workflows/deploy.yml)
[![Live site](https://img.shields.io/website?url=https%3A%2F%2Fbabatundeawo.github.io%2Fnaija-monopoly%2F&label=live%20site)](https://babatundeawo.github.io/naija-monopoly/)
[![License: MIT](https://img.shields.io/badge/license-MIT-008751.svg)](LICENSE)

[**Play now**](https://babatundeawo.github.io/naija-monopoly/) · [Customize](docs/CUSTOMIZING.md) · [Report an issue](https://github.com/babatundeawo/naija-monopoly/issues/new/choose)

</div>

![The Naija Monopoly home page, with the headline "Own Naija. One roll at a time." and the new-game form on the right](docs/assets/preview-home.png)

## About

Naija Monopoly (Wealth Wahala Edition) takes the classic property-trading game to Nigeria. You buy streets from Yaba to Banana Island, ride the Lagos and Kano railways, and pay NEPA when the light is on. It is for two to four players on one device, with any seat playable by a person or the computer. It is a fan-made, unofficial parody and is not affiliated with Hasbro.

## Features

- The full official rule set: ₦1,500 starting cash, ₦200 for passing GO, doubles, jail, taxes and bankruptcy
- Auctions when a player declines to buy, open to every player
- Houses and hotels with even building and a limited bank supply of 32 houses and 12 hotels
- Mortgages (unmortgage at the mortgage value plus 10%) and player-to-player trades of property and cash
- Computer opponents that roll, buy, bid and answer trade offers
- Nigerian flavour throughout: Aza Chance and Ileya Chest cards, Kirikiri Prison, NEPA and NITEL, and tokens such as the Danfo Bus, Okada and Jollof Pot
- Synthesised sound effects you can mute, and a camera that follows the active player or shows the whole board
- Installable on Android, iPhone and desktop, and playable offline once opened
- Your game saves itself on your device, so you can close the tab and resume later
- Light and dark themes, keyboard-friendly controls and a layout that works from phones to wide screens
- Also packaged as a Windows desktop app, built by the repository's *Build Windows EXE* workflow

![A four-player game in progress, with the full board, player cards and dice controls](docs/assets/preview-game.png)

## How to use it

1. Open the [live site](https://babatundeawo.github.io/naija-monopoly/).
2. Choose two to four players. To keep it on your phone, use **Install** (Android) or Share, then **Add to Home Screen** (iPhone).
   Give each a name and a token, and decide whether a person or the computer plays that seat.
3. Select **Start game**, then **Roll dice** on your turn. Landing on a property lets you buy it or send it to auction.
4. Select any property tile to read its deed. Use the left panel to build, and **Propose trade** to deal with another player.
5. The last player who is not bankrupt wins. Open **Rules** at any time for a reminder.

## Tech stack

- Plain HTML, CSS and JavaScript, with no framework and no runtime dependencies
- A service worker for offline play, and a web app manifest for installing
- [Electron](https://www.electronjs.org/) and electron-builder for the Windows app
- GitHub Actions and GitHub Pages for building and hosting
- Fonts: Bricolage Grotesque for headings (self-hosted, no third-party requests) and the visitor's own system font for text

## Project structure

```
src/                  The website and game
  index.html          Page markup and all page text
  css/                Design tokens, base styles, site and game styles
  js/                 Game rules (engine.js), board, rendering, audio, saving (save.js) and app behaviour (pwa.js)
  sw.js               Service worker for offline play
  offline.html        Page shown when a link cannot load without a connection
  assets/             Logo, icons and social preview image
scripts/              Build and check scripts used by GitHub Actions
docs/                 Guides and screenshots
main.js               Electron entry point for the Windows app
.github/              Workflows, Dependabot and issue templates
```

## Contributing

Found a bug or have an idea? [Open an issue](https://github.com/babatundeawo/naija-monopoly/issues/new/choose) on GitHub. To change something yourself, edit a file with the pencil icon on GitHub and propose the change as a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

Please report vulnerabilities privately. See [SECURITY.md](SECURITY.md).

## License and credits

Released under the [MIT License](LICENSE).

Heading font: [Bricolage Grotesque](https://github.com/ateliertriay/bricolage), SIL Open Font License 1.1 (see `src/assets/fonts/OFL-Bricolage-Grotesque.txt`).

- Interface icons are simple line icons adapted from [Feather](https://feathericons.com/) (MIT)
- Tokens and card art use system emoji and illustrations drawn for this project
