/* Lilac Mint：預覽與消費頁共用的少量行為。沒有框架、沒有網路；classic script。 */
(function () {
  "use strict";
  var ns = {};
  var TOAST_MS = 4000;

  function region() {
    var el = document.getElementById("lm-toast-region");
    if (!el) {
      el = document.createElement("div");
      el.id = "lm-toast-region";
      el.className = "lm-toast-region";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    return el;
  }

  /** toast(message, tone?) — tone: "info" | "success" | "warning" | "danger"；4 秒後自清，同時只留最後三則 */
  ns.toast = function (message, tone) {
    var host = region();
    var item = document.createElement("div");
    item.className = "lm-toast" + (tone ? " lm-toast--" + tone : "");
    item.textContent = String(message);
    host.appendChild(item);
    while (host.children.length > 3) host.removeChild(host.firstChild);
    window.setTimeout(function () {
      if (item.parentNode) item.parentNode.removeChild(item);
    }, TOAST_MS);
    return item;
  };

  /** tabs(root) — root 內有 [role=tablist] > [role=tab][aria-controls=id]，與 [role=tabpanel][id]；鍵盤左右／Home／End */
  ns.tabs = function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next); }
      });
    });
    var current = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
    tabs.forEach(function (t) {
      var on = t === current;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  };

  /** dialog.open(el) / dialog.close(el) — el 是 <dialog class="lm-dialog">；用原生 showModal，Esc 由瀏覽器處理 */
  ns.dialog = {
    open: function (el) {
      if (typeof el === "string") el = document.getElementById(el);
      if (!el) return;
      if (typeof el.showModal === "function") { if (!el.open) el.showModal(); }
      else el.setAttribute("open", "");
      var first = el.querySelector("[autofocus], input, select, textarea, button");
      if (first) first.focus();
    },
    close: function (el) {
      if (typeof el === "string") el = document.getElementById(el);
      if (!el) return;
      if (typeof el.close === "function") el.close(); else el.removeAttribute("open");
    }
  };

  /** drawer.open(el) / drawer.close(el) — el 是 .lm-drawer（含 .lm-drawer__panel）；切 .is-open 與 aria-hidden */
  ns.drawer = {
    open: function (el) {
      if (typeof el === "string") el = document.getElementById(el);
      if (!el) return;
      el.classList.add("is-open");
      el.setAttribute("aria-hidden", "false");
      var first = el.querySelector("[autofocus], button, input, a[href]");
      if (first) first.focus();
    },
    close: function (el) {
      if (typeof el === "string") el = document.getElementById(el);
      if (!el) return;
      el.classList.remove("is-open");
      el.setAttribute("aria-hidden", "true");
    }
  };

  /** rotate(el, phrases, ms) — 每 ms 換一句（LoadingPlaceholder 用）；回傳停止函式；prefers-reduced-motion 時只顯示第一句 */
  ns.rotate = function (el, phrases, ms) {
    if (!el || !phrases || !phrases.length) return function () {};
    el.textContent = phrases[0];
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return function () {};
    var i = 0;
    var id = window.setInterval(function () {
      i = (i + 1) % phrases.length;
      el.textContent = phrases[i];
    }, ms || 1800);
    return function () { window.clearInterval(id); };
  };

  /** init(scope) — 自動接線：[data-lm-tabs]、[data-lm-dialog-open=id]、[data-lm-dialog-close]、[data-lm-drawer-open=id]、[data-lm-drawer-close]、[data-lm-toast="訊息"][data-lm-tone] */
  ns.init = function (scope) {
    scope = scope || document;
    Array.prototype.forEach.call(scope.querySelectorAll("[data-lm-tabs]"), ns.tabs);
    scope.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-lm-dialog-open],[data-lm-dialog-close],[data-lm-drawer-open],[data-lm-drawer-close],[data-lm-toast]") : null;
      if (!t) return;
      if (t.hasAttribute("data-lm-dialog-open")) ns.dialog.open(t.getAttribute("data-lm-dialog-open"));
      else if (t.hasAttribute("data-lm-dialog-close")) ns.dialog.close(t.closest("dialog"));
      else if (t.hasAttribute("data-lm-drawer-open")) ns.drawer.open(t.getAttribute("data-lm-drawer-open"));
      else if (t.hasAttribute("data-lm-drawer-close")) ns.drawer.close(t.closest(".lm-drawer"));
      else if (t.hasAttribute("data-lm-toast")) ns.toast(t.getAttribute("data-lm-toast"), t.getAttribute("data-lm-tone") || undefined);
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { ns.init(document); });
  else ns.init(document);

  window.LilacMint = ns;
})();
