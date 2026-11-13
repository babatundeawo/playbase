# Contributing

Thank you for helping improve Bible Family Feud. You can contribute entirely from the GitHub website.

## Report a problem or suggest an idea

[Open an issue](https://github.com/rccgkd/bible-family-feud/issues/new/choose) and describe what you saw or what you would like. A screenshot and the browser you used help a lot.

## Fix or add a question

1. Open [`js/questions.js`](js/questions.js) on GitHub and select the pencil icon (**Edit this file**).
2. Each round has a `label`, a `question`, and exactly eight `answers`, listed from most to fewest points.
3. Select **Commit changes…**, choose **Create a new branch for this commit and start a pull request**, then **Propose changes**.

An automatic check runs on every pull request. It confirms each round has eight answers with positive points and flags answers that are out of order.

## Change anything else

Edit the file on GitHub and propose the change the same way. Please keep changes small and focused, and explain the reason in the pull request description. The [customizing guide](docs/CUSTOMIZING.md) shows where design values live.

## Working on a copy of the code

Developers who prefer a local copy can serve the repository root with any static server, for example `python3 -m http.server`, and open the printed address. The same build and checks that run on GitHub are available with `node scripts/build.mjs && node scripts/check.mjs` (Node 20 or newer).
