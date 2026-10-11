/**
 * 已掛載元件的展示用 props。數字一律是示意值；文字沿用元件在正式畫面會收到的型態。
 */
import type { TimeSlot } from "@/components/generative-ui/meeting-time-picker";

export const PLAN_FIXTURE = {
  approach: "Render a bar chart of monthly revenue with labelled axes and a short legend.",
  technology: "inline SVG",
  keyElements: ["12 bars", "axis labels", "legend", "illustrative data note"],
};

export const TOOL_REASONING_FIXTURES = [
  { name: "query_data", status: "executing", args: { query: "monthly revenue by category" } },
  { name: "get_trip_stop_images", status: "inProgress", args: { wikipedia_titles: ["Monterey, California", "Santa Barbara, California"] } },
  { name: "manage_todos", status: "complete", args: { todos: [{ id: "t1" }, { id: "t2" }] } },
  { name: "plan_visualization", status: "complete", args: undefined },
] as const;

export const QUARTERLY_SALES_TABLE = {
  title: "Quarterly sales",
  columns: ["Quarter", "Sales", "Change"],
  rows: [
    ["Q1", "$100", "—"],
    ["Q2", "$200", "+100%"],
    ["Q3", "$180", "−10%"],
  ],
  source: "Illustrative sample values, not live data",
};

export const INVALID_TABLE = {
  title: "Broken table",
  columns: ["Quarter", "Sales"],
  rows: [["Q1"]],
  source: "Illustrative",
};

export const BAR_CHART_FIXTURE = {
  title: "Monthly active users",
  description: "Illustrative sample values (not live data)",
  data: [
    { label: "Jan", value: 1200 },
    { label: "Feb", value: 1480 },
    { label: "Mar", value: 1710 },
    { label: "Apr", value: 1650 },
    { label: "May", value: 1990 },
  ],
};

export const PIE_CHART_FIXTURE = {
  title: "Revenue by category",
  description: "Illustrative sample values (not live data)",
  data: [
    { label: "Subscriptions", value: 52 },
    { label: "Services", value: 23 },
    { label: "Hardware", value: 15 },
    { label: "Other", value: 10 },
  ],
};

export const MEETING_FIXTURE = {
  reasonForScheduling: "Review the quarterly chart",
  meetingDuration: 45,
};

export const MEETING_SLOTS: TimeSlot[] = [
  { date: "Tomorrow", time: "2:00 PM", duration: "30 min" },
  { date: "Friday", time: "10:00 AM", duration: "30 min" },
  { date: "Next Monday", time: "3:00 PM", duration: "30 min" },
];

export const MARKDOWN_SAMPLE = `Here is how the three options compare.

| Option | Cost | Travel |
| --- | --- | --- |
| Coastal | $420 | 2.5 h |
| City | $510 | 1.0 h |
| Mountain | $380 | 3.5 h |

- **Coastal** balances cost and time.
- *Mountain* is cheapest but furthest.

> Sample numbers are illustrations, not live prices.

\`\`\`js
const share = total / people;
\`\`\``;

export interface TodoFixture {
  id: string;
  title: string;
  description: string;
  emoji: string;
  status: "pending" | "completed";
}

export const TODO_FIXTURES: TodoFixture[] = [
  { id: "todo-1", title: "Draft the itinerary", description: "Five stops from San Francisco to Los Angeles with one photo each.", emoji: "🎯", status: "pending" },
  { id: "todo-2", title: "Check tile attribution", description: "USGS The National Map link must stay visible on the map.", emoji: "✅", status: "completed" },
  { id: "todo-3", title: "Validate inputs", description: "Reject blank, non-finite and zero-divisor values before computing.", emoji: "💡", status: "pending" },
];

/** 來自 app/pick/page.tsx 的 ALL_PROMPTS（page 檔不能額外匯出常數，所以複製並註明來源） */
export const PICK_PROMPTS = [
  { emoji: "🌌", title: "Solar System" },
  { emoji: "🧬", title: "DNA Helix" },
  { emoji: "📊", title: "Revenue Dashboard" },
  { emoji: "🏗️", title: "Microservices Architecture" },
  { emoji: "🌊", title: "Ocean Waves" },
  { emoji: "🔮", title: "Neural Network" },
  { emoji: "🗺️", title: "Force-Directed Graph" },
  { emoji: "🎵", title: "Audio Visualizer" },
  { emoji: "🏔️", title: "3D Terrain" },
  { emoji: "⚛️", title: "Atom Model" },
  { emoji: "🌳", title: "Fractal Tree" },
  { emoji: "🚀", title: "Rocket Launch" },
];

