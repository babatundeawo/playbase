# Customizing QuizMaster

Every change below can be made on the GitHub website: open the file, click the **pencil icon**, edit, then **Commit changes**. The site updates by itself after a minute or two (see [DEPLOYMENT.md](DEPLOYMENT.md)).

## Colours

Open **`css/tokens.css`**.

- `--color-primary` is the main purple. Change it and buttons, links and highlights follow.
- `--gradient-brand` is the purple gradient on big buttons and the home card.
- `--color-accent` is the amber used for the score pill and the logo tail.
- The block starting `[data-theme="dark"]` holds the dark theme colours.

Keep text readable: dark text on light backgrounds, light text on dark backgrounds. A free checker such as the WebAIM contrast checker helps.

## Fonts

QuizMaster serves its own fonts (Inter for text, Sora for headings), so visitors never contact a font company. The build downloads the font files during publishing, so the repository itself holds no font files.

To switch to another font from [Fontsource](https://fontsource.org/):

1. In **`scripts/build_site.py`** find the `FONTS` block near the top. Change the package name, the version and the weights to the font you want (look the font up on fontsource.org to see its package name and the weights it offers).
2. In **`css/fonts.css`** change the font name and file names in the `@font-face` rules to match.
3. In **`css/tokens.css`** change `--font-display` (headings) and `--font-body` (text) to the same names.
4. In **`index.html`**, **`privacy.html`** and **`404.html`** update the `<link rel="preload" ...>` lines to the new file names (or delete them).
5. In **`service-worker.js`** update the font file names in `FILES_TO_CACHE`, and add one to the number after `playbase-quizmaster-v` so phones fetch the new version.

Use fonts that are free for commercial use, and add credit for them in the README under **Credits** when the licence asks for it.

## Text and wording

- Game screens, headings and button labels: **`index.html`**.
- Messages that appear while playing (results, errors): **`js/app.js`**.
- Privacy summary: **`privacy.html`**.
- Page title and description for search engines: the `<title>` and `<meta name="description">` near the top of **`index.html`**.

## Questions

Built-in questions are in **`js/questions.js`**. See the example in [CONTRIBUTING.md](../CONTRIBUTING.md#add-or-fix-a-question). Players' own questions are stored online and are not in this file.

## Game settings

At the top of **`js/app.js`**:

| Setting | What it controls |
|---|---|
| `TIME_PER_QUESTION` | Seconds for each question (default 15) |
| `MAX_QUESTIONS` | Questions in one game (default 10) |
| `MIN_QUESTIONS_FOR_LEADERBOARD` | Shortest game that counts for the leaderboard (default 5) |

If you change `MAX_QUESTIONS` or `MIN_QUESTIONS_FOR_LEADERBOARD`, also change the matching numbers (`5` and `10`) in the `scores` part of **`firestore.rules`**, then publish the rules again in Firebase (FIREBASE_LOGIN_SETUP.md, part 6). Otherwise scores will be refused.

## Images and icons

All pictures are in **`assets/images/`**.

| File | Size | Used for |
|---|---|---|
| `icons/icon-192.png` and `icons/icon-512.png` | 192 and 512 pixels, square | The installed app icon |
| `icons/icon-maskable-512.png` | 512 pixels, mark kept in the middle 60% | Android icons that are cropped to a shape |
| `icons/apple-touch-icon.png` | 180 pixels, square | iPhone home screen |
| `icons/favicon.svg`, `favicon-32.png`, `favicon.ico` | | Browser tab |
| `og-image.png` | 1200 x 630 pixels | The picture shown when the link is shared |

To replace a file: open its folder on GitHub, click **Add file > Upload files**, upload a file **with the same name**, and commit. After changing icons, open `service-worker.js` and add one to the number after `playbase-quizmaster-v` (for example `playbase-quizmaster-v6` becomes `playbase-quizmaster-v7`) so phones fetch the new ones.

## README pictures

The screenshots in `docs/assets/` were taken before the site was published. After your site is live you can replace `screenshot-landing.png`, `screenshot-setup.png` and `screenshot-quiz.png` with fresh screenshots (same file names).
