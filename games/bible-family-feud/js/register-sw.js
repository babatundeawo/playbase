// Registers the offline service worker (sw.js). Failure is harmless:
// the site works the same without it, just not offline.
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
