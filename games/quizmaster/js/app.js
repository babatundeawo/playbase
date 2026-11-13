// QuizMaster: main application logic.
// Sections: Settings · State · Helpers · Screens · Account · Setup · Quiz ·
// Result · Leaderboard · Editor · Sign-in · Start-up.
import { initPwa } from "./pwa.js";
import {
  initThemeToggle,
  toast,
  announce,
  countUp,
  confetti,
  prefersReducedMotion,
  icon
} from "./effects.js";
import {
  PERIODS,
  PERIOD_LABELS,
  getBoardId,
  getAllBoardIds,
  describePeriod
} from "./periods.js";

const $ = (id) => document.getElementById(id);

// ---------- Settings ----------
const TIME_PER_QUESTION = 15;
const BEST_KEY = "quizmasterBestPercent";
const MAX_QUESTIONS = 10;
const MIN_QUESTIONS_FOR_LEADERBOARD = 5;
const LEADERBOARD_SIZE = 10;
const TIMER_CIRCUMFERENCE = 113.1;
const RESULT_CIRCUMFERENCE = 301.6;
const AUTH_WAIT_MS = 8000;
const LETTERS = ["A", "B", "C", "D"];

const DIFFICULTY_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard", mixed: "Mixed" };

const SCREENS = [
  "loading-screen",
  "signin-screen",
  "name-screen",
  "home-screen",
  "setup-screen",
  "editor-screen",
  "quiz-screen",
  "result-screen",
  "leaderboard-screen"
];

const SCREEN_TITLES = {
  "name-screen": "Choose your name",
  "home-screen": "Home",
  "setup-screen": "Choose your quiz",
  "editor-screen": "Create a question",
  "quiz-screen": "Quiz",
  "result-screen": "Your result",
  "leaderboard-screen": "Leaderboard"
};

const NAV_FOR_SCREEN = {
  "home-screen": "home",
  "setup-screen": "play",
  "quiz-screen": "play",
  "result-screen": "play",
  "editor-screen": "create",
  "leaderboard-screen": "leaderboard"
};

const BASE_TITLE = document.title;

// ---------- State ----------
let cloud = null; // the Firebase functions, or null when they cannot load
let currentScreen = "loading-screen";

let currentIndex = 0;
let score = 0;
let answered = false;
let timeLeft = TIME_PER_QUESTION;
let timerId = null;
let activeQuestions = [];

let selectedCategory = "All";
let selectedDifficulty = "All";
let gameDifficulty = "mixed";
let gameCategory = "All";

let currentUser = null;
let currentPlayer = null; // { name, gamesPlayed, bestPercent, offline? }
let editingName = false;
let authResolved = false;
let authTimer = null;

let customQuestions = [];
let sharedLoaded = false;
let leaderboardRequest = 0;
let leaderboardPeriod = "weekly";
let scoreSaving = Promise.resolve(); // the score being sent right now, if any

// ---------- Helpers ----------
function getBestScore() {
  try {
    const saved = localStorage.getItem(BEST_KEY);
    return saved === null ? 0 : Number(saved) || 0;
  } catch (error) {
    return 0;
  }
}

function saveBestLocally(percent) {
  try {
    localStorage.setItem(BEST_KEY, String(percent));
  } catch (error) {
    // Storage can be blocked. The cloud copy still keeps the score.
  }
}

function getCategories() {
  const names = [];
  questions.forEach((q) => {
    if (!names.includes(q.category)) {
      names.push(q.category);
    }
  });
  return names;
}

function matches(q, category, difficulty) {
  const categoryOk = category === "All" || q.category === category;
  const difficultyOk = difficulty === "All" || q.difficulty === difficulty.toLowerCase();
  return categoryOk && difficultyOk;
}

function countMatching(category, difficulty) {
  return questions.filter((q) => matches(q, category, difficulty)).length;
}

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const held = copy[i];
    copy[i] = copy[j];
    copy[j] = held;
  }
  return copy;
}

function isValidQuestion(q) {
  return (
    q &&
    typeof q.question === "string" &&
    typeof q.category === "string" &&
    typeof q.difficulty === "string" &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    Number.isInteger(q.answer) &&
    q.answer >= 0 &&
    q.answer <= 3
  );
}

function setLoading(button, isLoading) {
  button.classList.toggle("is-loading", isLoading);
  button.disabled = isLoading;
  button.setAttribute("aria-busy", String(isLoading));
}

function levelBadge(level) {
  const badge = document.createElement("span");
  const name = DIFFICULTY_LABELS[level] ? level : "mixed";
  badge.className = `badge badge--${name}`;
  badge.textContent = DIFFICULTY_LABELS[name];
  return badge;
}

