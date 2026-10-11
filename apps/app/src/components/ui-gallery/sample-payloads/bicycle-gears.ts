import { DEMO_EXAMPLES } from "@/components/demo-gallery/demo-data";
import { RECONSTRUCTED_LABEL, type GallerySample } from "./types";

const PROMPT = DEMO_EXAMPLES.find((item) => item.id === "bicycle")?.prompt ?? "";

const CSS = `
.bg { font-family: var(--font-sans); color: var(--color-text-primary); display: grid; gap: 12px; max-width: 640px; }
.bg h2 { font-size: 18px; font-weight: 500; line-height: 1.3; }
.bg p { font-size: 14px; line-height: 1.5; }
.bg-controls { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); align-items: end; }
.bg-controls label { display: grid; gap: 4px; font-size: 13px; color: var(--color-text-secondary); }
.bg-controls input { width: 100%; }
.bg-readout { color: var(--color-text-primary); font-weight: 500; }
.bg-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.bg-status { padding: 8px 12px; border-radius: var(--border-radius-md); background: var(--color-background-secondary); font-size: 13px; }
.bg-figure { display: block; }
.bg-rot { transform-box: fill-box; transform-origin: center; transition: transform 1.2s linear; }
.bg-mark { stroke: var(--color-text-primary); stroke-width: 2.5; stroke-linecap: round; }
.bg-chain { stroke: var(--color-text-secondary); stroke-width: 2; stroke-dasharray: 5 4; fill: none; }
.bg-assume { font-size: 12px; color: var(--color-text-tertiary); line-height: 1.5; padding-left: 18px; display: grid; gap: 2px; }
@media (prefers-reduced-motion: reduce) { .bg-rot { transition: none; } }
`.trim();

const HTML = `
<section class="bg" aria-labelledby="bg-title">
  <h2 id="bg-title">How bicycle gears work</h2>
  <p>The chain links the front chainring to a rear cog on the back wheel. One pedal turn pulls the chain by one chainring’s worth of teeth, so the cog — and the wheel bolted to it — turns <em>chainring teeth ÷ cog teeth</em> times. More front teeth or fewer rear teeth means a higher gear: further per pedal stroke, harder to push.</p>
  <div class="bg-controls">
    <label for="bg-front">Chainring teeth (24–56): <span class="bg-readout" id="bg-front-out">44</span>
      <input id="bg-front" type="range" min="24" max="56" step="1" value="44">
    </label>
    <label for="bg-rear">Rear cog teeth (10–36): <span class="bg-readout" id="bg-rear-out">16</span>
      <input id="bg-rear" type="range" min="10" max="36" step="1" value="16">
    </label>
    <div class="bg-actions">
      <button type="button" id="bg-pedal" onclick="pedalOnce()">Pedal once</button>
      <button type="button" onclick="resetGears()">Reset</button>
    </div>
  </div>
  <p id="bg-status" class="bg-status" role="status">Move the sliders to compute the gear ratio.</p>
  <svg class="bg-figure" width="100%" viewBox="0 0 680 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="bg-svg-title bg-svg-desc">
    <title id="bg-svg-title">Chainring, chain and rear cog</title>
    <desc id="bg-svg-desc">Two circles sized by their tooth counts, joined by a dashed chain. Pressing “Pedal once” turns the chainring one full turn and the cog by the gear ratio; the dark marks show each part turning.</desc>
    <line id="bg-chain-top" class="bg-chain" x1="200" y1="76" x2="500" y2="130"/>
    <line id="bg-chain-bottom" class="bg-chain" x1="200" y1="244" x2="500" y2="190"/>
    <g id="bg-ring" class="bg-rot" data-angle="0">
      <circle id="bg-ring-circle" class="c-teal" cx="200" cy="160" r="84" stroke-width="3"/>
      <line id="bg-ring-mark" class="bg-mark" x1="200" y1="160" x2="200" y2="82"/>
    </g>
    <g id="bg-cog" class="bg-rot" data-angle="0">
      <circle id="bg-cog-circle" class="c-gray" cx="500" cy="160" r="30" stroke-width="3"/>
      <line id="bg-cog-mark" class="bg-mark" x1="500" y1="160" x2="500" y2="136"/>
    </g>
    <g class="c-teal">
      <text class="th" x="200" y="22" text-anchor="middle" dominant-baseline="central">Chainring (front)</text>
      <text class="ts" id="bg-ring-label" x="200" y="40" text-anchor="middle" dominant-baseline="central">44 teeth</text>
    </g>
    <g class="c-gray">
      <text class="th" x="500" y="22" text-anchor="middle" dominant-baseline="central">Rear cog</text>
      <text class="ts" id="bg-cog-label" x="500" y="40" text-anchor="middle" dominant-baseline="central">16 teeth</text>
    </g>
    <text class="ts" x="340" y="306" text-anchor="middle" dominant-baseline="central">Dashed line = chain · dark marks show each part turning · sizes scale with tooth count</text>
  </svg>
  <ul class="bg-assume">
    <li>Simplified assumptions: a 700c road wheel (about 27 in / 2.1 m per wheel turn), no tyre-width or load effects.</li>
    <li>Gear inches = ratio × 27 in; metres per pedal turn = ratio × 2.1 m. Friction, derailleur chain wrap and cadence are ignored.</li>
  </ul>
</section>
`.trim();

