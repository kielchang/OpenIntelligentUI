import { FORM_STYLES_WITH_STAGGER_CSS, SVG_CLASSES_CSS, THEME_CSS } from "@repo/design-system";
import { assembleStandaloneHtmlFromActivity } from "@/components/generative-ui/export-utils";
import { SAMPLE_PAYLOADS } from "@/components/ui-gallery/sample-payloads";
import { toContent, type GallerySample, type SampleNetwork, type SampleProvenance } from "@/components/ui-gallery/sample-payloads/types";
import { addAsset, badge, codeBlock, details, esc, section, shot, tabs } from "../html";

const PROVENANCE_LABEL: Record<SampleProvenance, string> = {
  seed: "專案內建範本原文",
  skill: "技能文件範例原文",
  reconstructed: "依技能規範重建",
};

const NETWORK_LABEL: Record<SampleNetwork, string> = {
  "esm.sh": "需要 esm.sh",
  jsdelivr: "需要 cdn.jsdelivr.net",
  usgs: "需要 USGS 圖磚",
};

/** Artifact 的 CSP 只放行 cdnjs／jsdelivr／unpkg 的 script；esm.sh、外部 fetch 與圖磚都會被擋 */
const CSP_NOTE: Record<SampleNetwork, string> = {
  "esm.sh": "importmap 指向 esm.sh，Artifact 的 CSP 會擋，只會看到樣本自己的錯誤狀態",
  jsdelivr: "Leaflet 腳本可以載入，但它用 fetch 取 CSS 會被擋",
  usgs: "USGS 圖磚是外部圖片，Artifact 會擋",
};

const STAGES = [
  "placeholder（LOADING_PHRASES）",
  "css 完成 → 可顯示",
  "html 串流預覽（Idiomorph）",
  "htmlComplete → 最終沙箱",
  "jsFunctions 注入",
  "jsExpressions 依序執行",
  "generating:false → 可匯出",
];

const LOCAL_SHOT: Record<string, string> = {
  "seed-weather": "04-sample-01-seed-weather.png",
  "seed-invoice": "04-sample-02-seed-invoice.png",
  "seed-dashboard": "04-sample-03-seed-dashboard.png",
  "skill-svg-three-step-flow": "04-sample-04-skill-svg-three-step-flow.png",
  "reconstructed-bill-splitter": "04-sample-05-reconstructed-bill-splitter.png",
  "reconstructed-weekend-compare": "04-sample-06-reconstructed-weekend-compare.png",
  "reconstructed-monty-hall": "04-sample-07-reconstructed-monty-hall.png",
  "reconstructed-bicycle-gears": "04-sample-08-reconstructed-bicycle-gears.png",
  "reconstructed-chartjs-bar": "04-sample-09-reconstructed-chartjs-bar.png",
  "reconstructed-airplane-3d": "04-sample-10-reconstructed-airplane-3d.png",
  "reconstructed-coastal-trip": "04-sample-11-reconstructed-coastal-trip.png",
};

/** 把匯出器的無聲 stub 換成會在框內顯示「模擬送出」的版本，讓 follow-up 按鈕有可見結果 */
const VISIBLE_STUB = `window.Websandbox = { connection: { remote: {
  sendPrompt: async ({ text }) => { var el = document.getElementById("__gal_bridge"); if (!el) { el = document.createElement("div"); el.id = "__gal_bridge"; el.setAttribute("role", "status"); el.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;padding:10px 14px;border-radius:10px;background:var(--color-background-info);color:var(--color-text-info);border:1px solid var(--color-border-info);font:14px var(--font-sans);z-index:9999"; document.body.appendChild(el); } el.textContent = "模擬送出（靜態展示，未連接代理）：" + text; clearTimeout(el.__t); el.__t = setTimeout(function () { el.remove(); }, 4000); },
  openLink: async ({ url }) => { if (/^https:/.test(url)) window.open(url, "_blank", "noopener,noreferrer"); }
} } };`;

function standalonePage(sample: GallerySample): string {
  const html = assembleStandaloneHtmlFromActivity(toContent(sample), sample.title);
  const start = html.indexOf("<script>window.Websandbox = ");
  if (start === -1) throw new Error(`stub not found in assembled page for ${sample.id}`);
  const end = html.indexOf("</script>", start);
  return `${html.slice(0, start)}<script>${VISIBLE_STUB}</script>${html.slice(end + "</script>".length)}`;
}