/** Builds a row of toggle buttons. onPick receives the chosen label. */
function buildSegmented(container, labels, selectedLabel, onPick) {
  container.innerHTML = "";
  labels.forEach((label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "segmented__btn";
    button.textContent = label;
    button.setAttribute("aria-pressed", String(label === selectedLabel));
    button.addEventListener("click", () => {
      container.querySelectorAll(".segmented__btn").forEach((other) => {
        other.setAttribute("aria-pressed", String(other === button));
      });
      onPick(label);
    });
    container.appendChild(button);
  });
}

/** Asks a yes or no question in a styled dialog. Resolves to true or false. */
function confirmAction({ title, message, confirmLabel = "OK", danger = false }) {
  const dialog = $("confirm-dialog");
  if (typeof dialog.showModal !== "function") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  $("confirm-title").textContent = title;
  $("confirm-message").textContent = message;
  const ok = $("confirm-ok");
  ok.textContent = confirmLabel;
  ok.className = danger ? "btn btn--danger" : "btn btn--primary";
  dialog.returnValue = "";

  return new Promise((resolve) => {
    dialog.addEventListener(
      "close",
      () => {
        resolve(dialog.returnValue === "confirm");
      },
      { once: true }
    );
    dialog.showModal();
  });
}

// ---------- Screens ----------
function showScreen(id, options = {}) {
  const { focus = true } = options;

  if (id !== "quiz-screen") {
    stopTimer();
  }

  currentScreen = id;
  SCREENS.forEach((screenId) => {
    $(screenId).hidden = screenId !== id;
  });
  document.body.dataset.screen = id;
  updateChrome();
  document.title = SCREEN_TITLES[id] ? `${SCREEN_TITLES[id]} | QuizMaster` : BASE_TITLE;
  window.scrollTo(0, 0);

  if (focus) {
    const target = document.querySelector(`#${id} [data-focus]`);
    if (target) {
      target.focus({ preventScroll: true });
    }
  }
}

