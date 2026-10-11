import { DEMO_EXAMPLES } from "@/components/demo-gallery/demo-data";
import { RECONSTRUCTED_LABEL, type GallerySample } from "./types";

const PROMPT = DEMO_EXAMPLES.find((item) => item.id === "probability")?.prompt ?? "";

const CSS = `
.mh { font-family: var(--font-sans); color: var(--color-text-primary); display: grid; gap: 12px; max-width: 600px; }
.mh h2 { font-size: 18px; font-weight: 500; line-height: 1.3; }
.mh p { font-size: 14px; line-height: 1.5; }
.mh-rules { padding-left: 20px; font-size: 13px; color: var(--color-text-secondary); display: grid; gap: 2px; }
.mh-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: end; }
.mh-controls label { display: grid; gap: 4px; font-size: 13px; color: var(--color-text-secondary); flex: 1 1 12rem; }
.mh-controls input { width: 100%; }
.mh-controls input[aria-invalid="true"] { border-color: var(--color-border-danger); box-shadow: 0 0 0 3px var(--color-background-danger); }
.mh-status { padding: 8px 12px; border-radius: var(--border-radius-md); background: var(--color-background-secondary); font-size: 13px; }
.mh-status.is-error { background: var(--color-background-danger); color: var(--color-text-danger); }
.mh-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.mh-table caption { text-align: left; font-size: 12px; color: var(--color-text-tertiary); padding-bottom: 6px; }
.mh-table th, .mh-table td { text-align: left; padding: 6px 8px; border-bottom: 0.5px solid var(--color-border-tertiary); }
.mh-table th { font-weight: 500; color: var(--color-text-secondary); }
.mh-table td.mh-sim { font-family: var(--font-mono); color: var(--color-text-info); }
.mh-table td.mh-theory { font-family: var(--font-mono); color: var(--color-text-secondary); }
.mh-why { font-size: 12px; color: var(--color-text-tertiary); line-height: 1.5; }
`.trim();

const HTML = `
<section class="mh" aria-labelledby="mh-title">
  <h2 id="mh-title">Monty Hall: stay or switch?</h2>
  <p>Three doors hide one car and two goats. You pick a door, the host opens another, and you decide whether to keep your pick or switch. Run many trials to see which strategy wins more often.</p>
  <ol class="mh-rules">
    <li>The car is placed behind one of the three doors at random; you pick one door at random.</li>
    <li>The host knows where the car is and always opens a different door that hides a goat. If both other doors hide goats, the host picks one of them at random.</li>
    <li>“Stay” keeps your first door. “Switch” takes the one remaining closed door.</li>
  </ol>
  <div class="mh-controls">
    <label for="mh-trials">Trials (1–100,000; each trial is scored for both strategies)
      <input id="mh-trials" type="number" inputmode="numeric" min="1" max="100000" step="1" value="1000">
    </label>
    <button type="button" onclick="runMonty()">Run simulation</button>
    <button type="button" onclick="resetMonty()">Reset</button>
  </div>
  <p id="mh-status" class="mh-status" role="status">No simulation run yet.</p>
  <table class="mh-table">
    <caption>Simulated win rates come from random trials in this page; theoretical probabilities are the exact values and do not change.</caption>
    <thead>
      <tr><th scope="col">Strategy</th><th scope="col">Simulated wins</th><th scope="col">Simulated win rate</th><th scope="col">Theoretical probability (exact)</th></tr>
    </thead>
    <tbody>
      <tr><th scope="row">Always stay</th><td class="mh-sim" id="mh-stay-wins">—</td><td class="mh-sim" id="mh-stay-rate">—</td><td class="mh-theory">1/3 ≈ 33.3%</td></tr>
      <tr><th scope="row">Always switch</th><td class="mh-sim" id="mh-switch-wins">—</td><td class="mh-sim" id="mh-switch-rate">—</td><td class="mh-theory">2/3 ≈ 66.7%</td></tr>
    </tbody>
  </table>
  <p class="mh-why">Why switching wins: your first pick is right 1/3 of the time. The host’s reveal never moves the car, so the remaining closed door holds the other 2/3. Small trial counts fluctuate; the simulated rate approaches the theoretical value as trials grow, but it is never the same thing.</p>
</section>
`.trim();

