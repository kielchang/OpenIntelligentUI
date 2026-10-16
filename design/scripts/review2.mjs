import { chromium } from "playwright-core";
const OUT = new URL("../.local/screenshots/review/", import.meta.url).pathname;
(await import("node:fs")).mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.goto(`${process.env.BASE_URL ?? "http://localhost:3000"}/gallery`, { waitUntil: "networkidle", timeout: 120000 });
await page.addStyleTag({ content: ".gal-topbar, .gal-nav { position: static !important; }" });
const grids = page.locator("#color .gal-contrast");
const names = ["ds-text-bg", "ds-semantic", "ds-border-ui", "app-text-surface", "chart-on-surface"];
for (let i = 0; i < await grids.count(); i += 1) {
  const wrap = grids.nth(i).locator("xpath=ancestor::div[contains(@class,'gal-stack')][1]");
  await wrap.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  await wrap.screenshot({ path: `${OUT}02-color-10-contrast-${i + 1}-${names[i] ?? i}.png`, timeout: 60000 });
}
await page.getByRole("button", { name: "設定 pending_template" }).click();
await page.waitForTimeout(400);
const chip = page.locator("[data-template-chip]");
if (await chip.count()) {
  const input = page.locator('[data-testid="copilot-chat-textarea"]').first();
  const box = input.locator("xpath=ancestor::*[contains(@class,'gal-chat-shell')]");
  await box.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  await box.screenshot({ path: `${OUT}06-template-chip-in-chat.png`, timeout: 60000 });
  console.log("chip portaled into chat input");
} else {
  console.log("chip rendered inline");
}
await browser.close();
