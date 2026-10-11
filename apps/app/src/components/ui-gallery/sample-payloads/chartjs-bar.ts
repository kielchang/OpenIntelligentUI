import { RECONSTRUCTED_LABEL, type GallerySample } from "./types";

const PROMPT =
  "Compare three illustrative plan tiers by cost per seat and visualise the differences";

const CSS = `
.cb { font-family: var(--font-sans); color: var(--color-text-primary); display: grid; gap: 12px; max-width: 600px; }
.cb h2 { font-size: 18px; font-weight: 500; line-height: 1.3; }
.cb-note { font-size: 13px; color: var(--color-text-secondary); }
.cb-tag { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 11px; font-weight: 500; background: var(--color-background-warning); color: var(--color-text-warning); }
.cb-status { font-size: 13px; color: var(--color-text-secondary); }
.cb-chart { position: relative; height: 220px; padding: 8px; border-radius: var(--border-radius-lg); background: var(--color-background-secondary); border: 0.5px solid var(--color-border-tertiary); }
.cb-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.cb-table caption { text-align: left; font-size: 12px; color: var(--color-text-tertiary); padding-bottom: 6px; }
.cb-table th, .cb-table td { text-align: left; padding: 6px 8px; border-bottom: 0.5px solid var(--color-border-tertiary); }
.cb-table th { font-weight: 500; color: var(--color-text-secondary); }
.cb-table td { font-family: var(--font-mono); }
`.trim();

const HTML = `
<section class="cb" aria-labelledby="cb-title">
  <h2 id="cb-title">Cost per seat across three plan tiers</h2>
  <p class="cb-note"><span class="cb-tag">Illustrative sample numbers</span> These are made-up tiers to show the comparison, not any vendor’s price list. Replace the table values with real quotes before using them.</p>
  <p id="status" class="cb-status" role="status">Loading chart…</p>
  <div class="cb-chart"><canvas id="cb-canvas" role="img" aria-label="Bar chart of monthly cost per seat for Basic, Team and Business tiers; the same numbers are in the table below"></canvas></div>
  <table class="cb-table" id="cb-table">
    <caption>Same numbers as the chart (illustrative, USD per seat)</caption>
    <thead>
      <tr><th scope="col">Tier</th><th scope="col">Monthly per seat</th><th scope="col">Annual per seat (×12)</th><th scope="col">vs Basic</th></tr>
    </thead>
    <tbody>
      <tr><th scope="row">Basic</th><td data-value="8">$8</td><td>$96</td><td>—</td></tr>
      <tr><th scope="row">Team</th><td data-value="14">$14</td><td>$168</td><td>+$6 (+75%)</td></tr>
      <tr><th scope="row">Business</th><td data-value="22">$22</td><td>$264</td><td>+$14 (+175%)</td></tr>
    </tbody>
  </table>
</section>
`.trim();

const JS_FUNCTIONS = `
function chartToken(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function readTierRows() {
  return Array.from(document.querySelectorAll("#cb-table tbody tr")).map(function (row) {
    return {
      label: row.querySelector("th").textContent.trim(),
      value: Number(row.querySelector("[data-value]").dataset.value)
    };
  });
}

async function setupChart() {
  var status = document.getElementById("status");
  var canvas = document.getElementById("cb-canvas");
  var rows = readTierRows();
  var chartModule = await import("chart.js/auto");
  var Chart = chartModule.default;
  var textColor = chartToken("--color-text-secondary");
  var gridColor = chartToken("--color-border-tertiary");
  var chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: rows.map(function (row) { return row.label; }),
      datasets: [{
        label: "Monthly cost per seat (USD, illustrative)",
        data: rows.map(function (row) { return row.value; }),
        backgroundColor: chartToken("--color-background-info"),
        borderColor: chartToken("--color-text-info"),
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? false : undefined,
      plugins: {
        legend: { labels: { color: textColor } },
        tooltip: { callbacks: { label: function (item) { return "$" + item.parsed.y + " per seat per month"; } } }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: textColor, callback: function (value) { return "$" + value; } }, grid: { color: gridColor } }
      }
    }
  });
  status.textContent = "Chart ready. The table below has the same numbers.";
  return chart;
}

function showChartError(error) {
  var status = document.getElementById("status");
  status.textContent = "The chart library could not load. The table below has the same numbers.";
  if (error && error.message) status.setAttribute("title", error.message);
}
`.trim();

export const CHARTJS_BAR_SAMPLE: GallerySample = {
  id: "reconstructed-chartjs-bar",
  title: "Chart.js bar chart",
  description:
    RECONSTRUCTED_LABEL +
    "。示範透過 importmap 在 async 函式內動態 import chart.js/auto：以 getComputedStyle 解析設計代幣當作圖表顏色、responsive＋maintainAspectRatio:false 的有界容器、role=status 載入／失敗訊息，以及與圖表同一組數字的資料表作為文字替代。",
  provenance: "reconstructed",
  visualization: "bar_chart",
  prompt: PROMPT,
  initialHeight: 460,
  placeholderMessages: ["Listing the tiers…", "Loading the chart library…", "Drawing the bars…"],
  css: CSS,
  html: HTML,
  jsFunctions: JS_FUNCTIONS,
  jsExpressions: ["setupChart().catch(showChartError);"],
  needsNetwork: ["esm.sh"],
};
