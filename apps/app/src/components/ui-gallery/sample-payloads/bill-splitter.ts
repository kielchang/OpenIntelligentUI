import { DEMO_EXAMPLES } from "@/components/demo-gallery/demo-data";
import { RECONSTRUCTED_LABEL, type GallerySample } from "./types";

const PROMPT = DEMO_EXAMPLES.find((item) => item.id === "split")?.prompt ?? "";

const CSS = `
.bs { font-family: var(--font-sans); color: var(--color-text-primary); display: grid; gap: 12px; max-width: 560px; }
.bs h2 { font-size: 18px; font-weight: 500; line-height: 1.3; }
.bs-note { font-size: 13px; color: var(--color-text-secondary); }
.bs-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); }
.bs-grid label { display: grid; gap: 4px; font-size: 13px; color: var(--color-text-secondary); }
.bs-grid input { width: 100%; }
.bs-grid input[aria-invalid="true"] { border-color: var(--color-border-danger); box-shadow: 0 0 0 3px var(--color-background-danger); }
.bs-readout { color: var(--color-text-primary); font-weight: 500; }
.bs-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.bs-result { padding: 12px 14px; border-radius: var(--border-radius-lg); background: var(--color-background-secondary); border: 0.5px solid var(--color-border-tertiary); }
.bs-summary { font-size: 15px; font-weight: 500; }
.bs-summary.is-error { color: var(--color-text-danger); }
.bs-shares { margin: 8px 0 0; padding-left: 22px; font-size: 14px; display: grid; gap: 2px; }
.bs-formula { font-size: 12px; color: var(--color-text-tertiary); font-family: var(--font-mono); line-height: 1.5; }
.bs-followup { font-size: 13px; color: var(--color-text-secondary); min-height: 1.4em; }
`.trim();

const HTML = `
<section class="bs" aria-labelledby="bs-title">
  <h2 id="bs-title">Bill splitter</h2>
  <p class="bs-note">Enter the subtotal, choose a tip and the number of people. Every cent of the total is allocated. No payment is sent — this only calculates.</p>
  <div class="bs-grid">
    <label for="bs-subtotal">Subtotal (USD, 0–1,000,000)
      <input id="bs-subtotal" type="number" inputmode="decimal" min="0" max="1000000" step="0.01" value="86.40">
    </label>
    <label for="bs-tip">Tip: <span class="bs-readout" id="bs-tip-out">18%</span>
      <input id="bs-tip" type="range" min="0" max="30" step="1" value="18">
    </label>
    <label for="bs-people">People (1–50)
      <input id="bs-people" type="number" inputmode="numeric" min="1" max="50" step="1" value="4">
    </label>
  </div>
  <div class="bs-actions">
    <button type="button" onclick="resetSplit()">Reset</button>
    <button type="button" id="bs-ask" onclick="askAboutSplit(this)">Ask the agent about this split</button>
  </div>
  <p id="bs-followup" class="bs-followup" role="status"></p>
  <div class="bs-result" id="bs-result" role="status" aria-live="polite">
    <p id="bs-summary" class="bs-summary">Enter values to see the split.</p>
    <ol id="bs-shares" class="bs-shares"></ol>
  </div>
  <p class="bs-formula">total = subtotal × (1 + tip ÷ 100), rounded to cents · base share = floor(total ÷ people) · leftover cents go one each to the first people in the list, so the shares always sum to the total.</p>
</section>
`.trim();

