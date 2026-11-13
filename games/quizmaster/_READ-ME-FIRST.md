# QuizMaster leaderboard update (do not commit this file)

## What is in this zip (9 files, same paths as the repo)

| File | Action |
|---|---|
| `js/app.js` | REPLACE |
| `js/firebase-config.js` | REPLACE |
| `js/periods.js` | NEW (add it) |
| `index.html` | REPLACE |
| `service-worker.js` | REPLACE |
| `firestore.rules` | REPLACE, then publish in Firebase |
| `scripts/backfill-boards.mjs` | NEW (add it; run it once, see step 3) |

Everything else in the repo stays as it is.

## Order to follow

1. **Firebase console > Firestore > Rules**: paste the new `firestore.rules` and press **Publish**.
   Do this first. Until it is published, finished games would be refused by the database.
2. **Copy the files** into the repo and commit to `main` (GitHub: Add file > Upload files).
   The Deploy workflow runs its checks and publishes the site.
3. **Count the past games (once).** In Google Cloud Shell (shell.cloud.google.com, signed in as the Firebase project owner):
   upload `scripts/backfill-boards.mjs`, then run
   `npm install firebase-admin`
   `PROJECT_ID=your-firebase-project-id TZ=Africa/Lagos node backfill-boards.mjs --dry`
   If the numbers look right, run it again without `--dry`.
   Run it right after step 2, or before it; it can be run again safely.
4. Optional clean-up: Firebase > Firestore > Indexes: delete the `scores` index
   (`difficulty` Ascending, `points` Descending). Nothing uses it any more.

## Remove totally
- In `js/firebase-config.js`: the old `loadTopScores` function (already gone in the new file).
- In `js/app.js`: the `leaderboardLevel` variable and the Easy/Medium/Hard/Mixed leaderboard tabs (already gone).
- In Firebase: the manual index in step 4.
Nothing in the repo needs to be deleted as a file.

## Optional doc edits (not in the zip)
- `README.md`, Features: change the leaderboard line to
  `**Online leaderboards** for the week, month, year and all time, adding up each player's points`
- `README.md`, How to use, step 5: change the last sentence to
  `Use the tabs to switch between the Weekly, Monthly, Yearly and Lifetime boards.`
- `README.md`, Project structure: add `periods.js` under `js/` and a `scripts/` line.
- `docs/FIREBASE_LOGIN_SETUP.md`, Part 7: replace the whole part with
  "No manual index is needed. Leaderboard totals are sorted by one field, which Firestore indexes by itself."
  and delete the row about "needs a one-time database index" in Part 10.
- `docs/CUSTOMIZING.md`: if you change `MAX_QUESTIONS`, the `10` in the `scores` rule still has to match (unchanged).
