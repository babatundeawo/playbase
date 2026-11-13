// QuizMaster cloud functions: Firestore (data) and Authentication (players).
// The project settings come from firebase-env.js, which the build fills in.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  getCountFromServer,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-env.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ----- Questions -----
export async function saveQuestionToCloud(question) {
  const docRef = await addDoc(collection(db, "questions"), question);
  return docRef.id;
}

export async function loadQuestionsFromCloud() {
  const snapshot = await getDocs(collection(db, "questions"));
  const list = [];
  snapshot.forEach(function (document) {
    const data = document.data();
    data.id = document.id;
    list.push(data);
  });
  return list;
}

export async function deleteQuestionFromCloud(id) {
  await deleteDoc(doc(db, "questions", id));
}

// ----- Players -----
export function watchAuth(callback) {
  onAuthStateChanged(auth, callback);
}

export async function signInAsGuest() {
  await signInAnonymously(auth);
}

export async function signInWithGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOutPlayer() {
  await signOut(auth);
}

export async function loadPlayerProfile(uid) {
  const snapshot = await getDoc(doc(db, "players", uid));
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}

export async function savePlayerProfile(uid, profile) {
  await setDoc(doc(db, "players", uid), profile);
}

// ----- Scores and leaderboards -----
// Every finished game is saved in two places, in one all-or-nothing transaction:
//   1. scores/{id}                    the record of the game itself
//   2. boards/{boardId}/players/{uid} the player's running total on each board
// boardIds holds the four board names (weekly, monthly, yearly, lifetime) for
// the moment the game ended, worked out in the player's own time zone.
// firestore.rules checks that every total goes up by exactly the points of the
// new game, so a total cannot be edited by hand.
export async function saveScoreToCloud(uid, name, correct, total, difficulty, category, boardIds) {
  const points = correct * 10;
  const scoreRef = doc(collection(db, "scores"));
  const totalRefs = boardIds.map((boardId) => doc(db, "boards", boardId, "players", uid));

  await runTransaction(db, async function (transaction) {
    const before = await Promise.all(totalRefs.map((ref) => transaction.get(ref)));

    transaction.set(scoreRef, {
      uid: uid,
      name: name,
      points: points,
      correct: correct,
      total: total,
      difficulty: difficulty,
      category: category,
      createdAt: serverTimestamp()
    });

    totalRefs.forEach(function (ref, i) {
      const old = before[i].exists() ? before[i].data() : { points: 0, games: 0 };
      transaction.set(ref, {
        uid: uid,
        name: name,
        points: old.points + points,
        games: old.games + 1,
        lastScoreId: scoreRef.id,
        updatedAt: serverTimestamp()
      });
    });
  });
}

// The top players on one board, most points first.
// Sorting by one field uses Firestore's automatic index, so no manual index is needed.
export async function loadBoardTop(boardId, size) {
  const topQuery = query(
    collection(db, "boards", boardId, "players"),
    orderBy("points", "desc"),
    limit(size)
  );
  const snapshot = await getDocs(topQuery);
  const list = [];
  snapshot.forEach(function (document) {
    list.push(document.data());
  });
  return list;
}

// One player's total and rank on a board, or null if they have not played in it.
// The rank is the number of players with more points, plus one.
export async function loadMyBoardEntry(boardId, uid) {
  const snapshot = await getDoc(doc(db, "boards", boardId, "players", uid));
  if (!snapshot.exists()) {
    return null;
  }
  const mine = snapshot.data();
  const ahead = await getCountFromServer(
    query(collection(db, "boards", boardId, "players"), where("points", ">", mine.points))
  );
  mine.rank = ahead.data().count + 1;
  return mine;
}
