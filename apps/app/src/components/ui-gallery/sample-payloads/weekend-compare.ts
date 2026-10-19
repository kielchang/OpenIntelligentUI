import { DEMO_EXAMPLES } from "@/components/demo-gallery/demo-data";
import { RECONSTRUCTED_LABEL, type GallerySample } from "./types";

const PROMPT = DEMO_EXAMPLES.find((item) => item.id === "trip")?.prompt ?? "";

const CSS = `
.wk { font-family: var(--font-sans); color: var(--color-text-primary); display: grid; gap: 12px; max-width: 600px; }
.wk h2 { font-size: 18px; font-weight: 500; line-height: 1.3; }
.wk-note { font-size: 13px; color: var(--color-text-secondary); }
.wk-tag { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 11px; font-weight: 500; background: var(--color-background-warning); color: var(--color-text-warning); }
.wk-controls { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); align-items: end; }
.wk-controls label { display: grid; gap: 4px; font-size: 13px; color: var(--color-text-secondary); }
.wk-controls input { width: 100%; }
.wk-readout { color: var(--color-text-primary); font-weight: 500; }
.wk-reco { padding: 10px 14px; border-radius: var(--border-radius-md); background: var(--color-background-info); color: var(--color-text-info); font-size: 14px; font-weight: 500; }
.wk-list { list-style: none; padding: 0; display: grid; gap: 8px; }
.wk-item { padding: 10px 14px; border-radius: var(--border-radius-lg); background: var(--color-background-secondary); border: 0.5px solid var(--color-border-tertiary); display: grid; gap: 4px; }
.wk-item.is-top { border-color: var(--color-border-info); }
.wk-head { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; }
.wk-name { font-weight: 500; }
.wk-score { font-family: var(--font-mono); color: var(--color-text-secondary); }
.wk-meta { font-size: 12px; color: var(--color-text-secondary); }
.wk-bar { height: 6px; border-radius: 3px; background: var(--color-background-tertiary); overflow: hidden; }
.wk-fill { height: 100%; width: 0; border-radius: 3px; background: var(--color-text-info); transition: width 0.25s ease; }
.wk-how { font-size: 12px; color: var(--color-text-tertiary); line-height: 1.5; }
@media (prefers-reduced-motion: reduce) { .wk-fill { transition: none; } }
`.trim();

const HTML = `
<section class="wk" aria-labelledby="wk-title">
  <h2 id="wk-title">Coastal, city or mountain weekend for two?</h2>
  <p class="wk-note"><span class="wk-tag">Illustrative estimates, not live prices</span> Costs are sample two-night totals for two people; travel hours are sample one-way times from a home base. Replace them with your own numbers before deciding.</p>
  <div class="wk-controls">
    <label for="wk-budget">Budget matters: <span class="wk-readout" id="wk-budget-out">60</span> / 100
      <input id="wk-budget" type="range" min="0" max="100" step="1" value="60">
    </label>
    <label for="wk-time">Short travel matters: <span class="wk-readout" id="wk-time-out">40</span> / 100
      <input id="wk-time" type="range" min="0" max="100" step="1" value="40">
    </label>
    <button type="button" onclick="resetWeekend()">Reset weights</button>
  </div>
  <p id="wk-reco" class="wk-reco" role="status">Move the sliders to score the three options.</p>
  <ul class="wk-list" id="wk-list">
    <li class="wk-item" data-key="coastal" data-cost="620" data-hours="2.5">
      <div class="wk-head"><span class="wk-name">Coastal</span><span class="wk-score" id="wk-score-coastal">—</span></div>
      <div class="wk-meta">Sample cost $620 · travel 2.5 h · beach walks, seafood, sunsets</div>
      <div class="wk-bar" aria-hidden="true"><div class="wk-fill" id="wk-fill-coastal"></div></div>
    </li>
    <li class="wk-item" data-key="city" data-cost="780" data-hours="1">
      <div class="wk-head"><span class="wk-name">City</span><span class="wk-score" id="wk-score-city">—</span></div>
      <div class="wk-meta">Sample cost $780 · travel 1 h · museums, restaurants, late nights</div>
      <div class="wk-bar" aria-hidden="true"><div class="wk-fill" id="wk-fill-city"></div></div>
    </li>
    <li class="wk-item" data-key="mountain" data-cost="540" data-hours="3.5">
      <div class="wk-head"><span class="wk-name">Mountain</span><span class="wk-score" id="wk-score-mountain">—</span></div>
      <div class="wk-meta">Sample cost $540 · travel 3.5 h · hiking, cabins, quiet</div>
      <div class="wk-bar" aria-hidden="true"><div class="wk-fill" id="wk-fill-mountain"></div></div>
    </li>
  </ul>
  <p class="wk-how" id="wk-how">How the recommendation changes: each option gets a cost score and a travel score between 0 and 100 (100 = best of the three, 0 = worst). The overall score is the weighted average of the two using your sliders. Push “budget” up and the cheapest option (Mountain) rises; push “short travel” up and the closest option (City) rises; Coastal wins when the two weights are balanced because it is second-best on both.</p>
</section>
`.trim();

