// Bible Family Feud — game logic
(function () {
  "use strict";

  const state = {
    selectedRounds: [], // shuffled subset of ROUNDS chosen for this game
    roundIndex: 0,
    isPractice: false,

    phase: "control", // "control" (team on buzzer playing) | "steal" (other team's steal attempt)
    controlTeam: "a", // team that originally controlled this round
    stealTeam: null, // team currently attempting to steal (only set during "steal" phase)

    strikes: 0,
    pot: 0,
    turn: "a", // whichever team is currently acting (control OR steal team)
    revealedIdx: [], // indices of answers revealed so far this round
    scores: { a: 0, b: 0 },
    teamNames: { a: "Team Faith", b: "Team Grace" },
    revealedCount: 0,
    roundOver: false,
    soundOn: true,
    musicOn: true,
  };

  // ---------------------------------------------------------------- DOM refs
  const $ = (id) => document.getElementById(id);

  const main = $("main");
  const screens = {
    title: $("screen-title"),
    rules: $("screen-rules"),
    announce: $("screen-announce"),
    game: $("screen-game"),
    end: $("screen-end"),
  };

  const el = {
    teamAInput: $("team-a-name"),
    teamBInput: $("team-b-name"),
    roundsPerTeamSelect: $("rounds-per-team"),
    btnStart: $("btn-start"),
    btnRulesContinue: $("btn-rules-continue"),
    btnOpenHost: $("btn-open-host"),
    btnOpenHost2: $("btn-open-host-2"),
    practiceBanner: $("practice-banner"),
    phaseBanner: $("phase-banner"),
    announceCard: $("announce-card"),
    announceContext: $("announce-context"),
    announceTeam: $("announce-team"),
    announceSub: $("announce-sub"),
    announceCount: $("announce-count"),
    roundLabel: $("round-label"),
    roundProgress: $("round-progress"),
    questionText: $("question-text"),
    board: $("board"),
    strikesLabel: $("strikes-label"),
    dangerMessage: $("danger-message"),
    strikes: Array.from(document.querySelectorAll(".strike")),
    scoreCardA: $("score-card-a"),
    scoreCardB: $("score-card-b"),
    scoreNameA: $("score-name-a"),
    scoreNameB: $("score-name-b"),
    scoreValueA: $("score-value-a"),
    scoreValueB: $("score-value-b"),
    scoreStatusA: $("score-status-a"),
    scoreStatusB: $("score-status-b"),
    potValue: $("pot-value"),
    potTarget: $("pot-target"),
    btnTurnA: $("btn-turn-a"),
    btnTurnB: $("btn-turn-b"),
    btnStrike: $("btn-strike"),
    btnRevealAll: $("btn-reveal-all"),
    btnNextRound: $("btn-next-round"),
    btnResetScores: $("btn-reset-scores"),
    btnRestart: $("btn-restart"),
    btnFullscreen: $("btn-fullscreen"),
    soundToggle: $("sound-toggle"),
    musicToggle: $("music-toggle"),
    finalNameA: $("final-name-a"),
    finalNameB: $("final-name-b"),
    finalValueA: $("final-value-a"),
    finalValueB: $("final-value-b"),
    winnerLine: $("winner-line"),
    finalTrophy: $("final-trophy"),
    btnPlayAgain: $("btn-play-again"),
  };

  // ---------------------------------------------------------------- helpers
  function teamName(team) {
    return team === "a" ? state.teamNames.a : state.teamNames.b;
  }
  function oppositeTeam(team) {
    return team === "a" ? "b" : "a";
  }

  // ---------------------------------------------------------------- sound (synthesized, no assets needed)
  let audioCtx = null;
  function ctx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null; // very old browser: the game still works silently
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  // low-level tone, ungated — used by both SFX (gated by soundOn) and music (gated by musicOn)
  function playTone(freq, duration, type, delay, gain) {
    const c = ctx();
    if (!c) return;
    const osc = c.createOscillator();
    const amp = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    amp.gain.value = gain != null ? gain : 0.12;
    osc.connect(amp).connect(c.destination);
    const t0 = c.currentTime + (delay || 0);
    osc.start(t0);
    amp.gain.setValueAtTime(amp.gain.value, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.stop(t0 + duration + 0.02);
  }
  function tone(freq, duration, type, delay, gain) {
    if (!state.soundOn) return;
    playTone(freq, duration, type, delay, gain);
  }
  function playDing() {
    tone(660, 0.14, "triangle", 0, 0.15);
    tone(880, 0.22, "triangle", 0.09, 0.15);
  }
  function playBuzz(strikeNumber) {
    if (strikeNumber === 1) {
      tone(150, 0.28, "sawtooth", 0, 0.13);
    } else if (strikeNumber === 2) {
      tone(160, 0.2, "sawtooth", 0, 0.14);
      tone(120, 0.3, "square", 0.16, 0.13);
    } else {
      tone(230, 0.16, "sawtooth", 0, 0.16);
      tone(190, 0.16, "sawtooth", 0.15, 0.16);
      tone(140, 0.4, "square", 0.3, 0.16);
    }
  }
  function playStealAlertSound() {
    [220, 330, 440, 550].forEach((f, i) => tone(f, 0.16, "sawtooth", i * 0.09, 0.13));
  }
  function playWinFanfare() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.28, "triangle", i * 0.14, 0.14));
  }
  function playCountdownTick() {
    tone(392, 0.14, "triangle", 0, 0.14);
  }
  function playCountdownGo() {
    [523, 784].forEach((f, i) => tone(f, 0.22, "triangle", i * 0.08, 0.16));
  }

  // ---------------------------------------------------------------- background music
  // A genuinely continuous, solemn open-fifth drone (two oscillators that
  // start once and never stop while music is on) with a slow modal pad
  // and soft bell shimmer layered on top — reverent rather than jaunty.
  const padChords = [
    [220.0, 329.63, 440.0], // A - E - A (open, spacious)
    [174.61, 261.63, 349.23], // F - C - F
    [164.81, 246.94, 329.63], // E - B - E
    [146.83, 220.0, 293.66], // D - A - D
  ];
  let droneOsc1 = null;
  let droneOsc2 = null;
  let droneGain = null;
  let padHandle = null;
  let padChordIndex = 0;

  function musicDuckTarget() {
    if (state.phase === "steal") return 0.3;
    if (state.strikes >= 2) return 0.5;
    if (state.strikes === 1) return 0.75;
    return 1;
  }

  function updateMusicDucking() {
    if (!droneGain) return;
    const c = ctx();
    if (!c) return;
    const target = state.musicOn ? 0.05 * musicDuckTarget() : 0;
    droneGain.gain.cancelScheduledValues(c.currentTime);
    droneGain.gain.linearRampToValueAtTime(target, c.currentTime + 0.8);
  }

  function scheduleMusicPad() {
    if (!state.musicOn) return;
    const chord = padChords[padChordIndex % padChords.length];
    const duck = musicDuckTarget();
    chord.forEach((freq, i) => {
      playTone(freq, 5.4, "sine", i * 0.06, 0.03 * duck);
    });
    if (padChordIndex % 2 === 0) {
      // a soft, slightly detuned bell shimmer for a reverent touch
      const bellFreq = chord[chord.length - 1] * 2;
      playTone(bellFreq, 3.4, "sine", 0.7, 0.018 * duck);
      playTone(bellFreq * 1.004, 3.4, "sine", 0.7, 0.014 * duck);
    }
    padChordIndex += 1;
  }

  function startMusic() {
    if (droneOsc1) return; // already playing
    const c = ctx();
    if (!c) return;
    droneGain = c.createGain();
    droneGain.gain.value = 0;
    droneGain.connect(c.destination);

    droneOsc1 = c.createOscillator();
    droneOsc1.type = "sine";
    droneOsc1.frequency.value = 110.0; // A2
    droneOsc1.connect(droneGain);
    droneOsc1.start();

    droneOsc2 = c.createOscillator();
    droneOsc2.type = "sine";
    droneOsc2.frequency.value = 164.81; // E3 — a perfect fifth above, open and solemn
    droneOsc2.connect(droneGain);
    droneOsc2.start();

    updateMusicDucking();
    scheduleMusicPad();
    padHandle = setInterval(scheduleMusicPad, 5500);
  }

  function stopMusic() {
    if (padHandle) {
      clearInterval(padHandle);
      padHandle = null;
    }
    if (droneOsc1) {
      try {
        const c = ctx();
        droneGain.gain.cancelScheduledValues(c.currentTime);
        droneGain.gain.linearRampToValueAtTime(0, c.currentTime + 0.6);
        droneOsc1.stop(c.currentTime + 0.7);
        droneOsc2.stop(c.currentTime + 0.7);
      } catch (e) {
        /* ignore if already stopped */
      }
      droneOsc1 = null;
      droneOsc2 = null;
      droneGain = null;
    }
  }

  // ---------------------------------------------------------------- host view sync (BroadcastChannel)
  let hostChannel = null;
  function hostChannelInstance() {
    if (!hostChannel && "BroadcastChannel" in window) {
      hostChannel = new BroadcastChannel("bff-host-sync-v1");
      hostChannel.onmessage = (e) => {
        if (e.data && e.data.type === "request-state") broadcastState();
      };
    }
    return hostChannel;
  }

  function broadcastState() {
    const c = hostChannelInstance();
    if (!c) return;
    const round = currentRound();
    c.postMessage({
      type: "state",
      teamNames: state.teamNames,
      scores: state.scores,
      turn: state.turn,
      phase: state.phase,
      strikes: state.strikes,
      isPractice: state.isPractice,
      roundIndex: state.roundIndex,
      totalRounds: state.selectedRounds.length,
      currentRound: round
        ? {
            label: round.label,
            question: round.question,
            answers: round.answers,
            revealedIdx: state.revealedIdx.slice(),
          }
        : null,
      allRounds: state.selectedRounds,
    });
  }

  function broadcastReset() {
    const c = hostChannelInstance();
    if (!c) return;
    c.postMessage({ type: "reset" });
  }

  function openHostView() {
    if (!("BroadcastChannel" in window)) {
      window.alert(
        "Live sync needs a modern browser (Chrome, Edge, or Firefox). You can still open host.html manually in a new tab."
      );
    }
    const win = window.open("host.html", "bffHostView", "width=480,height=840");
    if (!win) {
      window.alert(
        "Your browser blocked the pop-up. Please allow pop-ups for this site, or open host.html manually in a new tab."
      );
    } else {
      setTimeout(broadcastState, 400);
    }
  }

  // ---------------------------------------------------------------- shuffle
  function shuffle(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------------------------------------------------------------- screen switching
  function showScreen(name) {
    Object.entries(screens).forEach(([key, node]) => {
      const active = key === name;
      node.classList.toggle("is-active", active);
      node.hidden = !active;
    });
    // keep keyboard and screen-reader users oriented when the view changes
    if (main && name !== "announce") main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------- get-ready announcement
  let announceHandle = null;
  function stopAnnounceCountdown() {
    if (announceHandle) {
      clearInterval(announceHandle);
      announceHandle = null;
    }
  }
  function announceTurn(team, contextText, isSteal, onComplete) {
    stopAnnounceCountdown();
    el.announceContext.textContent = contextText;
    el.announceTeam.textContent = teamName(team);
    el.announceSub.textContent = isSteal ? "steal attempt \u2014 get ready!" : "get ready!";
    el.announceCard.classList.toggle("announce-card--steal", !!isSteal);
    let n = 3;
    el.announceCount.textContent = String(n);
    el.announceCount.classList.remove("is-go");
    showScreen("announce");
    playCountdownTick();
    announceHandle = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        stopAnnounceCountdown();
        el.announceCount.textContent = "GO!";
        el.announceCount.classList.add("is-go");
        playCountdownGo();
        setTimeout(() => {
          showScreen("game");
          if (onComplete) onComplete();
        }, 550);
        return;
      }
      el.announceCount.textContent = String(n);
      playCountdownTick();
    }, 1000);
  }

  // ---------------------------------------------------------------- phase banner (in-game reminder)
  function announceAlert(text) {
    el.phaseBanner.textContent = text;
    el.phaseBanner.hidden = false;
    el.phaseBanner.className = "banner banner--alert";
  }
  function announceOutcome(text) {
    el.phaseBanner.textContent = text;
    el.phaseBanner.hidden = false;
    el.phaseBanner.className = "banner banner--outcome";
  }
  function clearBanner() {
    el.phaseBanner.hidden = true;
    el.phaseBanner.className = "banner";
  }

  // ---------------------------------------------------------------- danger visuals
  function resetDangerVisuals() {
    screens.game.classList.remove("danger-1", "danger-2", "danger-3", "phase-steal");
    el.dangerMessage.textContent = "";
    updateMusicDucking();
  }
  function updateDangerUI() {
    screens.game.classList.remove("danger-1", "danger-2");
    updateMusicDucking();
    if (state.strikes === 0) {
      el.dangerMessage.textContent = "";
      return;
    }
    const cls = state.strikes === 1 ? "danger-1" : "danger-2";
    screens.game.classList.add(cls);
    if (state.phase === "control") {
      const stealer = teamName(oppositeTeam(state.turn));
      el.dangerMessage.textContent =
        state.strikes === 1
          ? `Miss! ${stealer} is watching for a steal chance.`
          : `One more miss and ${stealer} can attempt to steal the pot!`;
    } else {
      const original = teamName(state.controlTeam);
      el.dangerMessage.textContent =
        state.strikes === 1
          ? "Miss! One slip away from losing the steal."
          : `One more miss and ${original} keeps the pot safe!`;
    }
  }

  // ---------------------------------------------------------------- turn / buzzer control
  function disableTurnChips(disabled) {
    el.btnTurnA.disabled = disabled;
    el.btnTurnB.disabled = disabled;
  }

  function setTurn(turn) {
    state.turn = turn;
    if (state.phase === "control") {
      state.controlTeam = turn;
      state.strikes = 0;
      updateStrikesUI();
      resetDangerVisuals();
    }
    el.btnTurnA.classList.toggle("is-active", turn === "a");
    el.btnTurnB.classList.toggle("is-active", turn === "b");
    el.btnTurnA.setAttribute("aria-pressed", String(turn === "a"));
    el.btnTurnB.setAttribute("aria-pressed", String(turn === "b"));
    el.btnTurnA.textContent = state.teamNames.a;
    el.btnTurnB.textContent = state.teamNames.b;
    el.scoreCardA.classList.toggle("is-current", turn === "a");
    el.scoreCardB.classList.toggle("is-current", turn === "b");
    const name = teamName(turn);
    const badge =
      state.phase === "steal" ? "Stealing!" : "On the Buzzer";
    el.scoreStatusA.textContent = turn === "a" ? badge : "";
    el.scoreStatusB.textContent = turn === "b" ? badge : "";
    el.potTarget.textContent = name;
    el.strikesLabel.textContent = `${name}\u2019s strikes`;
  }

  // ---------------------------------------------------------------- board rendering
  function currentRound() {
    if (state.isPractice) return PRACTICE_ROUND;
    return state.selectedRounds[state.roundIndex] || null;
  }

  function renderRound() {
    const round = currentRound();
    clearBanner();
    resetDangerVisuals();
    el.practiceBanner.hidden = !state.isPractice;

    if (state.isPractice) {
      el.roundLabel.textContent = "Practice Round";
      el.roundProgress.textContent = "warm-up";
      el.btnNextRound.textContent = "Start Real Game \u2192";
    } else {
      el.roundLabel.textContent = round.label;
      el.roundProgress.textContent = `${state.roundIndex + 1} / ${state.selectedRounds.length}`;
      el.btnNextRound.textContent = "Next Round \u2192";
    }
    el.questionText.textContent = round.question;

    el.board.innerHTML = "";
    round.answers.forEach((ans, i) => {
      const tile = document.createElement("button");
      tile.className = "board-tile";
      tile.type = "button";
      tile.setAttribute("aria-label", `Answer slot ${i + 1}`);
      tile.dataset.idx = String(i);
      tile.append(buildTileFaces(i, ans));
      tile.addEventListener("click", () => revealTile(tile, ans, i));
      el.board.appendChild(tile);
    });

    state.phase = "control";
    state.stealTeam = null;
    state.strikes = 0;
    state.pot = 0;
    state.revealedCount = 0;
    state.revealedIdx = [];
    state.roundOver = false;
    updateStrikesUI();
    updatePotUI();
    el.btnNextRound.disabled = true;
    disableTurnChips(false);

    const controlTeamForRound = state.isPractice
      ? "a"
      : state.roundIndex % 2 === 0
      ? "a"
      : "b";
    setTurn(controlTeamForRound);
    broadcastState();
  }

  function buildTileFaces(i, ans) {
    const make = (tag, cls, text) => {
      const node = document.createElement(tag);
      node.className = cls;
      if (text != null) node.textContent = text;
      return node;
    };
    const inner = make("span", "tile-inner");
    const front = make("span", "tile-face tile-front");
    front.append(make("span", "tile-number", String(i + 1)), make("span", "tile-placeholder"));
    const back = make("span", "tile-face tile-back");
    back.append(make("span", "tile-text", ans.text), make("span", "tile-points", String(ans.points)));
    inner.append(front, back);
    return inner;
  }

  function revealTile(tileEl, ans, idx) {
    if (tileEl.classList.contains("is-revealed") || state.roundOver) return;
    tileEl.classList.add("is-revealed");
    tileEl.setAttribute("aria-label", `${ans.text}, ${ans.points} points`);
    state.revealedIdx.push(idx);
    state.pot += ans.points;
    state.revealedCount += 1;
    updatePotUI();
    playDing();
    broadcastState();
    if (state.revealedCount === currentRound().answers.length) {
      finalizeRound(state.turn, { steal: state.phase === "steal" });
    }
  }

  function revealRemainingDisplayOnly() {
    const round = currentRound();
    Array.from(el.board.querySelectorAll(".board-tile")).forEach((t, i) => {
      if (!t.classList.contains("is-revealed")) {
        t.classList.add("is-revealed");
        t.setAttribute("aria-label", `${round.answers[i].text}, ${round.answers[i].points} points`);
        if (!state.revealedIdx.includes(i)) state.revealedIdx.push(i);
      }
    });
  }

  function updatePotUI() {
    el.potValue.textContent = String(state.pot);
    el.potValue.classList.remove("is-bump");
    void el.potValue.offsetWidth; // restart the CSS animation
    if (state.pot > 0) el.potValue.classList.add("is-bump");
  }

  function updateStrikesUI() {
    el.strikes.forEach((s, i) => s.classList.toggle("is-active", i < state.strikes));
  }

  function addStrike() {
    if (state.roundOver) return;
    if (state.strikes >= 3) return;
    state.strikes += 1;
    updateStrikesUI();
    playBuzz(state.strikes);
    broadcastState();

    if (state.strikes < 3) {
      updateDangerUI();
      return;
    }

    // third strike
    if (state.phase === "control") {
      state.stealTeam = oppositeTeam(state.controlTeam);
      state.phase = "steal";
      state.strikes = 0;
      updateStrikesUI();
      resetDangerVisuals();
      disableTurnChips(true);
      setTurn(state.stealTeam);
      broadcastState();
      playStealAlertSound();
      const stealerName = teamName(state.stealTeam);
      announceTurn(state.stealTeam, "Steal Attempt!", true, () => {
        screens.game.classList.add("phase-steal");
        announceAlert(
          `STEAL ATTEMPT \u2014 clear the board before 3 misses, or ${teamName(
            state.controlTeam
          )} keeps the pot!`
        );
      });
    } else {
      // the steal attempt itself struck out
      screens.game.classList.remove("phase-steal");
      revealRemainingDisplayOnly();
      finalizeRound(state.controlTeam, { stealFailed: true });
    }
  }

  function finalizeRound(awardTeam, meta) {
    meta = meta || {};
    if (state.roundOver) return;
    state.roundOver = true;
    screens.game.classList.remove("danger-1", "danger-2", "phase-steal");
    disableTurnChips(true);
    el.scoreCardA.classList.remove("is-current");
    el.scoreCardB.classList.remove("is-current");
    el.scoreStatusA.textContent = "";
    el.scoreStatusB.textContent = "";
    el.btnNextRound.disabled = false;

    const wonPoints = state.pot;
    if (!state.isPractice && wonPoints > 0) {
      state.scores[awardTeam] += wonPoints;
      updateScoresUI();
    }
    broadcastState();

    if (wonPoints <= 0) {
      clearBanner();
      return;
    }

    playWinFanfare();
    let text;
    if (meta.steal) {
      text = `STOLEN! ${teamName(awardTeam)} steals ${wonPoints} points!`;
    } else if (meta.stealFailed) {
      text = `Steal failed \u2014 ${teamName(awardTeam)} keeps ${wonPoints} points.`;
    } else {
      text = `${teamName(awardTeam)} banks ${wonPoints} points!`;
    }
    announceOutcome(text);
  }

  function endRoundManually() {
    if (state.roundOver) return;
    revealRemainingDisplayOnly();
    if (state.phase === "control") {
      finalizeRound(state.turn, {});
    } else {
      finalizeRound(state.controlTeam, { stealFailed: true });
    }
  }

  function updateScoresUI() {
    el.scoreValueA.textContent = String(state.scores.a);
    el.scoreValueB.textContent = String(state.scores.b);
  }

  function nextRound() {
    if (state.isPractice) {
      state.isPractice = false;
      state.roundIndex = 0;
      renderRound();
      announceTurn(state.controlTeam, `Round 1 of ${state.selectedRounds.length}`, false);
      return;
    }
    if (state.roundIndex + 1 >= state.selectedRounds.length) {
      endShow();
      return;
    }
    state.roundIndex += 1;
    renderRound();
    announceTurn(
      state.controlTeam,
      `Round ${state.roundIndex + 1} of ${state.selectedRounds.length}`,
      false
    );
  }

  // ---------------------------------------------------------------- end screen
  function endShow() {
    el.finalNameA.textContent = state.teamNames.a;
    el.finalNameB.textContent = state.teamNames.b;
    el.finalValueA.textContent = String(state.scores.a);
    el.finalValueB.textContent = String(state.scores.b);

    let line;
    if (state.scores.a === state.scores.b) {
      line = "It's a tie — bragging rights shared!";
      el.finalTrophy.textContent = "\u{1F91D}";
    } else if (state.scores.a > state.scores.b) {
      line = `${state.teamNames.a} wins the feud!`;
      el.finalTrophy.textContent = "\u{1F3C6}";
    } else {
      line = `${state.teamNames.b} wins the feud!`;
      el.finalTrophy.textContent = "\u{1F3C6}";
    }
    el.winnerLine.textContent = line;
    showScreen("end");
    playWinFanfare();
    launchConfetti();
  }

  function launchConfetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#f2b544", "#fb5a6e", "#4cc9f0", "#34d399", "#f6f1e4"];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = 2.2 + Math.random() * 1.6 + "s";
      piece.style.opacity = String(0.7 + Math.random() * 0.3);
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }
  }

  // ---------------------------------------------------------------- reset / start
  function prepareGame() {
    state.teamNames.a = el.teamAInput.value.trim() || "Team A";
    state.teamNames.b = el.teamBInput.value.trim() || "Team B";
    saveSettings();
    state.scores = { a: 0, b: 0 };

    const perTeam = parseInt(el.roundsPerTeamSelect.value, 10) || 5;
    const totalWanted = Math.min(perTeam * 2, ROUNDS.length);
    state.selectedRounds = shuffle(ROUNDS).slice(0, totalWanted);
    state.roundIndex = 0;
    state.isPractice = true;
    state.phase = "control";

    el.scoreNameA.textContent = state.teamNames.a;
    el.scoreNameB.textContent = state.teamNames.b;
    updateScoresUI();
    setTurn("a");

    if (state.musicOn) startMusic();
    requestWakeLock();
    showScreen("rules");
  }

  function beginPracticeRound() {
    renderRound();
    announceTurn(state.controlTeam, "Practice Round", false);
  }

  function resetScores() {
    state.scores = { a: 0, b: 0 };
    updateScoresUI();
    broadcastState();
  }

  function returnToTitle() {
    stopAnnounceCountdown();
    stopMusic();
    releaseWakeLock();
    document.querySelectorAll(".confetti-piece").forEach((n) => n.remove());
    broadcastReset();
    showScreen("title");
  }
  function restartShow() {
    returnToTitle();
  }

  // ---------------------------------------------------------------- saved setup + screen wake lock
  const SETTINGS_KEY = "bff-settings-v1";
  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
      if (!saved) return;
      if (typeof saved.a === "string") el.teamAInput.value = saved.a.slice(0, 24);
      if (typeof saved.b === "string") el.teamBInput.value = saved.b.slice(0, 24);
      if (saved.rounds && Array.from(el.roundsPerTeamSelect.options).some((o) => o.value === String(saved.rounds))) {
        el.roundsPerTeamSelect.value = String(saved.rounds);
      }
    } catch (e) {
      /* storage unavailable or corrupt: fall back to defaults */
    }
  }
  function saveSettings() {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ a: state.teamNames.a, b: state.teamNames.b, rounds: el.roundsPerTeamSelect.value })
      );
    } catch (e) {
      /* storage unavailable: nothing to do */
    }
  }

  // keeps the projector from dimming mid-show where the browser supports it
  let wakeLock = null;
  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => { wakeLock = null; });
      }
    } catch (e) {
      /* denied or unsupported: ignore */
    }
  }
  function releaseWakeLock() {
    if (wakeLock) wakeLock.release().catch(() => {});
    wakeLock = null;
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !screens.title.classList.contains("is-active")) requestWakeLock();
  });

  // ---------------------------------------------------------------- fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // ---------------------------------------------------------------- wire up events
  el.btnStart.addEventListener("click", prepareGame);
  el.btnRulesContinue.addEventListener("click", beginPracticeRound);
  el.btnOpenHost.addEventListener("click", openHostView);
  el.btnOpenHost2.addEventListener("click", openHostView);
  el.btnTurnA.addEventListener("click", () => setTurn("a"));
  el.btnTurnB.addEventListener("click", () => setTurn("b"));
  el.btnStrike.addEventListener("click", addStrike);
  el.btnRevealAll.addEventListener("click", endRoundManually);
  el.btnNextRound.addEventListener("click", nextRound);
  el.btnResetScores.addEventListener("click", resetScores);
  el.btnRestart.addEventListener("click", restartShow);
  el.btnFullscreen.addEventListener("click", toggleFullscreen);
  el.btnPlayAgain.addEventListener("click", returnToTitle);
  $("team-form").addEventListener("submit", (e) => e.preventDefault());
  el.soundToggle.addEventListener("change", (e) => {
    state.soundOn = e.target.checked;
  });
  el.musicToggle.addEventListener("change", (e) => {
    state.musicOn = e.target.checked;
    if (state.musicOn) startMusic();
    else stopMusic();
  });

  // keyboard shortcuts for the host: X = strike, N = next round, H = host view, 1-8 = flip tile
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // never hijack typing in the team-name boxes or the rounds menu
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA") && t.type !== "checkbox") return;
    const key = e.key.toLowerCase();
    if (key === "h") {
      openHostView();
      return;
    }
    if (!screens.game.classList.contains("is-active")) return;
    if (key === "x") addStrike();
    else if (key === "n" && !el.btnNextRound.disabled) nextRound();
    else if (/^[1-8]$/.test(key)) {
      const tile = el.board.children[Number(key) - 1];
      if (tile) tile.click();
    }
  });

  // init
  loadSettings();
  document.title = `${SHOW_INFO.title} — ${SHOW_INFO.subtitle}`;
})();