const JS_FUNCTIONS = `
function readTeeth(id, min, max) {
  var value = document.getElementById(id).valueAsNumber;
  if (!Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function setAttrs(id, attrs) {
  var element = document.getElementById(id);
  Object.keys(attrs).forEach(function (name) { element.setAttribute(name, String(attrs[name])); });
}

function renderGears() {
  var front = readTeeth("bg-front", 24, 56);
  var rear = readTeeth("bg-rear", 10, 36);
  var status = document.getElementById("bg-status");
  if (front === null || rear === null) {
    status.textContent = "Choose tooth counts with the two sliders.";
    return null;
  }
  var ratio = front / rear;
  document.getElementById("bg-front-out").textContent = String(front);
  document.getElementById("bg-rear-out").textContent = String(rear);
  document.getElementById("bg-ring-label").textContent = front + " teeth";
  document.getElementById("bg-cog-label").textContent = rear + " teeth";
  var ringR = front * 1.9;
  var cogR = rear * 1.9;
  setAttrs("bg-ring-circle", { r: ringR });
  setAttrs("bg-ring-mark", { y2: 160 - ringR + 6 });
  setAttrs("bg-cog-circle", { r: cogR });
  setAttrs("bg-cog-mark", { y2: 160 - cogR + 6 });
  setAttrs("bg-chain-top", { y1: 160 - ringR, y2: 160 - cogR });
  setAttrs("bg-chain-bottom", { y1: 160 + ringR, y2: 160 + cogR });
  status.textContent = "Gear ratio " + front + " ÷ " + rear + " = " + ratio.toFixed(2) + ": one pedal turn = " + ratio.toFixed(2) + " wheel turns ≈ " + (ratio * 27).toFixed(0) + " gear inches ≈ " + (ratio * 2.1).toFixed(1) + " m of road (700c wheel assumed).";
  return ratio;
}

function pedalOnce() {
  var ratio = renderGears();
  if (ratio === null) return;
  var ring = document.getElementById("bg-ring");
  var cog = document.getElementById("bg-cog");
  var ringAngle = Number(ring.dataset.angle) + 360;
  var cogAngle = Number(cog.dataset.angle) + ratio * 360;
  ring.dataset.angle = String(ringAngle);
  cog.dataset.angle = String(cogAngle);
  ring.style.transform = "rotate(" + ringAngle + "deg)";
  cog.style.transform = "rotate(" + cogAngle + "deg)";
  var button = document.getElementById("bg-pedal");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  button.disabled = true;
  setTimeout(function () { button.disabled = false; }, reduced ? 0 : 1200);
}

function resetGears() {
  document.getElementById("bg-front").value = "44";
  document.getElementById("bg-rear").value = "16";
  ["bg-ring", "bg-cog"].forEach(function (id) {
    var group = document.getElementById(id);
    group.dataset.angle = "0";
    group.style.transform = "";
  });
  renderGears();
}

function initGears() {
  document.getElementById("bg-front").addEventListener("input", renderGears);
  document.getElementById("bg-rear").addEventListener("input", renderGears);
  renderGears();
}
`.trim();

export const BICYCLE_GEARS_SAMPLE: GallerySample = {
  id: "reconstructed-bicycle-gears",
  title: "Bicycle gears",
  description:
    RECONSTRUCTED_LABEL +
    "。示範互動式圖解：兩個齒數滑桿即時改寫 inline SVG 的圓半徑與鏈條端點，計算齒比、每踩一圈的輪轉數與 gear inches（標明 700c 假設），「Pedal once」以 JS 設定 CSS transform 讓大盤轉一圈、飛輪按齒比轉動，reduced-motion 時直接跳到終態。",
  provenance: "reconstructed",
  visualization: "interactive_diagram",
  prompt: PROMPT,
  initialHeight: 520,
  placeholderMessages: ["Drawing the chainring and cog…", "Linking the chain…", "Computing the ratio…"],
  css: CSS,
  html: HTML,
  jsFunctions: JS_FUNCTIONS,
  jsExpressions: ["initGears();"],
};
