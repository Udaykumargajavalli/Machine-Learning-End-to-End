/* Removes the "Jump to career roles" button from the welcome slide.
   Hidden rather than deleted so app.js listeners that reference it don't break. */
(function () {
  function run() {
    Array.prototype.forEach.call(document.querySelectorAll("button, a"), function (el) {
      if (/^\s*jump\s+to\s+career\s+roles\s*$/i.test(el.textContent)) {
        el.style.setProperty("display", "none", "important");
        el.setAttribute("aria-hidden", "true");
        el.setAttribute("tabindex", "-1");
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
