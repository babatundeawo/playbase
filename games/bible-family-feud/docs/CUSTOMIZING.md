# Customizing guide

Everything is editable on the GitHub website: open a file, select the pencil icon, change it, and select **Commit changes**. See [DEPLOYMENT.md](DEPLOYMENT.md) for how changes go live.

## Questions and answers

File: `js/questions.js`. Each round has a label, a question and **exactly eight** answers, highest points first. Changing the words on screen only needs this file. A check runs on every change and tells you if a round has the wrong number of answers.

The show title and subtitle used in the browser tab are at the bottom of that file under `SHOW_INFO`.

## Colors

File: `css/style.css`, at the top, under `TOKENS`.

| Setting | What it controls |
| --- | --- |
| `--gold`, `--gold-soft`, `--gold-deep` | Brand color, Team 1, buttons, revealed tiles |
| `--sky`, `--sky-soft` | Team 2 (jewel teal) |
| `--ink-950` … `--ink-600` | Background and panel shades |
| `--text`, `--text-muted` | Main and secondary text |
| `--success`, `--warning`, `--error`, `--info` | Status colors (strikes, banners) |

Change a color value there and it updates everywhere. Also update `theme-color` in `index.html` and `manifest.webmanifest` if you change `--ink-900`.

The stage is dark on purpose, because the game is made to be projected. There is no light theme.

## The rose window

The slowly turning stained-glass window behind the title is the `<svg class="rose">` block at the top of the title screen in `index.html`. Its colors are the `.pane-a` to `.pane-d` lines in `css/style.css`. Delete the whole `<svg>` block to remove it. It stops turning for visitors who ask their device for reduced motion.

## Text on the screens

File: `index.html`. The title screen text, the "How to Play" rules and button labels are plain text you can edit. The page description and social sharing text are in the `<head>` at the top. Keep the `id="..."` parts of each element unchanged, because the game uses them.

## Fonts

The fonts are **Fraunces** (headlines) and **Inter** (everything else). Both are free under the SIL Open Font License. They are self-hosted: the GitHub build downloads them and places them in the site, so visitors never contact Google and the fonts work offline once the site has been opened.

The two names are set in `css/style.css` as `--font-display` and `--font-body`. To switch to other fonts, find them on [Fontsource](https://fontsource.org), change the package names in `scripts/build.mjs` (the `FONTS` list) and in the "Install fonts" steps of `.github/workflows/deploy.yml`, then update the `@font-face` blocks and the two names in `css/style.css`.

## Logo, icons and sharing image

Folder: `assets/`.

- `favicon.svg` is the logo. Edit or replace it to change the logo everywhere it is used.
- `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` and `icon-maskable-512.png` are the browser tab, iPhone and installed-app icons.
- `og-image.png` (1200 × 630) is the picture shown when the link is shared on WhatsApp, Facebook and similar. Upload a replacement with the same name using **Add file > Upload files** inside the `assets` folder.

The pictures in `docs/assets/` are only used by the README on the repository's front page.

## Motion and sound

Animations switch off automatically for visitors who ask their device for reduced motion. Music and sound effects each have a switch on the game screen.