const JS_FUNCTIONS = `
function readWeekendOptions() {
  return Array.from(document.querySelectorAll("#wk-list .wk-item")).map(function (item) {
    return {
      key: item.dataset.key,
      name: item.querySelector(".wk-name").textContent,
      cost: Number(item.dataset.cost),
      hours: Number(item.dataset.hours),
      element: item
    };
  });
}

function normalizeLowerIsBetter(values) {
  var min = Math.min.apply(null, values);
  var max = Math.max.apply(null, values);
  return values.map(function (value) {
    return max === min ? 100 : Math.round(100 * (max - value) / (max - min));
  });
}

function scoreWeekend() {
  var budgetWeight = document.getElementById("wk-budget").valueAsNumber;
  var timeWeight = document.getElementById("wk-time").valueAsNumber;
  if (!Number.isFinite(budgetWeight)) budgetWeight = 0;
  if (!Number.isFinite(timeWeight)) timeWeight = 0;
  document.getElementById("wk-budget-out").textContent = String(budgetWeight);
  document.getElementById("wk-time-out").textContent = String(timeWeight);
  var options = readWeekendOptions();
  var costScores = normalizeLowerIsBetter(options.map(function (o) { return o.cost; }));
  var timeScores = normalizeLowerIsBetter(options.map(function (o) { return o.hours; }));
  var weightSum = budgetWeight + timeWeight;
  var reco = document.getElementById("wk-reco");
  var best = [];
  var bestScore = -1;
  options.forEach(function (option, index) {
    var score = weightSum === 0 ? 0 : Math.round((budgetWeight * costScores[index] + timeWeight * timeScores[index]) / weightSum);
    option.score = score;
    document.getElementById("wk-score-" + option.key).textContent = score + " / 100";
    document.getElementById("wk-fill-" + option.key).style.width = score + "%";
    if (score > bestScore) { bestScore = score; best = [option]; }
    else if (score === bestScore) best.push(option);
  });
  options.forEach(function (option) {
    option.element.classList.toggle("is-top", weightSum > 0 && best.indexOf(option) !== -1);
  });
  if (weightSum === 0) {
    reco.textContent = "Both weights are 0, so nothing is being compared. Raise at least one slider.";
    return;
  }
  if (best.length > 1) {
    reco.textContent = "Tie between " + best.map(function (o) { return o.name; }).join(" and ") + " at " + bestScore + " / 100 with these weights.";
    return;
  }
  var top = best[0];
  var topIndex = options.indexOf(top);
  reco.textContent = "Recommendation: " + top.name + " (" + bestScore + " / 100) — cost score " + costScores[topIndex] + ", travel score " + timeScores[topIndex] + " with budget weight " + budgetWeight + " and travel weight " + timeWeight + ".";
}

function resetWeekend() {
  document.getElementById("wk-budget").value = "60";
  document.getElementById("wk-time").value = "40";
  scoreWeekend();
}

function initWeekend() {
  document.getElementById("wk-budget").addEventListener("input", scoreWeekend);
  document.getElementById("wk-time").addEventListener("input", scoreWeekend);
  scoreWeekend();
}
`.trim();

export const WEEKEND_COMPARE_SAMPLE: GallerySample = {
  id: "reconstructed-weekend-compare",
  title: "Weekend comparison",
  description:
    RECONSTRUCTED_LABEL +
    "。示範「比較」型回答：三個選項的示意成本與車程寫在 data 屬性上作為單一來源，兩個權重滑桿即時算出正規化加權分數，推薦句隨之更新，並以文字說明推薦為何改變；所有數字都標示為示意估計。",
  provenance: "reconstructed",
  visualization: "interactive_diagram",
  prompt: PROMPT,
  initialHeight: 480,
  placeholderMessages: ["Listing the three weekends…", "Adding weight sliders…", "Scoring the options…"],
  css: CSS,
  html: HTML,
  jsFunctions: JS_FUNCTIONS,
  jsExpressions: ["initWeekend();"],
};
