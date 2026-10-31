/* "Export PDF" button: walks every slide in order and every sub-tab inside it,
   snapshots each state as its own page, then opens the browser print dialog
   (choose "Save as PDF"). Load after app.js. */
(function () {
  var EXCLUDE = /reset|train|run\b|start|stop|next|prev|back|submit|check|shuffle|play|pause|full\s*screen|theme|print|pdf|copy|clear|retry|answer|reveal|step|generate|random|add|remove/i;
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var arr = function (x) { return Array.prototype.slice.call(x); };

  function css() {
    var s = document.createElement("style");
    s.textContent = [
      "#pp-btn{position:fixed;right:18px;bottom:18px;z-index:99999;padding:.6rem 1rem;border-radius:999px;border:1px solid rgba(108,140,255,.6);background:#6c8cff;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.3)}",
      "#pp-btn:disabled{opacity:.7;cursor:wait}",
      "#pp-overlay{position:fixed;inset:0;z-index:99998;background:rgba(10,14,30,.75);color:#fff;display:flex;align-items:center;justify-content:center;font:600 18px system-ui,sans-serif;text-align:center;padding:2rem;white-space:pre-line}",
      ".pp-capture{display:block!important;visibility:visible!important;position:absolute!important;left:-30000px!important;top:0!important;width:1100px!important;height:auto!important;max-height:none!important;opacity:1!important;transform:none!important}",
      "@media screen{#pp-root{display:none!important}}",
      "@media print{",
      "  @page{size:A4 landscape;margin:8mm}",
      "  html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact;height:auto!important;overflow:visible!important}",
      "  #pp-btn,#pp-overlay,.pp-hide{display:none!important}",
      "  .pp-anc{display:block!important;position:static!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;transform:none!important;width:auto!important;margin:0!important;padding:0!important;grid-template-columns:none!important}",
      "  #pp-root{display:block!important}",
      "  .pp-page{display:block!important;position:relative!important;inset:auto!important;left:auto!important;top:auto!important;transform:none!important;opacity:1!important;visibility:visible!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;width:auto!important;margin:0!important;break-after:page;page-break-after:always;break-inside:auto}",
      "  .pp-page:last-child{break-after:auto;page-break-after:auto}",
      "  .pp-page *{animation:none!important;transition:none!important}",
      "  .pp-page [class*=panel],.pp-page [class*=content],.pp-page [class*=body],.pp-page [class*=scroll]{max-height:none!important;overflow:visible!important}",
      "  .pp-label{display:flex!important;justify-content:space-between;gap:1rem;font:600 11px system-ui,sans-serif;opacity:.75;border-bottom:1px solid rgba(148,163,184,.4);padding-bottom:4px;margin-bottom:8px}",
      "}"
    ].join("\n");
    document.head.appendChild(s);
  }

  function topSlides() {
    var all = arr(document.querySelectorAll("section.slide")).filter(function (s) {
      return !s.closest("[hidden],[aria-hidden='true']") && !s.closest("#pp-root");
    });
    var counts = new Map();
    all.forEach(function (s) { counts.set(s.parentElement, (counts.get(s.parentElement) || 0) + 1); });
    var deck = null, best = 0;
    counts.forEach(function (n, p) { if (n > best) { best = n; deck = p; } });
    return all.filter(function (s) { return s.parentElement === deck; });
  }

  function titleOf(s) {
    var h = s.querySelector("h1,h2");
    return (s.getAttribute("data-title") || (h && h.textContent) || s.id || "Slide").trim();
  }

  function isTabBtn(b) {
    if (!/^(BUTTON|A)$/.test(b.tagName)) return false;
    if (b.tagName === "A" && b.getAttribute("href") && !/^#/.test(b.getAttribute("href")) && b.getAttribute("role") !== "tab") return false;
    var t = (b.textContent || "").trim();
    if (!t || t.length > 60) return false;
    if (b.closest("form") || b.disabled) return false;
    return !EXCLUDE.test(t) || b.getAttribute("role") === "tab";
  }

  function findBars(s) {
    return arr(s.querySelectorAll("*")).filter(function (el) {
      return arr(el.children).filter(isTabBtn).length >= 2;
    });
  }

  function visible(b) { return b.isConnected && b.offsetParent !== null; }

  var seq = 0;
  function snapshot(s, num, title, label, root) {
    var canv = arr(s.querySelectorAll("canvas")).map(function (c) {
      try { return c.toDataURL(); } catch (e) { return null; }
    });
    var c = s.cloneNode(true);
    c.classList.remove("pp-capture");
    c.classList.add("active", "pp-page");
    c.removeAttribute("hidden");
    c.removeAttribute("aria-hidden");
    c.removeAttribute("style");
    arr(c.querySelectorAll("details")).forEach(function (d) { d.open = true; });
    arr(c.querySelectorAll("canvas")).forEach(function (cv, i) {
      if (!canv[i]) return;
      var img = document.createElement("img");
      img.src = canv[i];
      img.style.maxWidth = "100%";
      cv.replaceWith(img);
    });
    var sfx = "-pp" + (++seq);
    var ids = {};
    arr(c.querySelectorAll("[id]")).concat([c]).forEach(function (el) { ids[el.id] = el.id + sfx; el.id = el.id + sfx; });
    arr(c.querySelectorAll("*")).forEach(function (el) {
      arr(el.attributes).forEach(function (at) {
        if (/url\(#|^#/.test(at.value)) {
          var v = at.value.replace(/url\(#([^)]+)\)/g, function (m, id) { return ids[id] ? "url(#" + ids[id] + ")" : m; })
            .replace(/^#(.+)$/, function (m, id) { return ids[id] ? "#" + ids[id] : m; });
          if (v !== at.value) el.setAttribute(at.name, v);
        }
      });
    });
    var lab = document.createElement("div");
    lab.className = "pp-label";
    lab.style.display = "none";
    lab.innerHTML = "<span></span><span></span>";
    lab.children[0].textContent = num + ". " + title + (label ? "  —  " + label : "");
    lab.children[1].textContent = "Overview of Machine Learning End to End";
    c.insertBefore(lab, c.firstChild);
    root.appendChild(c);
  }

  function keyOf(s) { return (s.innerText || "").replace(/\s+/g, " ").trim(); }

  async function exportPDF(btn) {
    btn.disabled = true;
    var overlay = document.createElement("div");
    overlay.id = "pp-overlay";
    document.body.appendChild(overlay);
    var old = document.getElementById("pp-root");
    if (old) old.remove();
    var slides = topSlides();
    if (!slides.length) { overlay.remove(); btn.disabled = false; return; }
    var root = document.createElement("div");
    root.id = "pp-root";
    slides[0].parentElement.appendChild(root);

    for (var i = 0; i < slides.length; i++) {
      var s = slides[i], title = titleOf(s), seen = new Set();
      overlay.textContent = "Preparing PDF… slide " + (i + 1) + " of " + slides.length + "\n" + title;
      s.classList.add("pp-capture");
      await wait(60);
      if (/quiz/i.test(title)) { snapshot(s, i + 1, title, "", root); s.classList.remove("pp-capture"); continue; }
      arr(s.querySelectorAll("button")).forEach(function (b) { if (/^\W*all\b/i.test(b.textContent.trim()) && isTabBtn(b)) b.click(); });
      await wait(80);
      seen.add(keyOf(s));
      snapshot(s, i + 1, title, "", root);
      var bars = findBars(s);
      for (var j = 0; j < bars.length; j++) {
        var bar = bars[j];
        if (!bar.isConnected) continue;
        var btns = arr(bar.children).filter(isTabBtn).slice(0, 80);
        for (var k = 0; k < btns.length; k++) {
          var b = btns[k];
          if (!visible(b)) continue;
          try { b.click(); } catch (e) { continue; }
          await wait(90);
          var key = keyOf(s);
          if (seen.has(key)) continue;
          seen.add(key);
          snapshot(s, i + 1, title, b.textContent.replace(/\s+/g, " ").trim(), root);
        }
        if (btns[0] && btns[0].isConnected) { try { btns[0].click(); } catch (e) {} await wait(40); }
      }
      s.classList.remove("pp-capture");
    }

    var n = root;
    while (n && n !== document.body && n.parentElement) {
      arr(n.parentElement.children).forEach(function (sib) {
        if (sib !== n && !/^(SCRIPT|STYLE|LINK)$/.test(sib.tagName)) sib.classList.add("pp-hide");
      });
      if (n.parentElement !== document.body) n.parentElement.classList.add("pp-anc");
      n = n.parentElement;
    }
    overlay.textContent = "Opening print dialog… choose “Save as PDF” (" + root.children.length + " pages)";
    await wait(400);
    overlay.remove();
    window.print();
  }

  function cleanup() {
    var r = document.getElementById("pp-root");
    if (r) r.remove();
    arr(document.querySelectorAll(".pp-hide")).forEach(function (e) { e.classList.remove("pp-hide"); });
    arr(document.querySelectorAll(".pp-anc")).forEach(function (e) { e.classList.remove("pp-anc"); });
    var b = document.getElementById("pp-btn");
    if (b) b.disabled = false;
  }

  function init() {
    css();
    var b = document.createElement("button");
    b.id = "pp-btn";
    b.type = "button";
    b.title = "Export every slide and sub-tab as a PDF";
    b.textContent = "📄 Export PDF";
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      exportPDF(b).catch(function (err) {
        console.error(err);
        var o = document.getElementById("pp-overlay");
        if (o) o.remove();
        cleanup();
        alert("PDF export failed: " + err.message);
      });
    });
    document.body.appendChild(b);
    window.addEventListener("afterprint", function () { setTimeout(cleanup, 300); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
