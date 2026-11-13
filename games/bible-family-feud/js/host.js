// Host Answer View — listens for live state broadcasts from the main
// game tab via BroadcastChannel and renders a read-only dashboard.
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const el = {
    syncStatus: $("sync-status"),
    current: $("host-current"),
    scoreboard: $("host-scoreboard"),
    roundList: $("host-round-list"),
    btnPrint: $("btn-print"),
  };

  let latest = null;

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  function render() {
    if (!latest) {
      el.current.innerHTML =
        '<p class="host-empty">Nothing live yet. Start the game on your main screen/tab, and this page will sync automatically.</p>';
      el.scoreboard.innerHTML = "";
      el.roundList.innerHTML = "";
      return;
    }

    const r = latest.currentRound;
    if (r) {
      const label = latest.isPractice
        ? "Practice Round"
        : `Round ${latest.roundIndex + 1} of ${latest.totalRounds}`;
      const turnName =
        latest.turn === "a" ? latest.teamNames.a : latest.teamNames.b;
      const phaseLine =
        latest.phase === "steal"
          ? `STEAL ATTEMPT \u2014 ${escapeHtml(turnName)} (strikes: ${latest.strikes}/3)`
          : `${escapeHtml(turnName)} on the buzzer (strikes: ${latest.strikes}/3)`;

      el.current.innerHTML = `
        <p class="host-current-label">${escapeHtml(label)}</p>
        <h2>${escapeHtml(r.question)}</h2>
        <ol class="host-answer-list" aria-label="Answers for the current question">
          ${r.answers
            .map((a, i) => {
              const done = r.revealedIdx.includes(i) ? "is-done" : "";
              return `<li class="${done}">${escapeHtml(a.text)} <span>(${a.points})</span></li>`;
            })
            .join("")}
        </ol>
        <p class="host-turn-line">${phaseLine}</p>
      `;
    }

    el.scoreboard.innerHTML = `
      <div class="host-score-card host-score-card--a">
        <span class="name">${escapeHtml(latest.teamNames.a)}</span>
        <span class="value">${latest.scores.a}</span>
      </div>
      <div class="host-score-card host-score-card--b">
        <span class="name">${escapeHtml(latest.teamNames.b)}</span>
        <span class="value">${latest.scores.b}</span>
      </div>
    `;

    el.roundList.innerHTML = (latest.allRounds || [])
      .map((round, i) => {
        const cls =
          !latest.isPractice && i === latest.roundIndex
            ? "is-current"
            : !latest.isPractice && i < latest.roundIndex
            ? "is-past"
            : "";
        return `
          <li class="${cls}">
            <strong>${escapeHtml(round.label)}</strong> &mdash; ${escapeHtml(round.question)}
            <ul>${round.answers
              .map((a) => `<li>${escapeHtml(a.text)} (${a.points})</li>`)
              .join("")}</ul>
          </li>`;
      })
      .join("");
  }

  if (!("BroadcastChannel" in window)) {
    el.syncStatus.textContent =
      "Live sync isn't supported in this browser. Please use a recent Chrome, Edge, or Firefox.";
  } else {
    const channel = new BroadcastChannel("bff-host-sync-v1");
    channel.onmessage = (e) => {
      const data = e.data;
      if (!data) return;
      if (data.type === "reset") {
        latest = null;
        el.syncStatus.textContent = "Waiting for the game to start on the main screen\u2026";
        el.syncStatus.classList.remove("is-synced");
        render();
        return;
      }
      if (data.type === "state") {
        latest = data;
        el.syncStatus.textContent = "Synced with the game screen";
        el.syncStatus.classList.add("is-synced");
        render();
      }
    };
    // ask the main tab to resend its current state in case we opened mid-game
    channel.postMessage({ type: "request-state" });
  }

  el.btnPrint.addEventListener("click", () => window.print());

  render();
})();
