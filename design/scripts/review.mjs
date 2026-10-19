import { chromium } from "playwright-core";
const OUT = new URL("../.local/screenshots/review/", import.meta.url).pathname;
(await import("node:fs")).mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });
const errors = [];
const HIDE_STICKY = ".gal-topbar, .gal-nav { position: static !important; } .gal-toast-region { display: none !important; }";

async function newPage(width, height) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  await page.goto(`${process.env.BASE_URL ?? "http://localhost:3000"}/gallery`, { waitUntil: "networkidle", timeout: 120000 });
  return { context, page };
}
async function shot(page, locator, name) {
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  await locator.screenshot({ path: `${OUT}${name}.png`, timeout: 90000 });
}

// ── 淺色 1280：區塊 ──
let { context, page } = await newPage(1280, 900);
await page.addStyleTag({ content: HIDE_STICKY });
for (const id of ["overview", "method", "design-system", "chat-shell", "response", "unmounted", "agent-defined", "findings"]) {
  await shot(page, page.locator(`#${id}`), `01-section-${id}`);
}
// 色彩區塊太高，分段截
const colorItems = page.locator("#color .gal-item--wide, #color .gal-item");
const colorNames = ["families-designsystem", "families-svg", "families-app", "families-chart", "families-adhoc", "hardcoded-counts", "hue-wheel", "token-layers", "brand-vs-primary"];
for (let i = 0; i < Math.min(colorNames.length, await colorItems.count()); i += 1) {
  await shot(page, colorItems.nth(i), `02-color-${String(i + 1).padStart(2, "0")}-${colorNames[i]}`);
}
await shot(page, page.locator("#color .gal-contrast").nth(0).locator("xpath=ancestor::div[contains(@class,'gal-stack')][1]"), "02-color-10-contrast-grids");
await shot(page, page.locator("#item-chart-cvd"), "02-color-11-chart-cvd");
await shot(page, page.locator("#item-svg-ramps"), "02-color-12-svg-ramps");
await shot(page, page.locator("#item-alert-tiers"), "02-color-13-alert-tiers");
await shot(page, page.locator("#color .gal-finding").first().locator("xpath=.."), "02-color-14-recommendations");

// ── 生成式範例：串流中途態 ──
const first = page.locator(".gal-sample").first();
await first.scrollIntoViewIfNeeded();
const startBtn = first.getByRole("button", { name: "開始串流重播" });
if (await startBtn.count()) await startBtn.click();
await page.waitForTimeout(700);
await first.screenshot({ path: `${OUT}03-stream-1-placeholder.png` });
await page.waitForTimeout(1600);
await first.screenshot({ path: `${OUT}03-stream-2-preview.png` });
await page.waitForTimeout(6000);
await first.screenshot({ path: `${OUT}03-stream-3-final.png` });

// ── 所有範例完成態 ──
const samples = page.locator(".gal-sample");
const n = await samples.count();
for (let i = 0; i < n; i += 1) {
  const s = samples.nth(i);
  await s.scrollIntoViewIfNeeded();
  const b = s.getByRole("button", { name: "直接顯示完成版" });
  if (await b.count()) await b.click();
  await page.waitForTimeout(200);
}
await page.waitForTimeout(12000);
for (let i = 0; i < n; i += 1) {
  const s = samples.nth(i);
  const id = (await s.getAttribute("id")) ?? `sample-${i}`;
  await shot(page, s, `04-sample-${String(i + 1).padStart(2, "0")}-${id.replace("sample-", "")}`);
}
// 展開一筆的六欄位原文
const srcDetails = samples.nth(4).locator("details.gal-details").last();
await srcDetails.locator("summary").click();
await page.waitForTimeout(300);
await shot(page, samples.nth(4), "05-sample-source-tabs");

// ── 互動視窗 ──
await page.getByRole("button", { name: "開啟對話框" }).click();
await page.waitForTimeout(300);
await page.locator("dialog.provider-keys-dialog").screenshot({ path: `${OUT}06-keys-dialog.png` });
await page.getByRole("button", { name: "Cancel" }).click();
await page.getByRole("button", { name: "開啟 Demo Gallery 抽屜" }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}06-demo-drawer.png` });
await page.keyboard.press("Escape");
await page.locator("#unmounted").scrollIntoViewIfNeeded();
await page.getByRole("button", { name: "QR Pick" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}06-qr-modal.png` });
await page.getByRole("button", { name: "Close" }).click();
await page.getByRole("button", { name: "設定 pending_template" }).click();
await page.waitForTimeout(300);
await shot(page, page.locator("#unmounted .gal-item").nth(3), "06-template-chip");
await page.getByRole("button", { name: /用 basicCatalog 真實渲染/ }).click();
await page.waitForTimeout(600);
await shot(page, page.locator("#agent-defined .gal-item").first(), "06-a2ui-live");
// 沙箱送出 → toast
for (const frame of page.frames()) {
  try { const btn = frame.getByRole("button", { name: "Send invoice" }); if (await btn.count()) { await btn.first().click(); break; } } catch {}
}
await page.waitForTimeout(700);
await page.addStyleTag({ content: ".gal-toast-region { display: flex !important; }" });
await page.locator("#sample-seed-invoice").scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}06-sendprompt-toast.png` });
await page.screenshot({ path: `${OUT}00-fullpage-light.png`, fullPage: true });
await context.close();

// ── 深色 1280 ──
({ context, page } = await newPage(1280, 900));
await page.getByRole("button", { name: "深色" }).first().click();
await page.waitForTimeout(300);
await page.addStyleTag({ content: HIDE_STICKY });
for (const id of ["overview", "chat-shell", "response"]) await shot(page, page.locator(`#${id}`), `07-dark-${id}`);
await shot(page, page.locator("#item-alert-tiers"), "07-dark-alert-tiers");
const s2 = page.locator(".gal-sample").nth(4);
await s2.scrollIntoViewIfNeeded();
await s2.getByRole("button", { name: "直接顯示完成版" }).click();
await page.waitForTimeout(4000);
await shot(page, s2, "07-dark-bill-splitter");
await page.screenshot({ path: `${OUT}00-fullpage-dark.png`, fullPage: true });
await context.close();

// ── 手機 390 ──
({ context, page } = await newPage(390, 844));
await page.screenshot({ path: `${OUT}08-mobile-top.png` });
await page.addStyleTag({ content: HIDE_STICKY });
for (const id of ["method", "chat-shell", "response"]) await shot(page, page.locator(`#${id}`), `08-mobile-${id}`);
const s3 = page.locator(".gal-sample").nth(4);
await s3.scrollIntoViewIfNeeded();
await s3.getByRole("button", { name: "直接顯示完成版" }).click();
await page.waitForTimeout(4000);
await shot(page, s3, "08-mobile-bill-splitter");
await context.close();

await browser.close();
console.log(JSON.stringify({ errors }, null, 2));
