// Small script for the simple pages (privacy and 404): wires up the theme switch.
import { initThemeToggle } from "./effects.js";

const toggle = document.getElementById("theme-toggle");
if (toggle) {
  initThemeToggle(toggle);
}