/** Shows or hides the navigation and account menu, and marks the current page. */
function updateChrome() {
  const signedIn = currentPlayer !== null;
  document.body.classList.toggle("has-nav", signedIn);
  $("primary-nav").hidden = !signedIn;
  $("account").hidden = !signedIn;

  if (signedIn) {
    $("account-initial").textContent = currentPlayer.name.charAt(0).toUpperCase();
    $("account-name").textContent = currentPlayer.name;
    if (!currentUser) {
      $("account-type").textContent = "Offline mode";
    } else if (currentUser.isAnonymous) {
      $("account-type").textContent = "Guest account (this browser only)";
    } else {
      $("account-type").textContent = "Signed in with Google";
    }
    $("change-name-btn").hidden = Boolean(currentPlayer.offline);
  }

  const active = NAV_FOR_SCREEN[currentScreen];
  document.querySelectorAll("[data-nav]").forEach((button) => {
    if (button.dataset.nav === active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function showSignin() {
  stopTimer();
  currentPlayer = null;
  $("signin-message").textContent = "";
  $("guest-btn").disabled = false;
  $("google-btn").disabled = false;
  closeAccountMenu();
  showScreen("signin-screen");
}

function enterHome() {
  $("player-name-display").textContent = currentPlayer.name;
  $("games-played").textContent = String(currentPlayer.gamesPlayed);
  $("home-best").textContent = `${currentPlayer.bestPercent}%`;
  showScreen("home-screen");
}

function renderFacts() {
  const facts = $("facts");
  facts.innerHTML = "";
  [
    `${questions.length} questions`,
    `${getCategories().length} categories`,
    "3 difficulty levels"
  ].forEach((text) => {
    const item = document.createElement("li");
    item.className = "chip chip--primary";
    item.textContent = text;
    facts.appendChild(item);
  });
}

function observeReveals() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((item) => observer.observe(item));
}

// ---------- Account menu ----------
function closeAccountMenu() {
  $("account-menu").hidden = true;
  $("account-btn").setAttribute("aria-expanded", "false");
}

function toggleAccountMenu() {
  const willOpen = $("account-menu").hidden;
  $("account-menu").hidden = !willOpen;
  $("account-btn").setAttribute("aria-expanded", String(willOpen));
}

// ---------- Setup (choose a quiz) ----------
function openSetup() {
  selectedCategory = "All";
  selectedDifficulty = "All";
  renderSetup();
  $("setup-message").textContent = "";
  showScreen("setup-screen");
}

function renderSetup() {
  const tiles = $("category-tiles");
  tiles.innerHTML = "";

  ["All", ...getCategories()].forEach((name, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile";
    button.dataset.value = name;
    button.setAttribute("aria-pressed", String(name === selectedCategory));

    const mark = document.createElement("span");
    mark.className = "tile__mark";
    mark.textContent = name === "All" ? "All" : name.charAt(0).toUpperCase();
    if (name !== "All") {
      mark.style.setProperty("--tile-color", `hsl(${(index * 67 + 200) % 360} 55% 40%)`);
    }

    const label = document.createElement("span");
    label.className = "tile__name";
    label.textContent = name === "All" ? "All topics" : name;

    const count = document.createElement("span");
    count.className = "tile__count";
    const total = countMatching(name, "All");
    count.textContent = `${total} question${total === 1 ? "" : "s"}`;

    button.append(mark, label, count);
    button.addEventListener("click", () => {
      selectedCategory = name;
      updateSetupState();
    });
    item.appendChild(button);
    tiles.appendChild(item);
  });

  buildSegmented(
    $("difficulty-buttons"),
    ["All", "Easy", "Medium", "Hard"],
    selectedDifficulty,
    (label) => {
      selectedDifficulty = label;
      updateSetupState();
    }
  );

  updateSetupState();
}

function updateSetupState() {
  $("category-tiles").querySelectorAll(".tile").forEach((tile) => {
    tile.setAttribute("aria-pressed", String(tile.dataset.value === selectedCategory));
  });

  const available = countMatching(selectedCategory, selectedDifficulty);
  $("availability").textContent =
    available === 0
      ? "No questions match this choice."
      : `${available} question${available === 1 ? "" : "s"} available. A game uses up to ${MAX_QUESTIONS}.`;
  $("begin-btn").disabled = available === 0;
  $("setup-message").textContent = "";
}

// ---------- Quiz ----------
function startQuiz() {
  const filtered = questions.filter((q) => matches(q, selectedCategory, selectedDifficulty));
  if (filtered.length === 0) {
    $("setup-message").textContent = "No questions match. Try another choice.";
    return;
  }

  gameDifficulty = selectedDifficulty === "All" ? "mixed" : selectedDifficulty.toLowerCase();
  gameCategory = selectedCategory;
  activeQuestions = shuffle(filtered).slice(0, MAX_QUESTIONS);
  currentIndex = 0;
  score = 0;

  $("quiz-category").textContent = gameCategory === "All" ? "All topics" : gameCategory;
  const level = $("quiz-level");
  level.className = `badge badge--${gameDifficulty}`;
  level.textContent = DIFFICULTY_LABELS[gameDifficulty];

  showScreen("quiz-screen", { focus: false });
  showQuestion(0);
}

function resetTimerRing() {
  const ring = $("timer-value");
  ring.style.transition = "none";
  ring.style.setProperty("--timer-offset", "0");
  ring.getBoundingClientRect(); // forces the browser to apply the reset first
  ring.style.transition = "";
}

function renderTimer() {
  $("timer-text").textContent = String(timeLeft);
  const offset = TIMER_CIRCUMFERENCE * (1 - timeLeft / TIME_PER_QUESTION);
  $("timer-value").style.setProperty("--timer-offset", offset.toFixed(1));
  $("timer").classList.toggle("is-urgent", timeLeft <= 5);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function startTimer() {
  stopTimer();
  timeLeft = TIME_PER_QUESTION;
  resetTimerRing();
  renderTimer();

  timerId = setInterval(() => {
    timeLeft = timeLeft - 1;
    renderTimer();
    if (timeLeft <= 0) {
      timeUp();
    }
  }, 1000);
}

function showQuestion(index) {
  const q = activeQuestions[index];
  const total = activeQuestions.length;
  answered = false;

  $("quiz-count").textContent = `Question ${index + 1} of ${total}`;
  $("live-score").textContent = `Score: ${score}`;
  setProgress((index / total) * 100);

  const text = $("question-text");
  text.textContent = q.question;

  const next = $("next-btn");
  next.hidden = true;
  next.innerHTML = `${index === total - 1 ? "See results" : "Next question"}${icon("arrow")}`;

  const options = $("options");
  options.innerHTML = "";
  q.options.forEach((optionText, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.dataset.index = String(i);

    const key = document.createElement("span");
    key.className = "option__key";
    key.textContent = LETTERS[i];

    const label = document.createElement("span");
    label.className = "option__text";
    label.textContent = optionText;

    const state = document.createElement("span");
    state.className = "option__state";
    state.setAttribute("aria-hidden", "true");

    button.append(key, label, state);
    button.addEventListener("click", () => checkAnswer(i));
    options.appendChild(button);
  });

  startTimer();
  text.focus({ preventScroll: true });
}

function setProgress(percent) {
  const rounded = Math.round(percent);
  $("quiz-progress-bar").style.setProperty("--progress", String(rounded));
  $("quiz-progress").setAttribute("aria-valuenow", String(rounded));
}

/** Marks every option as right, wrong or neither. chosen is -1 when time runs out. */
function markOptions(correctIndex, chosen) {
  Array.from($("options").children).forEach((button, i) => {
    button.disabled = true;
    const state = button.querySelector(".option__state");
    if (i === correctIndex) {
      button.classList.add("is-correct");
      state.innerHTML = icon("check");
    } else if (i === chosen) {
      button.classList.add("is-wrong");
      state.innerHTML = icon("x");
    } else {
      button.classList.add("is-dim");
    }
  });
}

function endQuestion(message) {
  answered = true;
  stopTimer();
  $("live-score").textContent = `Score: ${score}`;
  setProgress(((currentIndex + 1) / activeQuestions.length) * 100);
  announce(message);

  const next = $("next-btn");
  next.hidden = false;
  next.focus({ preventScroll: true });
}

function checkAnswer(chosen) {
  if (answered) {
    return;
  }

  const q = activeQuestions[currentIndex];
  let message;
  if (chosen === q.answer) {
    score = score + 1;
    message = "Correct!";
  } else {
    message = `Not quite. The correct answer is ${LETTERS[q.answer]}: ${q.options[q.answer]}.`;
  }

  markOptions(q.answer, chosen);
  endQuestion(message);
}

function timeUp() {
  if (answered) {
    return;
  }
  const q = activeQuestions[currentIndex];
  $("timer-text").textContent = "0";
  markOptions(q.answer, -1);
  endQuestion(`Time is up. The correct answer is ${LETTERS[q.answer]}: ${q.options[q.answer]}.`);
}

function goToNextQuestion() {
  if (currentIndex < activeQuestions.length - 1) {
    currentIndex = currentIndex + 1;
    showQuestion(currentIndex);
  } else {
    showResult();
  }
}

// ---------- Result ----------
async function updatePlayerStats(percent) {
  currentPlayer.gamesPlayed = currentPlayer.gamesPlayed + 1;
  if (percent > currentPlayer.bestPercent) {
    currentPlayer.bestPercent = percent;
  }
  saveBestLocally(currentPlayer.bestPercent);

  if (currentPlayer.offline || !cloud || !currentUser) {
    return; // never overwrite a real profile with an offline one
  }

  try {
    await cloud.savePlayerProfile(currentUser.uid, {
      name: currentPlayer.name,
      gamesPlayed: currentPlayer.gamesPlayed,
      bestPercent: currentPlayer.bestPercent
    });
  } catch (error) {
    console.log("Could not save stats:", error);
  }
}

async function submitScore(correct, total) {
  const status = $("leaderboard-status");
  status.className = "status";

  if (total < MIN_QUESTIONS_FOR_LEADERBOARD) {
    status.textContent = `Play at least ${MIN_QUESTIONS_FOR_LEADERBOARD} questions to join the leaderboard.`;
    return;
  }
  if (currentPlayer.offline || !cloud || !currentUser) {
    status.textContent = "Offline: your score was not sent to the leaderboard.";
    return;
  }

  status.textContent = "Sending your score...";
  try {
    // The four boards for the moment this game ended, in this player's time zone
    await cloud.saveScoreToCloud(
      currentUser.uid,
      currentPlayer.name,
      correct,
      total,
      gameDifficulty,
      gameCategory,
      getAllBoardIds(new Date())
    );
    status.className = "status status--ok";
    status.textContent = `Score sent to the leaderboard (${correct * 10} points added).`;
  } catch (error) {
    console.log("Could not send score:", error);
    status.className = "status status--error";
    status.textContent = "Could not send your score to the leaderboard.";
  }
}

function resultTitle(percent) {
  if (percent >= 90) {
    return "Outstanding!";
  }
  if (percent >= 70) {
    return "Great job!";
  }
  if (percent >= 50) {
    return "Nice effort!";
  }
  return "Keep practising!";
}

function showResult() {
  stopTimer();
  const total = activeQuestions.length;
  const percent = Math.round((score / total) * 100);
  const isNewBest = percent > currentPlayer.bestPercent;

  updatePlayerStats(percent);
  scoreSaving = submitScore(score, total); // submitScore handles its own errors

  $("result-title").textContent = resultTitle(percent);

  const line = $("final-score");
  line.textContent = "You scored ";
  const strong = document.createElement("strong");
  strong.textContent = String(score);
  line.append(strong, ` out of ${total}`);

  $("high-score-message").hidden = !isNewBest || percent === 0;
  $("best-score").textContent = `${currentPlayer.bestPercent}%`;

  // Reset the ring, then animate it to the new value
  const ring = $("result-ring");
  ring.style.transition = "none";
  ring.style.setProperty("--result-offset", String(RESULT_CIRCUMFERENCE));
  $("result-percent").textContent = "0%";

  showScreen("result-screen");

  ring.getBoundingClientRect();
  ring.style.transition = "";
  requestAnimationFrame(() => {
    ring.style.setProperty(
      "--result-offset",
      (RESULT_CIRCUMFERENCE * (1 - percent / 100)).toFixed(1)
    );
  });
  countUp($("result-percent"), percent, 1000, (value) => `${value}%`);

  if (isNewBest && percent > 0) {
    confetti();
  }
}

// ---------- Leaderboard ----------
function openLeaderboard() {
  buildSegmented(
    $("leaderboard-filter"),
    PERIODS.map((period) => PERIOD_LABELS[period]),
    PERIOD_LABELS.weekly,
    (label) => loadLeaderboard(label.toLowerCase())
  );
  showScreen("leaderboard-screen");
  loadLeaderboard("weekly");
}

function showSkeletons() {
  const list = $("leaderboard-list");
  list.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const row = document.createElement("li");
    row.className = "skeleton skeleton-row";
    row.setAttribute("aria-hidden", "true");
    list.appendChild(row);
  }
}

function leaderboardRow(entry, position) {
  const row = document.createElement("li");
  row.className = "lb-row";
  if (position <= 3) {
    row.classList.add(`lb-row--${position}`);
  }
  const isMe = Boolean(currentUser) && entry.uid === currentUser.uid;
  if (isMe) {
    row.classList.add("is-me");
  }
  row.style.setProperty("animation-delay", `${(position - 1) * 45}ms`);

  const rank = document.createElement("span");
  rank.className = "lb-rank";
  rank.textContent = String(position);

  const main = document.createElement("div");
  const name = document.createElement("div");
  name.className = "lb-name";
  name.textContent = entry.name;

  const meta = document.createElement("div");
  meta.className = "lb-meta";
  const games = document.createElement("span");
  games.className = "badge badge--category";
  games.textContent = `${entry.games} game${entry.games === 1 ? "" : "s"}`;
  meta.appendChild(games);
  if (isMe) {
    const you = document.createElement("span");
    you.className = "lb-you";
    you.textContent = "You";
    meta.appendChild(you);
  }
  main.append(name, meta);

  const points = document.createElement("div");
  points.className = "lb-points";
  points.textContent = String(entry.points);
  const unit = document.createElement("small");
  unit.textContent = "points";
  points.appendChild(unit);

  row.append(rank, main, points);
  return row;
}

/** What to say when a board has no players yet. */
const EMPTY_BOARD_TEXT = {
  weekly: "No scores yet this week. Be the first!",
  monthly: "No scores yet this month. Be the first!",
  yearly: "No scores yet this year. Be the first!",
  lifetime: "No scores yet. Be the first!"
};

async function loadLeaderboard(period) {
  leaderboardPeriod = period;
  const list = $("leaderboard-list");
  const message = $("leaderboard-message");
  const retry = $("leaderboard-retry-btn");
  retry.hidden = true;
  message.className = "status";
  $("leaderboard-period").textContent = describePeriod(period);

  if (!cloud || !currentUser || (currentPlayer && currentPlayer.offline)) {
    list.innerHTML = "";
    message.textContent = "The leaderboard needs an internet connection and a signed-in player.";
    return;
  }

  leaderboardRequest = leaderboardRequest + 1;
  const thisRequest = leaderboardRequest;
  message.textContent = "Loading the top scores...";
  showSkeletons();

  try {
    await scoreSaving; // so a game that was just finished is included
    if (thisRequest !== leaderboardRequest) {
      return; // a newer tab was chosen while we waited
    }

    const boardId = getBoardId(period);
    const top = await cloud.loadBoardTop(boardId, LEADERBOARD_SIZE);

    // A player outside the top 10 still sees their own place below the list
    let mine = null;
    const inTop = top.some((entry) => entry.uid === currentUser.uid);
    if (!inTop) {
      try {
        mine = await cloud.loadMyBoardEntry(boardId, currentUser.uid);
      } catch (error) {
        console.log("Could not load your own place:", error);
      }
    }
    if (thisRequest !== leaderboardRequest) {
      return;
    }

    list.innerHTML = "";
    if (top.length === 0) {
      message.textContent = EMPTY_BOARD_TEXT[period];
      return;
    }
    message.textContent = "";
    top.forEach((entry, i) => list.appendChild(leaderboardRow(entry, i + 1)));

    if (mine) {
      const note = document.createElement("li");
      note.className = "lb-note";
      note.textContent = "Your place";
      list.appendChild(note);
      list.appendChild(leaderboardRow(mine, mine.rank));
    }
  } catch (error) {
    console.log("Could not load the leaderboard:", error);
    if (thisRequest !== leaderboardRequest) {
      return;
    }
    list.innerHTML = "";
    message.className = "status status--error";
    message.textContent = "Could not load the leaderboard. Check your connection and try again.";
    retry.hidden = false;
  }
}

// ---------- Question editor ----------
function clearEditorErrors() {
  ["new-question", "new-category"].forEach((id) => {
    $(`${id}-error`).textContent = "";
    $(id).removeAttribute("aria-invalid");
  });
  $("new-options-error").textContent = "";
  for (let i = 0; i < 4; i++) {
    $(`new-option-${i}`).removeAttribute("aria-invalid");
  }
  $("editor-message").textContent = "";
  $("editor-message").className = "status";
}

function setFieldError(id, message) {
  $(`${id}-error`).textContent = message;
  $(id).setAttribute("aria-invalid", "true");
}

function canWriteToCloud() {
  return Boolean(cloud && currentUser && currentPlayer && !currentPlayer.offline);
}

function openEditor() {
  const allowed = canWriteToCloud();
  $("editor-offline").hidden = allowed;
  $("save-question-btn").disabled = !allowed;
  clearEditorErrors();
  refreshCategoryList();
  renderCustomList();
  showScreen("editor-screen");
}

function refreshCategoryList() {
  const list = $("category-list");
  list.innerHTML = "";
  getCategories().forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    list.appendChild(option);
  });
}

function renderCustomList() {
  const list = $("custom-list");
  list.innerHTML = "";

  const mine = customQuestions.filter((q) => currentUser && q.createdBy === currentUser.uid);
  if (mine.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    const title = document.createElement("p");
    title.className = "empty-state__title";
    title.textContent = "No questions of your own yet";
    const hint = document.createElement("p");
    hint.textContent = "Questions you create will appear here.";
    empty.append(title, hint);
    list.appendChild(empty);
    return;
  }

  mine.forEach((q) => {
    const item = document.createElement("li");
    item.className = "q-item";

    const body = document.createElement("div");
    const text = document.createElement("p");
    text.className = "q-item__text";
    text.textContent = q.question;
    const meta = document.createElement("div");
    meta.className = "q-item__meta";
    meta.appendChild(levelBadge(q.difficulty));
    const category = document.createElement("span");
    category.className = "badge badge--category";
    category.textContent = q.category;
    meta.appendChild(category);
    body.append(text, meta);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn--ghost btn--sm";
    remove.setAttribute("aria-label", `Delete question: ${q.question}`);
    remove.innerHTML = `${icon("trash")}Delete`;
    remove.addEventListener("click", () => deleteCustomQuestion(q));

    item.append(body, remove);
    list.appendChild(item);
  });
}

async function saveNewQuestion() {
  if (!canWriteToCloud()) {
    return;
  }
  clearEditorErrors();

  const text = $("new-question").value.trim();
  const category = $("new-category").value.trim();
  const difficulty = $("new-difficulty").value;
  const answer = Number(document.querySelector('input[name="correct"]:checked').value);
  const options = [0, 1, 2, 3].map((i) => $(`new-option-${i}`).value.trim());

  let firstInvalid = null;
  if (text === "") {
    setFieldError("new-question", "Type your question.");
    firstInvalid = firstInvalid || $("new-question");
  }
  const emptyIndex = options.indexOf("");
  if (emptyIndex !== -1) {
    $("new-options-error").textContent = "Fill in all four options.";
    $(`new-option-${emptyIndex}`).setAttribute("aria-invalid", "true");
    firstInvalid = firstInvalid || $(`new-option-${emptyIndex}`);
  } else if (new Set(options.map((o) => o.toLowerCase())).size < 4) {
    $("new-options-error").textContent = "Each option must be different.";
    firstInvalid = firstInvalid || $("new-option-0");
  }
  if (category === "") {
    setFieldError("new-category", "Choose or type a category.");
    firstInvalid = firstInvalid || $("new-category");
  }
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const newQuestion = {
    category,
    difficulty,
    question: text,
    options,
    answer,
    createdBy: currentUser.uid
  };

  const button = $("save-question-btn");
  setLoading(button, true);
  $("editor-message").textContent = "Saving...";

  try {
    newQuestion.id = await cloud.saveQuestionToCloud(newQuestion);
  } catch (error) {
    console.log("Could not save question:", error);
    setLoading(button, false);
    $("editor-message").className = "status status--error";
    $("editor-message").textContent = "Could not save. Check your internet and try again.";
    return;
  }

  setLoading(button, false);
  customQuestions.push(newQuestion);
  questions.push(newQuestion);

  $("editor-form").reset();
  $("editor-message").textContent = "";
  refreshCategoryList();
  renderCustomList();
  renderFacts();
  toast("Question saved. Everyone can play it now.", "success");
  announce("Question saved.");
  $("new-question").focus();
}

async function deleteCustomQuestion(q) {
  const ok = await confirmAction({
    title: "Delete this question?",
    message: q.question,
    confirmLabel: "Delete",
    danger: true
  });
  if (!ok) {
    return;
  }

  try {
    await cloud.deleteQuestionFromCloud(q.id);
  } catch (error) {
    console.log("Could not delete question:", error);
    toast("Could not delete the question. Try again.", "error");
    return;
  }

  [customQuestions, questions].forEach((list) => {
    const position = list.indexOf(q);
    if (position !== -1) {
      list.splice(position, 1);
    }
  });
  renderCustomList();
  refreshCategoryList();
  renderFacts();
  toast("Question deleted.", "success");
}

// ---------- Shared questions (cloud) ----------
async function loadSharedQuestions() {
  const status = $("cloud-status");
  status.textContent = "Loading shared questions...";

  try {
    const cloudQuestions = await cloud.loadQuestionsFromCloud();
    const valid = cloudQuestions.filter(isValidQuestion);
    if (!sharedLoaded) {
      sharedLoaded = true;
      valid.forEach((q) => questions.push(q));
      customQuestions = valid.slice();
    }
    status.textContent =
      valid.length === 0
        ? "No shared questions yet."
        : `${valid.length} shared question${valid.length === 1 ? "" : "s"} added by players.`;
    renderFacts();
  } catch (error) {
    console.log("Could not load shared questions:", error);
    status.textContent = "Offline: using the built-in questions only.";
  }
}

// ---------- Sign in ----------
function signInErrorMessage(error) {
  const code = error && error.code ? error.code : "";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "";
  }
  if (code === "auth/popup-blocked") {
    return "Your browser blocked the sign-in window. Allow pop-ups for this site, or play as a guest.";
  }
  if (code === "auth/unauthorized-domain") {
    return "This website address is not allowed for sign-in yet. The site owner needs to add it in Firebase.";
  }
  if (code === "auth/operation-not-allowed") {
    return "This sign-in method is not turned on yet. The site owner needs to enable it in Firebase.";
  }
  if (code === "auth/network-request-failed") {
    return "No internet connection. Check your connection and try again.";
  }
  return "Could not sign in. Please try again.";
}

