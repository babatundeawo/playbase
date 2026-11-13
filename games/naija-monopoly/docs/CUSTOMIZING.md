# Customizing the site

Open any file on GitHub, select the pencil icon, edit, and follow the steps in [DEPLOYMENT.md](DEPLOYMENT.md) to publish.

## Colours

`src/css/tokens.css`. Each colour appears twice: once in the first `:root` block (light mode) and once in the two dark blocks below it (dark mode). Change both. The main ones:

- `--green`: primary brand colour
- `--gold-fill`: accent colour
- `--bg`, `--surface`, `--text`: page background, cards and text

Board colour groups (`--brown`, `--lightblue` and so on) are at the bottom of the same file.

## Text

All page text is in `src/index.html`: the headline, feature cards, neighbourhood cards and rules. The game's messages and cards are in `src/js/data.js` (card text) and `src/js/engine.js` (log messages).

## Board names, prices and cards

`src/js/data.js`, in the `TILES`, `CHANCE_CARDS` and `CHEST_CARDS` lists. Rents are calculated from each property's price. If you change prices, update the matching text in `src/index.html`.

## Fonts

Headings use **Bricolage Grotesque**, stored in `src/assets/fonts/` and declared in `src/css/fonts.css`. Body text uses each visitor's own system font, so almost nothing is downloaded. `--font-display` and `--font-body` in `src/css/tokens.css` list the fonts in order of preference. To swap the heading font: upload a `.woff2` file to `src/assets/fonts/`, add an `@font-face` rule (with `font-display: swap`) to `src/css/fonts.css`, and put the font's name first in `--font-display`. Use only fonts whose licence allows web use, and keep their licence file next to them. The Content Security Policy already allows fonts from this site.

## Images and icons

Logo, favicons and the social preview image are in `src/assets/`. Replace them with files of the same name and size: `favicon.svg`, `favicon-32.png` (32 px), `apple-touch-icon.png` (180 px), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` and `og-image.png` (1200 × 630). The header logo is the inline SVG at the top of `src/index.html`. `icon.png` in the repository root (256 px) is the Windows app icon.

## Screenshots

`docs/assets/preview-home.png` and `preview-game.png` appear in the README. The install dialog on phones uses the four images in `src/assets/screenshots/` (two 1440 × 900, two 780 × 1688). Replace them whenever the look changes, keeping the same sizes.

## Offline and updates

The build keeps every page file on the visitor's device. When you publish a change, phones notice it automatically and show a **Refresh** notice. You do not need to do anything.
