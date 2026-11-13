# Contributing

Thank you for helping improve Naija Monopoly.

## Report a bug or suggest an idea

1. Open the [Issues](https://github.com/babatundeawo/naija-monopoly/issues) tab.
2. Select **New issue** and pick **Bug report** or **Idea or suggestion**.
3. Fill in the form. For a rules problem, say which tile or card was involved.

## Change something

You can do everything from the GitHub website:

1. Open the file you want to change and select the pencil icon.
2. Make your edit and select **Commit changes**, choosing **Create a new branch** and then **Propose changes**.
3. Select **Create pull request**. The *Deploy site* check runs automatically; a green tick means the build and checks passed.

Guides for common changes live in [docs/CUSTOMIZING.md](docs/CUSTOMIZING.md).

## Working on your own computer (optional, for developers)

The site has no dependencies. To preview it, serve the `src` folder with any static file server, for example `python3 -m http.server --directory src`. To run the same build and checks as CI:

```
node scripts/build.mjs
node scripts/check.mjs
```

Game rules live in `src/js/engine.js`. Please keep new code free of inline event handlers, because the page's Content Security Policy blocks them.
