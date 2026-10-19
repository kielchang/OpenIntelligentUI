import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = new URL("../.local/screenshots/shots/", import.meta.url).pathname;
(await import("node:fs")).mkdirSync(OUT, { recursive: true });
const SECTIONS = ["overview", "design-system", "color", "chat-shell", "response", "generative", "unmounted", "agent-defined", "findings"];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--no-sandbox"],
});
const report = { consoleErrors: [], pageErrors: [], failedRequests: [], checks: {} };

async function run(viewport, theme) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on("console", (msg) => { if (msg.type() === "error") report.consoleErrors.push(`[${theme} ${viewport.width}] ${msg.text().slice(0, 300)}`); });
  page.on("pageerror", (err) => report.pageErrors.push(`[${theme} ${viewport.width}] ${String(err).slice(0, 300)}`));
  page.on("requestfailed", (req) => report.failedRequests.push(`[${theme} ${viewport.width}] ${req.url().slice(0, 160)} ${req.failure()?.errorText ?? ""}`));

  await page.goto(`${BASE}/gallery`, { waitUntil: "networkidle", timeout: 120000 });
  if (theme === "dark") {
    await page.getByRole("button", { name: "深色" }).first().click();
    await page.waitForTimeout(300);
  }
  const tag = `${theme}-${viewport.width}`;
  report.checks[`${tag}-h2`] = await page.locator("h2").count();
  report.checks[`${tag}-items`] = await page.locator(".gal-item").count();
  report.checks[`${tag}-samples`] = await page.locator(".gal-sample").count();
  report.checks[`${tag}-htmlClass`] = await page.evaluate(() => document.documentElement.className);

  // 色彩區塊抽查：讀第一張對比矩陣的第一格
  const firstCell = page.locator(".gal-contrast td").first();
  report.checks[`${tag}-contrast-first-cell`] = (await firstCell.textContent())?.trim();

  for (const id of SECTIONS) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await section.screenshot({ path: `${OUT}${tag}-${id}.png`, timeout: 60000 });
  }

  if (theme === "light" && viewport.width >= 1200) {
    // 串流重播：前兩筆自動開始（IntersectionObserver），再手動按幾筆
    const generative = page.locator("#generative");
    await generative.scrollIntoViewIfNeeded();
    const buttons = page.getByRole("button", { name: "開始串流重播" });
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 6); i += 1) {
      const button = page.getByRole("button", { name: "開始串流重播" }).first();
      if (await button.count()) await button.click();
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(12000);
    report.checks.iframesInSamples = await page.locator(".gal-sample iframe").count();
    report.checks.stageDone = await page.locator('.gal-stage-track li[data-status="active"]', { hasText: "generating:false" }).count();
    const samples = page.locator(".gal-sample");
    const n = await samples.count();
    for (let i = 0; i < n; i += 1) {
      const sample = samples.nth(i);
      await sample.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const id = await sample.getAttribute("id");
      await sample.screenshot({ path: `${OUT}sample-${id}.png`, timeout: 60000 });
    }
    // 沙箱內容抽查：帳單分攤 iframe 裡有沒有輸出
    const frames = page.frames();
    report.checks.frameCount = frames.length;
    const texts = [];
    for (const frame of frames) {
      try {
        const text = await frame.evaluate(() => document.body?.innerText?.slice(0, 160) ?? "");
        if (text) texts.push(text.replace(/\s+/g, " "));
      } catch { /* cross-origin or detached */ }
    }
    report.checks.frameTexts = texts;
    // 點 invoice 的 sendPrompt 按鈕看 stub toast
    for (const frame of frames) {
      try {
        const btn = frame.getByRole("button", { name: "Send invoice" });
        if (await btn.count()) { await btn.first().click(); await page.waitForTimeout(800); report.checks.toastAfterSendPrompt = await page.locator(".gal-toast").textContent(); break; }
      } catch { /* ignore */ }
    }
    // 開金鑰對話框
    await page.getByRole("button", { name: "開啟對話框" }).click();
    report.checks.dialogOpen = await page.locator("dialog.provider-keys-dialog[open]").count();
    await page.locator("dialog.provider-keys-dialog").screenshot({ path: `${OUT}keys-dialog.png` });
    await page.getByRole("button", { name: "Cancel" }).click();
    // 抽屜
    await page.getByRole("button", { name: "開啟 Demo Gallery 抽屜" }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}demo-drawer.png` });
    await page.keyboard.press("Escape");
    // A2UI basicCatalog 嘗試
    await page.getByRole("button", { name: /用 basicCatalog 真實渲染/ }).click();
    await page.waitForTimeout(800);
    report.checks.a2uiLiveText = (await page.locator("#agent-defined").textContent())?.includes("Welcome back");
    report.checks.a2uiBoundaryTripped = (await page.locator("#agent-defined").textContent())?.includes("丟出例外");
    await page.locator("#agent-defined .gal-item").first().screenshot({ path: `${OUT}a2ui-login.png` });
    // 整頁
    await page.screenshot({ path: `${OUT}full-light-1280.png`, fullPage: true });
  }
  await context.close();
}

await run({ width: 1280, height: 900 }, "light");
await run({ width: 1280, height: 900 }, "dark");
await run({ width: 390, height: 844 }, "light");

// 首頁仍正常
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on("pageerror", (err) => report.pageErrors.push(`[home] ${String(err).slice(0, 300)}`));
await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 120000 });
report.checks.homeHasHeader = await page.locator(".chat-header .chat-name").count();
report.checks.homeWelcome = await page.getByText("What would you like to explore?").count();
await page.screenshot({ path: `${OUT}home.png` });
await context.close();
await browser.close();

writeFileSync(`${OUT}report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
