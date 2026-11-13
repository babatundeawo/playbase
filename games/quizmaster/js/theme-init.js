// Runs before the page is painted, so the right theme shows with no flash.
// Order of choice: the player's saved choice, then the device setting, then light.
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  var saved = null;
  try {
    saved = localStorage.getItem("qm-theme");
  } catch (error) {
    saved = null;
  }

  var prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";

  root.setAttribute("data-theme", theme);

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#0a0a16" : "#f6f6fb");
  }
})();
