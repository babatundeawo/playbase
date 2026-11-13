# Customizing

## Colours
Open `src/styles/tokens.css`. Colours are written in OKLCH with a light and a dark value. After changing one, check readability by running the **Check pull request** action; it runs the contrast check and fails if a pair is too low.

## Text
Page text is in `src/pages/*.tsx`. The name and description for search and sharing are in `index.html` and `package.json`.

## Questions
Edit `src/data/questions.ts` (row format is explained at the top of that file). Keep three wrong answers per row.

## Prizes
`src/game/ladder.ts` holds the 15 amounts and the safe-haven steps. If you change them, update the README wording.

## Fonts
Font files are in `src/assets/fonts` and are declared in `src/styles/fonts.css`. Keep the licence files.

## Icons and share image
Files in `public/` (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon.svg`, `og-image.png`). Replace them with files of the same name and size. The install screenshots are in `public/screenshots`.

## Not used
`vite.config.ts` and `src/components/AiSettingsPanel.tsx` are leftover stubs and can be deleted.