/** 重播第二段：只有 css + html，沒有腳本（對應預覽 iframe） */
function previewPage(sample: GallerySample): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${THEME_CSS}\n${SVG_CLASSES_CSS}\n${FORM_STYLES_WITH_STAGGER_CSS}</style><style>${sample.css}</style></head><body>${sample.html}</body></html>`;
}

function sampleCard(sample: GallerySample): string {
  const finalPath = addAsset(`assets/samples/${sample.id}.html`, standalonePage(sample));
  const previewPath = addAsset(`assets/samples/${sample.id}.preview.html`, previewPage(sample));
  const placeholder = (sample.placeholderMessages ?? ["Preparing the layout…", "Wiring up controls…"]).map(esc);
  const networks = sample.needsNetwork ?? [];
  const height = Math.max(240, Math.min(sample.initialHeight, 900));
  // 不依賴外部 CDN 的樣本一開始就載入（iframe 仍是 lazy，捲到才真的取檔）；依賴 CDN 的先放說明
  const eager = networks.length === 0;

  const source = tabs(
    [
      { key: "css", label: "css", panel: codeBlock(sample.css || "（空：靜態圖不需要額外樣式）") },
      { key: "html", label: "html", panel: codeBlock(sample.html) },
      { key: "jsFunctions", label: "jsFunctions", panel: codeBlock(sample.jsFunctions ?? "（空：沒有行為）") },
      { key: "jsExpressions", label: "jsExpressions", panel: codeBlock((sample.jsExpressions ?? []).join("\n") || "（空）") },
    ],
    {
      active: "html",
      ariaLabel: "payload 欄位",
      headExtra: `<span class="gal-meta">initialHeight ${sample.initialHeight}${sample.placeholderMessages ? ` · placeholderMessages ${sample.placeholderMessages.length} 則` : ""}</span>`,
    },
  );

  return `<article class="gal-sample" id="sample-${esc(sample.id)}" data-provenance="${sample.provenance}" data-sample="${esc(sample.id)}" data-final="${finalPath}" data-preview="${previewPath}" data-height="${height}" data-placeholders="${esc(JSON.stringify(placeholder))}">
  <header class="gal-sample-head">
    <div class="gal-sample-title">
      <h3>${esc(sample.title)}</h3>
      <p class="gal-meta">Jev 型別 <code>${esc(sample.visualization)}</code><span aria-hidden="true"> · </span>${badge(PROVENANCE_LABEL[sample.provenance], sample.provenance === "reconstructed" ? "unmounted" : "mounted")}${networks
        .map((n) => badge(NETWORK_LABEL[n], "agent"))
        .join("")}</p>
    </div>
    <div class="gal-sample-actions">
      <button type="button" class="gal-btn gal-btn--primary" data-replay>重播串流</button>
      <button type="button" class="gal-btn" data-finish>直接顯示完成版</button>
      <a class="gal-btn" href="${finalPath}" target="_blank" rel="noopener">另開完整頁</a>
    </div>
  </header>
  <p class="gal-sample-desc">${esc(sample.description)}</p>
  ${sample.prompt ? details("原始使用者提示", `<p class="gal-prompt">${esc(sample.prompt)}</p>`) : ""}
  ${
    networks.length
      ? `<div class="gal-callout"><strong>在 Artifact 裡會被擋：</strong>${networks.map((n) => esc(CSP_NOTE[n])).join("；")}。下方的「本機畫面」是同一份樣本在本機 /gallery 的完成態。</div>`
      : ""
  }
  <div class="gal-sample-stage" data-stage-host style="min-height:${Math.min(height, 240)}px">
    ${
      eager && networks.length === 0
        ? `<iframe class="gal-sample-frame" title="${esc(sample.title)}" src="${finalPath}" sandbox="allow-scripts allow-popups" loading="lazy" style="width:100%;height:${height}px;border:0;background:#fff;border-radius:var(--radius-lg)"></iframe>`
        : `<div class="gal-sample-poster" style="min-height:${Math.min(height, 240)}px"><p>按「重播串流」會依序顯示三段：placeholder 文字 → 只有 css＋html 的預覽 iframe → 帶腳本的完整頁；按「直接顯示完成版」立刻載入完整頁。這裡的 iframe 是這一頁附帶的獨立 HTML，與專案的匯出器（ExportOverlay）同一個組裝器產生。</p></div>`
    }
  </div>
  <div class="gal-replay" hidden data-replay-ui>
    <ol class="gal-stage-track" aria-label="渲染階段">${STAGES.map((label, i) => `<li data-step="${i}" data-status="pending">${esc(label)}</li>`).join("")}</ol>
    <div class="gal-replay-actions"><span class="gal-meta">靜態重播只能模擬前三段與最後一段：真正的 Idiomorph morph、jsFunctions 注入與逐條 jsExpressions 需要正式渲染器。</span></div>
  </div>
  ${networks.length ? details("本機 /gallery 的完成態（截圖）", shot(LOCAL_SHOT[sample.id], `${sample.title} 在本機 /gallery 的完成態`), false) : ""}
  ${details("六欄位 payload 原文", source)}