async function trySignIn(signInFunction, button) {
  if (!cloud) {
    $("cloud-error").hidden = false;
    return;
  }
  const message = $("signin-message");
  message.textContent = "";
  setLoading(button, true);

  try {
    await signInFunction();
  } catch (error) {
    console.log("Sign-in problem:", error);
    message.textContent = signInErrorMessage(error);
  }
  setLoading(button, false);
}

async function handleSignedIn(user) {
  currentUser = user;

  let profile;
  try {
    profile = await cloud.loadPlayerProfile(user.uid);
  } catch (error) {
    console.log("Could not load profile:", error);
    profile = {
      name: "Guest",
      gamesPlayed: 0,
      bestPercent: getBestScore(),
      offline: true
    };
    toast("Offline: your progress will not be saved online.", "error");
  }

  if (currentUser !== user) {
    return; // the player signed out while we were waiting
  }

  if (profile === null) {
    editingName = false;
    currentPlayer = null;
    openNameScreen();
    return;
  }

  currentPlayer = profile;
  enterHome();
}

function onAuthChange(user) {
  authResolved = true;
  clearTimeout(authTimer);

  if (user) {
    handleSignedIn(user);
  } else {
    currentUser = null;
    showSignin();
  }
}

function playOffline() {
  currentUser = null;
  currentPlayer = {
    name: "Guest",
    gamesPlayed: 0,
    bestPercent: getBestScore(),
    offline: true
  };
  $("cloud-status").textContent = "Offline: using the built-in questions only.";
  enterHome();
}

