import { chromium } from "playwright-core";
const OUT = new URL("../.local/screenshots/shots/", import.meta.url).pathname;
(await import("node:fs")).mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const failed = [];
const errors = [];
page.on("requestfailed", (req) => failed.push(`${req.url().slice(0, 100)} ${req.failure()?.errorText ?? ""}`));
page.on("pageerror", (err) => errors.push(String(err).slice(0, 200)));
await page.goto(`${process.env.BASE_URL ?? "http://localhost:3000"}/gallery`, { waitUntil: "networkidle", timeout: 120000 });
const ids = ["reconstructed-chartjs-bar", "reconstructed-airplane-3d", "reconstructed-coastal-trip", "reconstructed-monty-hall", "reconstructed-bicycle-gears"];
for (const id of ids) {
  const article = page.locator(`#sample-${id}`);
  await article.scrollIntoViewIfNeeded();
  await article.getByRole("button", { name: "直接顯示完成版" }).click();
  await page.waitForTimeout(300);
}
await page.waitForTimeout(15000);
for (const id of ids) {
  const article = page.locator(`#sample-${id}`);
  await article.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await article.screenshot({ path: `${OUT}cdn-${id}.png`, timeout: 60000 });
}
const statuses = [];
for (const frame of page.frames()) {
  try {
    const t = await frame.evaluate(() => {
      const status = document.getElementById("status")?.textContent ?? document.querySelector('[role="status"]')?.textContent ?? "";
      return { head: (document.body?.innerText ?? "").slice(0, 70).replace(/\s+/g, " "), status: status.trim().slice(0, 160) };
    });
    if (t.head && t.status) statuses.push(t);
  } catch {}
}
// Monty Hall：跑一次模擬
for (const frame of page.frames()) {
  try {
    const run = frame.getByRole("button", { name: /run/i });
    if (await run.count()) { await run.first().click(); await page.waitForTimeout(800); statuses.push({ head: "monty-hall after run", status: (await frame.evaluate(() => document.body.innerText)).slice(0, 400).replace(/\s+/g, " ") }); }
  } catch {}
}
// 色彩區塊局部截圖
await page.locator("#color .gal-hue-wheel").scrollIntoViewIfNeeded();
await page.locator("#color .gal-hue-wheel").screenshot({ path: `${OUT}color-hue-wheel.png` });
await page.locator("#color .gal-contrast").first().screenshot({ path: `${OUT}color-contrast-grid.png` });
await page.locator("#color .gal-strip").first().screenshot({ path: `${OUT}color-cvd-strip.png` });
await page.locator("#color .gal-alert-tier").first().screenshot({ path: `${OUT}color-alert-tier.png` });
await page.locator("#response").screenshot({ path: `${OUT}response-section.png`, timeout: 60000 });
console.log(JSON.stringify({ failed: failed.slice(0, 12), errors, statuses }, null, 2));
await browser.close();
