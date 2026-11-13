// One-time job: builds the leaderboard totals from the scores already saved,
// so past games count on the new boards. Safe to run again: it recalculates
// every total from the scores each time.
//
// Run it in Google Cloud Shell (see _READ-ME-FIRST.md). It uses admin access,
// so it ignores the security rules. Never put an admin key in the repository.
//
//   npm install firebase-admin
//   PROJECT_ID=your-project-id TZ=Africa/Lagos node scripts/backfill-boards.mjs
//   (add --dry to only print what would be written)
//
// Old scores did not record a time zone, so weekly, monthly and yearly
// totals are placed using the time zone in TZ. Lifetime totals do not depend on it.
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.PROJECT_ID;
if (!projectId) {
  console.error("Set PROJECT_ID to your Firebase project id, for example PROJECT_ID=quizmaster-ada");
  process.exit(1);
}
const dryRun = process.argv.includes("--dry");

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();

const pad = (n) => String(n).padStart(2, "0");

// Same board names as getBoardId() in js/periods.js
function boardIdsFor(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const sunday = new Date(year, month, date.getDate() - date.getDay());
  return [
    `weekly-${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`,
    `monthly-${year}-${pad(month + 1)}`,
    `yearly-${year}`,
    "lifetime"
  ];
}

const snapshot = await db.collection("scores").get();
console.log(`Read ${snapshot.size} scores.`);

const totals = new Map(); // "boardId|uid" -> total
let skipped = 0;

snapshot.forEach((document) => {
  const score = document.data();
  if (typeof score.uid !== "string" || !Number.isFinite(score.points) || !score.createdAt) {
    skipped += 1;
    return;
  }
  const playedAt = score.createdAt.toDate();
  const name = typeof score.name === "string" && score.name.length >= 2 ? score.name : "Player";

  boardIdsFor(playedAt).forEach((boardId) => {
    const key = `${boardId}|${score.uid}`;
    let total = totals.get(key);
    if (!total) {
      total = { boardId, uid: score.uid, name, points: 0, games: 0, latest: 0, lastScoreId: document.id };
      totals.set(key, total);
    }
    total.points += score.points;
    total.games += 1;
    if (playedAt.getTime() >= total.latest) {
      total.latest = playedAt.getTime(); // show the nickname from the latest game
      total.name = name;
      total.lastScoreId = document.id;
    }
  });
});

console.log(`Skipped ${skipped} scores with missing data. Writing ${totals.size} totals.`);
if (dryRun) {
  console.log("Dry run: nothing was written.");
  process.exit(0);
}

const entries = Array.from(totals.values());
for (let i = 0; i < entries.length; i += 400) {
  const batch = db.batch();
  entries.slice(i, i + 400).forEach((t) => {
    const ref = db.collection("boards").doc(t.boardId).collection("players").doc(t.uid);
    batch.set(ref, {
      uid: t.uid,
      name: t.name,
      points: t.points,
      games: t.games,
      lastScoreId: t.lastScoreId,
      updatedAt: new Date(t.latest)
    });
  });
  await batch.commit();
  console.log(`Wrote ${Math.min(i + 400, entries.length)} of ${entries.length}`);
}
console.log("Done.");
