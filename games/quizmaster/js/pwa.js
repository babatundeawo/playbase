// Installing and updating the app: service worker registration, the update
// prompt, the Android/desktop install prompt and the iPhone instructions.
import { toast } from "./effects.js";

const DISMISS_KEY = "qm-install-dismissed";
const DISMISS_DAYS = 14;
const SHOW_AFTER_MS = 20000;

let installEvent = null;
let bar = null;

function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const iosDevice =
    /iPhone|iPad|iPod/.test(ua) ||
    (ua.includes("Macintosh") && window.navigator.maxTouchPoints > 1);
  return iosDevice && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

function recentlyDismissed() {
  try {
    const saved = Number(localStorage.getItem(DISMISS_KEY));
    return saved > 0 && Date.now() - saved < DISMISS_DAYS * 86400000;
  } catch (error) {
    return false;
  }
}

function rememberDismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch (error) {
    // Storage is blocked: the prompt may appear again, which is harmless.
  }
}

function button(label, className, onClick) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = className;
  item.textContent = label;
  item.addEventListener("click", onClick);
  return item;
}

function showBar(message, actions, label) {
  closeBar();
  bar = document.createElement("div");
  bar.className = "pwa-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", label);

  const text = document.createElement("p");
  text.className = "pwa-bar__text";
  text.textContent = message;

  const row = document.createElement("div");
  row.className = "pwa-bar__actions";
  actions.forEach((action) => row.appendChild(action));

  bar.append(text, row);
  document.body.appendChild(bar);
}

function closeBar() {
  if (bar) {
    bar.remove();
    bar = null;
  }
}

function dismissInstall() {
  rememberDismiss();
  closeBar();
}

function offerInstall() {
  if (isInstalled() || recentlyDismissed() || bar) {
    return;
  }
  if (installEvent) {
    showBar(
      "Install QuizMaster for quick access and offline play.",
      [
        button("Install", "btn btn--primary btn--sm", async () => {
          const promptEvent = installEvent;
          installEvent = null;
          closeBar();
          promptEvent.prompt();
          await promptEvent.userChoice;
        }),
        button("Not now", "btn btn--ghost btn--sm", dismissInstall)
      ],
      "Install the app"
    );
  } else if (isIosSafari()) {
    showBar(
      "To install: tap the Share button in Safari, then choose Add to Home Screen.",
      [button("Got it", "btn btn--primary btn--sm", dismissInstall)],
      "Install the app on iPhone"
    );
  }
}

function offerUpdate(worker) {
  showBar(
    "A new version of QuizMaster is ready.",
    [
      button("Refresh", "btn btn--primary btn--sm", () => {
        worker.postMessage({ type: "SKIP_WAITING" });
      }),
      button("Later", "btn btn--ghost btn--sm", closeBar)
    ],
    "Update available"
  );
}

function watchUpdates(registration) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    offerUpdate(registration.waiting);
  }
  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    if (!worker) {
      return;
    }
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        offerUpdate(worker);
      }
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      registration.update().catch(() => {});
    }
  });
}

export function initPwa() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installEvent = event;
  });

  window.addEventListener("appinstalled", () => {
    installEvent = null;
    closeBar();
    toast("QuizMaster is installed.", "success");
  });

  window.addEventListener("offline", () => toast("You are offline. Built-in questions still work.", "info"));
  window.addEventListener("online", () => toast("You are back online.", "success"));

  window.setTimeout(offerInstall, SHOW_AFTER_MS);

  if (!("serviceWorker" in navigator)) {
    return;
  }
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!reloading && document.readyState !== "loading") {
      reloading = true;
      window.location.reload();
    }
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(watchUpdates)
      .catch(() => {});
  });
}