/** 設計系統 iframe 的示範標記（沙箱會注入 THEME + SVG + FORM css） */
export const DESIGN_SYSTEM_MARKUP = `
<h3 style="font: 500 16px var(--font-sans); margin-bottom: 12px;">Form controls styled by FORM_STYLES_CSS</h3>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: 12px;">
  <label>Text <input type="text" value="Sample text"></label>
  <label>Number <input type="number" value="42" min="0" max="100"></label>
  <label>Email <input type="email" placeholder="name@example.invalid"></label>
  <label>Search <input type="search" placeholder="Search…"></label>
  <label>Select
    <select><option>Coastal</option><option>City</option><option>Mountain</option></select>
  </label>
  <label>Range <input type="range" min="0" max="100" value="60"></label>
  <label><input type="checkbox" checked> Checkbox</label>
  <label><input type="radio" name="r" checked> Radio A</label>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; align-items: center;">
  <button type="button">Default button</button>
  <button type="button" disabled>Disabled</button>
  <a href="#">Link colour = --color-text-info</a>
</div>
<textarea rows="2" style="margin-top: 12px; width: 100%;">Textarea inherits the same border and radius tokens.</textarea>
<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px;">
  <span style="padding: 3px 10px; border-radius: 999px; font-size: 12px; background: var(--color-background-info); color: var(--color-text-info); border: 0.5px solid var(--color-border-info);">info</span>
  <span style="padding: 3px 10px; border-radius: 999px; font-size: 12px; background: var(--color-background-success); color: var(--color-text-success); border: 0.5px solid var(--color-border-success);">success</span>
  <span style="padding: 3px 10px; border-radius: 999px; font-size: 12px; background: var(--color-background-warning); color: var(--color-text-warning); border: 0.5px solid var(--color-border-warning);">warning</span>
  <span style="padding: 3px 10px; border-radius: 999px; font-size: 12px; background: var(--color-background-danger); color: var(--color-text-danger); border: 0.5px solid var(--color-border-danger);">danger</span>
</div>
<h3 style="font: 500 16px var(--font-sans); margin: 20px 0 8px;">SVG classes from SVG_CLASSES_CSS</h3>
<svg width="100%" viewBox="0 0 680 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nine colour ramps and the box, arrow and leader helpers">
  <g class="c-purple"><rect x="20" y="20" width="60" height="44" rx="8"/><text class="th" x="50" y="42" text-anchor="middle" dominant-baseline="central">purple</text></g>
  <g class="c-teal"><rect x="92" y="20" width="60" height="44" rx="8"/><text class="th" x="122" y="42" text-anchor="middle" dominant-baseline="central">teal</text></g>
  <g class="c-coral"><rect x="164" y="20" width="60" height="44" rx="8"/><text class="th" x="194" y="42" text-anchor="middle" dominant-baseline="central">coral</text></g>
  <g class="c-pink"><rect x="236" y="20" width="60" height="44" rx="8"/><text class="th" x="266" y="42" text-anchor="middle" dominant-baseline="central">pink</text></g>
  <g class="c-gray"><rect x="308" y="20" width="60" height="44" rx="8"/><text class="th" x="338" y="42" text-anchor="middle" dominant-baseline="central">gray</text></g>
  <g class="c-blue"><rect x="380" y="20" width="60" height="44" rx="8"/><text class="th" x="410" y="42" text-anchor="middle" dominant-baseline="central">blue</text></g>
  <g class="c-green"><rect x="452" y="20" width="60" height="44" rx="8"/><text class="th" x="482" y="42" text-anchor="middle" dominant-baseline="central">green</text></g>
  <g class="c-amber"><rect x="524" y="20" width="60" height="44" rx="8"/><text class="th" x="554" y="42" text-anchor="middle" dominant-baseline="central">amber</text></g>
  <g class="c-red"><rect x="596" y="20" width="60" height="44" rx="8"/><text class="th" x="626" y="42" text-anchor="middle" dominant-baseline="central">red</text></g>
  <defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round"/></marker></defs>
  <g class="box node"><rect x="40" y="110" width="180" height="56" rx="8"/><text class="th" x="130" y="128" text-anchor="middle" dominant-baseline="central">.box .node</text><text class="ts" x="130" y="148" text-anchor="middle" dominant-baseline="central">fill --bg2 · stroke --b</text></g>
  <line class="arr" x1="220" y1="138" x2="300" y2="138" marker-end="url(#arr)"/>
  <text class="ts" x="260" y="124" text-anchor="middle">.arr</text>
  <g class="box"><rect x="300" y="110" width="180" height="56" rx="8"/><text class="t" x="390" y="128" text-anchor="middle" dominant-baseline="central">text.t 14px/400</text><text class="ts" x="390" y="148" text-anchor="middle" dominant-baseline="central">text.ts 12px/400</text></g>
  <line class="leader" x1="480" y1="138" x2="560" y2="190"/>
  <circle cx="480" cy="138" r="2" fill="currentColor" opacity="0.5"/>
  <text class="ts" x="566" y="194">.leader annotation</text>
</svg>`;