</article>`;
}

export function renderGenerativeSection(): string {
  const intro = `<p>這一段在 /gallery 用<strong>正式的串流渲染器</strong>重播六欄位 payload：先看到 placeholder，css 到齊後出現預覽 iframe 逐段 morph，html 完成後換成有橋接的 Websandbox，再注入 jsFunctions 與逐條執行 jsExpressions。</p>
<p>靜態版把每筆樣本組成<strong>獨立 HTML 檔</strong>（與下載功能同一個組裝器：importmap、設計系統 CSS、css、html、jsFunctions 與 jsExpressions），在 sandbox iframe 裡載入；「重播串流」以三段 srcdoc／src 切換模擬串流節奏。每筆都能看原始 prompt 與四個程式欄位的原文。</p>
<p>repo 裡真正存在的輸出只有三份 seed 範本與技能文件裡的 SVG；帳單分攤、3D 飛機、海岸地圖等 launch 片段<strong>沒有留下輸出</strong>，所以這裡依技能規範重建，並明確標示。沙箱裡的「送出」按鈕會呼叫 <code>Websandbox.connection.remote.sendPrompt</code>；靜態版用 stub 接住並在框內顯示「模擬送出」，不會啟動代理。</p>`;

  const cards = SAMPLE_PAYLOADS.map((sample) => sampleCard(sample)).join("\n");
  return section("generative", intro, `<div class="gal-stack">${cards}</div>`);
}

/** 重播腳本：由 generate.ts 放進頁尾 */
export const GENERATIVE_SCRIPT = `
(function () {
  function setStep(article, index) {
    article.querySelectorAll('[data-step]').forEach(function (li) {
      var i = Number(li.getAttribute('data-step'));
      li.setAttribute('data-status', i < index ? 'done' : i === index ? 'active' : 'pending');
      if (i === index) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  }
  function frame(article, attrs) {
    var height = article.getAttribute('data-height') || '320';
    var f = document.createElement('iframe');
    f.className = 'gal-sample-frame';
    f.title = article.querySelector('h3').textContent;
    f.setAttribute('sandbox', attrs.sandbox);
    f.style.cssText = 'width:100%;height:' + height + 'px;border:0;background:#fff;border-radius:var(--radius-lg)';
    if (attrs.srcdoc !== undefined) f.srcdoc = attrs.srcdoc; else f.src = attrs.src;
    return f;
  }
  function showFinal(article) {
    var host = article.querySelector('[data-stage-host]');
    host.replaceChildren(frame(article, { src: article.getAttribute('data-final'), sandbox: 'allow-scripts allow-popups' }));
  }
  function replay(article) {
    var host = article.querySelector('[data-stage-host]');
    var ui = article.querySelector('[data-replay-ui]');
    ui.hidden = false;
    var phrases = [];
    try { phrases = JSON.parse(article.getAttribute('data-placeholders') || '[]'); } catch (e) {}
    var height = article.getAttribute('data-height') || '320';
    var ph = document.createElement('div');
    ph.className = 'gal-sample-poster';
    ph.style.minHeight = Math.min(Number(height), 240) + 'px';
    var text = document.createElement('p');
    text.setAttribute('role', 'status');
    text.textContent = phrases[0] || 'Preparing…';
    ph.appendChild(text);
    host.replaceChildren(ph);
    setStep(article, 0);
    var i = 0;
    var rot = setInterval(function () { i = (i + 1) % Math.max(phrases.length, 1); text.textContent = phrases[i] || 'Preparing…'; }, 900);
    var timers = article.__timers || [];
    timers.forEach(clearTimeout);
    timers = [];
    timers.push(setTimeout(function () { setStep(article, 1); }, 1100));
    timers.push(setTimeout(function () {
      clearInterval(rot);
      setStep(article, 2);
      fetch(article.getAttribute('data-preview')).then(function (r) { return r.text(); }).then(function (doc) {
        host.replaceChildren(frame(article, { srcdoc: doc, sandbox: '' }));
      }).catch(function () { showFinal(article); });
    }, 1700));
    timers.push(setTimeout(function () { setStep(article, 3); }, 3200));
    timers.push(setTimeout(function () { setStep(article, 4); showFinal(article); }, 3600));
    timers.push(setTimeout(function () { setStep(article, 5); }, 4200));
    timers.push(setTimeout(function () { setStep(article, 6); }, 4800));
    article.__timers = timers;
  }
  document.querySelectorAll('article[data-sample]').forEach(function (article) {
    article.querySelector('[data-replay]').addEventListener('click', function () { replay(article); });
    article.querySelector('[data-finish]').addEventListener('click', function () {
      (article.__timers || []).forEach(clearTimeout);
      var ui = article.querySelector('[data-replay-ui]'); ui.hidden = false; setStep(article, 6);
      showFinal(article);
    });
  });
})();
`;
