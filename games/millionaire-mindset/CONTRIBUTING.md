# Contributing

Thank you for helping. Small fixes (a wrong answer, a typo) are very welcome.

## Fix or add a question

Open `src/data/questions.ts`. Each row looks like this:

```ts
['e', 'Which bird is known for mimicking human speech?', 'Parrot', ['Sparrow', 'Eagle', 'Owl']],
```

`e` easy, `m` medium, `h` hard, `v` very hard. One correct answer, exactly three wrong ones. Avoid facts that change over time.

## Run it on your computer

You need Node.js 22.18 or newer.

```text
npm install
npm run build
npm run preview
npm test
npm run contrast
npm run check
```

`npm run preview` serves the built site at http://localhost:4173/Millionaire-Mindset/.

## Pull requests

Open a pull request against `main`. A check runs automatically and must pass: tests, colour contrast, build and site checks.