const JS_FUNCTIONS = `
function readTrials() {
  var input = document.getElementById("mh-trials");
  var status = document.getElementById("mh-status");
  var value = input.valueAsNumber;
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1 || value > 100000) {
    input.setAttribute("aria-invalid", "true");
    status.textContent = "Enter a whole number of trials from 1 to 100,000.";
    status.classList.add("is-error");
    return null;
  }
  input.removeAttribute("aria-invalid");
  status.classList.remove("is-error");
  return value;
}

function randomDoor() {
  return Math.floor(Math.random() * 3);
}

function hostOpens(car, pick) {
  var options = [0, 1, 2].filter(function (door) { return door !== car && door !== pick; });
  return options[Math.floor(Math.random() * options.length)];
}

function simulateMonty(trials) {
  var stayWins = 0;
  var switchWins = 0;
  for (var i = 0; i < trials; i += 1) {
    var car = randomDoor();
    var pick = randomDoor();
    var opened = hostOpens(car, pick);
    var switched = [0, 1, 2].filter(function (door) { return door !== pick && door !== opened; })[0];
    if (pick === car) stayWins += 1;
    if (switched === car) switchWins += 1;
  }
  return { stayWins: stayWins, switchWins: switchWins };
}

function formatRate(wins, trials) {
  return (100 * wins / trials).toFixed(1) + "%";
}

function runMonty() {
  var trials = readTrials();
  if (trials === null) return;
  var result = simulateMonty(trials);
  var count = new Intl.NumberFormat("en-US").format(trials);
  document.getElementById("mh-stay-wins").textContent = new Intl.NumberFormat("en-US").format(result.stayWins);
  document.getElementById("mh-stay-rate").textContent = formatRate(result.stayWins, trials);
  document.getElementById("mh-switch-wins").textContent = new Intl.NumberFormat("en-US").format(result.switchWins);
  document.getElementById("mh-switch-rate").textContent = formatRate(result.switchWins, trials);
  document.getElementById("mh-status").textContent = "Simulated " + count + " trials: stay won " + formatRate(result.stayWins, trials) + ", switch won " + formatRate(result.switchWins, trials) + " (simulated, random; theoretical values are in the last column).";
}

function resetMonty() {
  var input = document.getElementById("mh-trials");
  input.value = "1000";
  input.removeAttribute("aria-invalid");
  ["mh-stay-wins", "mh-stay-rate", "mh-switch-wins", "mh-switch-rate"].forEach(function (id) {
    document.getElementById(id).textContent = "—";
  });
  var status = document.getElementById("mh-status");
  status.classList.remove("is-error");
  status.textContent = "No simulation run yet.";
}
`.trim();

export const MONTY_HALL_SAMPLE: GallerySample = {
  id: "reconstructed-monty-hall",
  title: "Monty Hall simulation",
  description:
    RECONSTRUCTED_LABEL +
    "。示範模擬型「理解」回答：主持人規則寫在畫面上、試驗次數驗證為 1–100,000 的整數、同一批隨機試驗同時計分「留」與「換」，表格把模擬勝率與理論機率放在不同欄位，絕不把模擬數字標成理論值。",
  provenance: "reconstructed",
  visualization: "distribution",
  prompt: PROMPT,
  initialHeight: 460,
  placeholderMessages: ["Writing out the host’s rules…", "Building the trial runner…", "Separating simulated from theoretical…"],
  css: CSS,
  html: HTML,
  jsFunctions: JS_FUNCTIONS,
  jsExpressions: ["resetMonty();"],
};