const JS_FUNCTIONS = `
function readBillInput(id, min, max, message) {
  var input = document.getElementById(id);
  var value = input.valueAsNumber;
  if (!Number.isFinite(value) || value < min || value > max) {
    input.setAttribute("aria-invalid", "true");
    return { error: message };
  }
  input.removeAttribute("aria-invalid");
  return { value: value };
}

function readBillInputs() {
  var subtotal = readBillInput("bs-subtotal", 0, 1000000, "Enter a subtotal from 0 to 1,000,000.");
  var tip = readBillInput("bs-tip", 0, 30, "Choose a tip from 0% to 30%.");
  var people = readBillInput("bs-people", 1, 50, "Enter a whole number of people from 1 to 50.");
  if (people.value !== undefined && !Number.isInteger(people.value)) {
    document.getElementById("bs-people").setAttribute("aria-invalid", "true");
    people = { error: "People must be a whole number." };
  }
  var error = subtotal.error || tip.error || people.error;
  if (error) return { error: error };
  return { subtotal: subtotal.value, tip: tip.value, people: people.value };
}

function splitCents(totalCents, people) {
  var base = Math.floor(totalCents / people);
  var extra = totalCents - base * people;
  var shares = [];
  for (var i = 0; i < people; i += 1) shares.push(base + (i < extra ? 1 : 0));
  return shares;
}

function formatUsd(cents) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function renderSplit() {
  var summary = document.getElementById("bs-summary");
  var list = document.getElementById("bs-shares");
  document.getElementById("bs-tip-out").textContent = document.getElementById("bs-tip").value + "%";
  list.textContent = "";
  var inputs = readBillInputs();
  if (inputs.error) {
    summary.textContent = inputs.error;
    summary.classList.add("is-error");
    return null;
  }
  summary.classList.remove("is-error");
  var subtotalCents = Math.round(inputs.subtotal * 100);
  var tipCents = Math.round(subtotalCents * inputs.tip / 100);
  var totalCents = subtotalCents + tipCents;
  var shares = splitCents(totalCents, inputs.people);
  summary.textContent = "Total " + formatUsd(totalCents) + " (subtotal " + formatUsd(subtotalCents) + " + tip " + formatUsd(tipCents) + ") split " + inputs.people + " ways:";
  shares.forEach(function (share, index) {
    var item = document.createElement("li");
    item.textContent = "Person " + (index + 1) + ": " + formatUsd(share);
    list.appendChild(item);
  });
  return { totalCents: totalCents, shares: shares, inputs: inputs };
}

function resetSplit() {
  document.getElementById("bs-subtotal").value = "86.40";
  document.getElementById("bs-tip").value = "18";
  document.getElementById("bs-people").value = "4";
  document.getElementById("bs-followup").textContent = "";
  renderSplit();
}

async function askAboutSplit(button) {
  var status = document.getElementById("bs-followup");
  var result = renderSplit();
  if (!result) {
    status.textContent = "Fix the highlighted input first, then ask.";
    return;
  }
  button.disabled = true;
  status.textContent = "Sending question…";
  try {
    await Websandbox.connection.remote.sendPrompt({
      text: "In the bill splitter above the subtotal is " + formatUsd(Math.round(result.inputs.subtotal * 100)) +
        ", the tip is " + result.inputs.tip + "% and " + result.inputs.people + " people share a total of " +
        formatUsd(result.totalCents) + ". Explain whether this split is fair and suggest alternatives such as splitting by what each person ordered."
    });
    status.textContent = "Question sent.";
  } catch (error) {
    status.textContent = "Could not send. Please try again or type your question in chat.";
  } finally {
    button.disabled = false;
  }
}

function initBillSplitter() {
  ["bs-subtotal", "bs-tip", "bs-people"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderSplit);
  });
  renderSplit();
}
`.trim();

export const BILL_SPLITTER_SAMPLE: GallerySample = {
  id: "reconstructed-bill-splitter",
  title: "Bill splitter",
  description:
    RECONSTRUCTED_LABEL +
    "。示範「做一個工具」的完整形態：valueAsNumber＋Number.isFinite＋範圍驗證、aria-invalid、role=status 結果、整數分配零頭讓每人份額加總恰等於總額，以及按 master-playbook 寫法的 sendPrompt 追問按鈕（停用、await、錯誤可重試、finally 復原）。",
  provenance: "reconstructed",
  visualization: "calculator",
  prompt: PROMPT,
  initialHeight: 520,
  placeholderMessages: ["Laying out the inputs…", "Wiring validation…", "Allocating the cents…"],
  css: CSS,
  html: HTML,
  jsFunctions: JS_FUNCTIONS,
  jsExpressions: ["initBillSplitter();"],
};
