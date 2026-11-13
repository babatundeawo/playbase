# Contributing to QuizMaster

Thank you for helping! You can contribute using only the GitHub website. No programs need to be installed.

## Report a bug or suggest an idea

1. Open the [Issues](../../issues) tab and choose **New issue**.
2. Pick **Bug report** or **Idea or suggestion** and fill in the short form.
3. Add a screenshot if it helps.

## Add or fix a question

The 400 built-in questions are in [`js/questions.js`](js/questions.js). Each question looks like this:

```js
{
  category: "Science",
  difficulty: "easy",
  question: "Which planet is known as the Red Planet?",
  options: ["Venus", "Mars", "Jupiter", "Saturn"],
  answer: 1
}
```

- `difficulty` must be `"easy"`, `"medium"` or `"hard"`, in lowercase.
- `answer` is the position of the correct option, counting from 0. In the example, `Mars` is position 1.
- Players can also add shared questions inside the game, from the **Create** tab. Those are stored online, not in this file.

## Send a change (pull request)

1. Open the file you want to change on GitHub and click the **pencil icon**.
2. Make your change, then choose **Commit changes** and select **Create a new branch for this commit and start a pull request**.
3. Click **Propose changes**, then **Create pull request**.
4. Wait for the **Pull request checks** to finish. A green tick means the site still builds and passes its checks. A red cross shows a message explaining what to fix.

Nothing is published until a maintainer merges the pull request.

## Project layout

See the annotated folder tree in the [README](README.md#project-structure).

## For developers (optional)

The game is plain HTML, CSS and JavaScript. To try it on your own computer, serve the folder with any static web server (the game uses JavaScript modules, so opening `index.html` directly will not work). Copy your own Firebase settings into `js/firebase-env.js` first. Never commit real keys other than the public web settings, and never commit service account files or passwords.
