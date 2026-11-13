// Small visual helpers used by app.js: theme switch, toasts, screen-reader
// announcements, number count-up and confetti. No game logic lives here.

const THEME_KEY = "qm-theme";

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Returns SVG markup that draws one icon from the sprite in index.html. */
export function icon(name) {
  return `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;
}

// ----- Theme -----
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#0a0a16" : "#f6f6fb");
  }
}

function describeToggle(button, theme) {
  const next = theme === "dark" ? "light" : "dark";
  button.setAttribute("aria-label", `Switch to ${next} theme`);
  button.setAttribute("title", `Switch to ${next} theme`);
}

export function initThemeToggle(button) {
  describeToggle(button, document.documentElement.getAttribute("data-theme"));

  button.addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    describeToggle(button, next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      // Private browsing can block storage. The theme still changes for this visit.
    }
  });

  // Follow the device setting while the player has not chosen a theme.
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", function (event) {
    let saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch (error) {
      saved = null;
    }
    if (saved === null) {
      const theme = event.matches ? "dark" : "light";
      applyTheme(theme);
      describeToggle(button, theme);
    }
  });
}

// ----- Screen reader announcements -----
export function announce(text) {
  const region = document.getElementById("sr-live");
  if (!region) {
    return;
  }
  region.textContent = "";
  // A short pause makes screen readers read repeated messages again.
  window.setTimeout(function () {
    region.textContent = text;
  }, 60);
}

// ----- Toasts -----
export function toast(message, type = "info", duration = 4000) {
  const region = document.getElementById("toast-region");
  if (!region) {
    return;
  }

  const item = document.createElement("div");
  item.className = `toast toast--${type}`;

  const iconName = type === "error" ? "x" : "check";
  item.insertAdjacentHTML("afterbegin", icon(iconName));

  const text = document.createElement("span");
  text.textContent = message;
  item.appendChild(text);

  region.appendChild(item);

  window.setTimeout(function () {
    item.classList.add("is-leaving");
    window.setTimeout(function () {
      item.remove();
    }, 260);
  }, duration);
}

// ----- Count-up -----
export function countUp(element, target, duration = 900, format = String) {
  if (prefersReducedMotion() || target <= 0) {
    element.textContent = format(target);
    return;
  }

  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = format(Math.round(target * eased));
    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

// ----- Confetti -----
export function confetti(duration = 2200) {
  if (prefersReducedMotion()) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const colors = ["#5b4bff", "#8a3cff", "#ff7ab8", "#ffb020", "#3ddc97", "#4aa8ff"];
  const pieces = [];

  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: canvas.width * (0.2 + Math.random() * 0.6),
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 14 * ratio,
      vy: (-Math.random() * 14 - 4) * ratio,
      size: (6 + Math.random() * 6) * ratio,
      color: colors[Math.floor(Math.random() * colors.length)],
      spin: Math.random() * Math.PI,
      spinSpeed: (Math.random() - 0.5) * 0.4
    });
  }

  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(function (piece) {
      piece.vy += 0.45 * ratio;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.spin += piece.spinSpeed;

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.spin);
      ctx.globalAlpha = Math.max(0, 1 - elapsed / duration);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
      ctx.restore();
    });

    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(frame);
}