async function signOutPlayer() {
  closeAccountMenu();

  if (!currentUser) {
    showSignin(); // offline mode has no account to sign out of
    return;
  }

  if (currentUser.isAnonymous) {
    const ok = await confirmAction({
      title: "Sign out of this guest account?",
      message: "Guest accounts cannot be recovered after you sign out. Your stats will be lost.",
      confirmLabel: "Sign out",
      danger: true
    });
    if (!ok) {
      return;
    }
  }

  try {
    await cloud.signOutPlayer();
  } catch (error) {
    console.log("Could not sign out:", error);
    toast("Could not sign out. Try again.", "error");
  }
}

// ---------- Nickname ----------
function openNameScreen() {
  const input = $("player-name");
  input.value = editingName && currentPlayer ? currentPlayer.name : "";
  $("name-error").textContent = "";
  input.removeAttribute("aria-invalid");
  $("name-cancel-btn").hidden = !editingName;
  $("name-title").textContent = editingName ? "Change your player name" : "Choose your player name";
  showScreen("name-screen");
}

async function saveName() {
  const input = $("player-name");
  const error = $("name-error");
  const name = input.value.trim().replace(/\s+/g, " ");

  if (name.length < 2 || name.length > 15) {
    error.textContent = "Please use 2 to 15 characters.";
    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }
  error.textContent = "";
  input.removeAttribute("aria-invalid");

  const profile = {
    name,
    gamesPlayed: currentPlayer ? currentPlayer.gamesPlayed : 0,
    bestPercent: currentPlayer ? currentPlayer.bestPercent : getBestScore()
  };

  const button = $("save-name-btn");
  setLoading(button, true);
  try {
    await cloud.savePlayerProfile(currentUser.uid, profile);
  } catch (saveError) {
    console.log("Could not save profile:", saveError);
    setLoading(button, false);
    error.textContent = "Could not save. Check your internet and try again.";
    return;
  }
  setLoading(button, false);

  currentPlayer = profile;
  if (editingName) {
    toast("Your name was updated.", "success");
  }
  editingName = false;
  enterHome();
}

// ---------- Start-up ----------
function wireEvents() {
  // Sign in
  $("guest-btn").addEventListener("click", () =>
    trySignIn(() => cloud.signInAsGuest(), $("guest-btn"))
  );
  $("google-btn").addEventListener("click", () =>
    trySignIn(() => cloud.signInWithGoogle(), $("google-btn"))
  );
  $("retry-btn").addEventListener("click", () => window.location.reload());
  $("offline-btn").addEventListener("click", playOffline);

  // Name
  $("name-form").addEventListener("submit", (event) => {
    event.preventDefault();
    saveName();
  });
  $("name-cancel-btn").addEventListener("click", () => {
    editingName = false;
    enterHome();
  });

  // Home and navigation
  $("start-btn").addEventListener("click", openSetup);
  $("editor-btn").addEventListener("click", openEditor);
  $("leaderboard-btn").addEventListener("click", openLeaderboard);
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.nav;
      if (target === "home") {
        enterHome();
      } else if (target === "play") {
        openSetup();
      } else if (target === "create") {
        openEditor();
      } else {
        openLeaderboard();
      }
    });
  });

  $("brand-link").addEventListener("click", async (event) => {
    if (!currentPlayer) {
      return; // signed out: let the link reload the page
    }
    event.preventDefault();
    if (currentScreen === "quiz-screen" && !answered) {
      const ok = await confirmAction({
        title: "Leave this quiz?",
        message: "Your progress in this game will be lost.",
        confirmLabel: "Leave quiz",
        danger: true
      });
      if (!ok) {
        return;
      }
    }
    enterHome();
  });

  // Setup and quiz
  $("begin-btn").addEventListener("click", startQuiz);
  $("setup-back-btn").addEventListener("click", enterHome);
  $("next-btn").addEventListener("click", goToNextQuestion);

  // Result
  $("play-again-btn").addEventListener("click", startQuiz);
  $("view-leaderboard-btn").addEventListener("click", openLeaderboard);
  $("home-btn").addEventListener("click", enterHome);

  // Leaderboard and editor
  $("leaderboard-retry-btn").addEventListener("click", () => loadLeaderboard(leaderboardPeriod));
  $("editor-form").addEventListener("submit", (event) => {
    event.preventDefault();
    saveNewQuestion();
  });
  $("editor-back-btn").addEventListener("click", enterHome);

  // Account menu
  $("account-btn").addEventListener("click", toggleAccountMenu);
  $("signout-btn").addEventListener("click", signOutPlayer);
  $("change-name-btn").addEventListener("click", () => {
    closeAccountMenu();
    editingName = true;
    openNameScreen();
  });
  document.addEventListener("click", (event) => {
    if (!$("account").contains(event.target)) {
      closeAccountMenu();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("account-menu").hidden) {
      closeAccountMenu();
      $("account-btn").focus();
    }
  });

  // Keyboard shortcuts for answering: 1 to 4 or A to D
  document.addEventListener("keydown", (event) => {
    if (currentScreen !== "quiz-screen" || answered) {
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const key = event.key.toLowerCase();
    let index = -1;
    if (key >= "1" && key <= "4") {
      index = Number(key) - 1;
    } else if (key.length === 1 && "abcd".includes(key)) {
      index = "abcd".indexOf(key);
    }
    if (index !== -1 && index < activeQuestions[currentIndex].options.length) {
      event.preventDefault();
      checkAnswer(index);
    }
  });

  // Header gets a border and shrinks a little once the page is scrolled
  const header = $("site-header");
  window.addEventListener(
    "scroll",
    () => header.classList.toggle("is-scrolled", window.scrollY > 8),
    { passive: true }
  );
}

async function connectCloud() {
  showScreen("loading-screen", { focus: false });

  try {
    cloud = await import("./firebase-config.js");
  } catch (error) {
    console.log("Could not start the online connection:", error);
    cloud = null;
    showSignin();
    $("cloud-error").hidden = false;
    return;
  }

  loadSharedQuestions();

  // If the sign-in service never answers, show the sign-in screen with a clear message
  authTimer = setTimeout(() => {
    if (!authResolved) {
      showSignin();
      $("cloud-error").hidden = false;
    }
  }, AUTH_WAIT_MS);

  cloud.watchAuth(onAuthChange);
}

initThemeToggle($("theme-toggle"));
wireEvents();
renderFacts();
observeReveals();
initPwa();
connectCloud();
