// 驗證靜態重製版：以 http.server 服務 dist，檢查 index（1280 淺／深、390）與每個樣本頁的 console／pageerror、橫向捲動、互動。
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";

const DIST = new URL("../gallery-static/dist", import.meta.url).pathname;
const OUT = new URL("../.local/screenshots/review-artifact/", import.meta.url).pathname;
(await import("node:fs")).mkdirSync(OUT, { recursive: true });
const PORT = 8077;
const BASE = `http://127.0.0.1:${PORT}`;

const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1", "--directory", DIST], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 1200));

// 本機預覽時用 skeleton 包起來，模擬 Artifact 宿主的 wrapper
const fragment = readFileSync(`${DIST}/index.html`, "utf8");
const errors = [];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });

async function openIndex(width, theme) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme === "dark" ? "dark" : "light" });
  const page = await context.newPage();
  const tag = `${width}${theme ? `-${theme}` : ""}`;
  page.on("pageerror", (err) => errors.push(`[index ${tag} pageerror] ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[index ${tag} console] ${msg.text().slice(0, 200)}`);
  });
  await page.route(`${BASE}/`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html${theme ? ` data-theme="${theme}"` : ""}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${fragment}</body></html>`,
    }),
  );
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(800);
  return { context, page, tag };
}

// 1280 淺色：整體結構、錨點、互動
{
  const { context, page } = await openIndex(1280, null);
  const counts = await page.evaluate(() => ({
    sections: document.querySelectorAll("section.gal-section").length,
    items: document.querySelectorAll(".gal-item").length,
    nav: document.querySelectorAll(".gal-nav a").length,
    iframes: document.querySelectorAll("iframe").length,
    images: document.querySelectorAll("img").length,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: innerWidth,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  }));
  console.log("index 1280:", JSON.stringify(counts));
  const broken = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href^="#"]'))
      .map((a) => a.getAttribute("href").slice(1))
      .filter((id) => id && !document.getElementById(id)),
  );
  console.log("broken anchors:", broken.length ? broken : "none");
  await page.addStyleTag({ content: ".gal-topbar, .gal-nav { position: static !important; }" });
  for (const id of ["overview", "method", "design-system", "color", "chat-shell", "response", "generative", "unmounted", "agent-defined", "catalogs", "findings"]) {
    const el = page.locator(`#${id}`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await el.screenshot({ path: `${OUT}section-${id}.png`, timeout: 60000 }).catch((e) => console.log("shot failed", id, e.message));
  }
  // tabs
  const tab = page.locator('[data-tabs] [data-tab="dark"]').first();
  if (await tab.count()) {
    await tab.click();
    console.log("design-system dark tab visible:", await page.locator('[data-panel="dark"]:not([hidden])').count());
  }
  // generative replay + finish
  const first = page.locator("article[data-sample]").first();
  await first.scrollIntoViewIfNeeded();
  await first.locator("[data-replay]").click();
  await page.waitForTimeout(5400);
  const steps = await first.locator('[data-step][data-status="done"]').count();
  const frameSrc = await first.locator("iframe").getAttribute("src");
  console.log("replay done steps:", steps, "final src:", frameSrc);
  const bill = page.locator("#sample-reconstructed-bill-splitter");
  await bill.scrollIntoViewIfNeeded();
  await bill.locator("[data-finish]").click();
  await page.waitForTimeout(1500);
  const billFrame = page.frameLocator("#sample-reconstructed-bill-splitter iframe");
  const inputs = await billFrame.locator("input").count();
  console.log("bill splitter inputs in iframe:", inputs);
  if (inputs) {
    const firstInput = billFrame.locator('input[type="number"]').first();
    await firstInput.fill("120");
    await page.waitForTimeout(400);
    console.log("bill status text:", (await billFrame.locator('[role="status"], output').first().textContent().catch(() => "n/a"))?.trim().slice(0, 120));
    const followUp = billFrame.locator("button").filter({ hasText: /agent|代理|explain|Explain/i }).first();
    if (await followUp.count()) {
      await followUp.click();
      await page.waitForTimeout(500);
      console.log("bridge stub:", (await billFrame.locator("#__gal_bridge").textContent().catch(() => "no stub"))?.slice(0, 120));
    }
    await bill.screenshot({ path: `${OUT}sample-bill-splitter.png` });
  }
  // toast
  const toastBtn = page.locator("[data-toast]").first();
  if (await toastBtn.count()) {
    await toastBtn.scrollIntoViewIfNeeded();
    await toastBtn.click();
    await page.waitForTimeout(300);
    console.log("toast:", await page.locator("#gal-toast-region .gal-toast").textContent().catch(() => "none"));
  }
  await context.close();
}

// 1280 深色（data-theme）
{
  const { context, page } = await openIndex(1280, "dark");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log("dark body bg:", bg);
  await page.addStyleTag({ content: ".gal-topbar, .gal-nav { position: static !important; }" });
  for (const id of ["overview", "color", "catalogs"]) {
    const el = page.locator(`#${id}`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await el.screenshot({ path: `${OUT}dark-${id}.png`, timeout: 60000 }).catch(() => {});
  }
  // theme toggle to light
  await page.locator('.gal-topbar [data-theme-set="light"]').first().click();
  console.log("after toggle light body bg:", await page.evaluate(() => getComputedStyle(document.body).backgroundColor));
  await context.close();
}

// 390 手機
{
  const { context, page } = await openIndex(390, null);
  const m = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: innerWidth }));
  console.log("mobile:", JSON.stringify(m), m.scrollWidth <= m.innerWidth ? "no horizontal scroll" : "HORIZONTAL SCROLL");
  if (m.scrollWidth > m.innerWidth) {
    const wide = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > innerWidth + 1 && out.length < 12) out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} right=${Math.round(r.right)}`);
      });
      return out;
    });
    console.log("overflowing:", wide);
  }
  await page.screenshot({ path: `${OUT}mobile-top.png` });
  await context.close();
}

// 每個樣本頁與設計系統框
{
  const context = await browser.newContext({ viewport: { width: 900, height: 800 } });
  const page = await context.newPage();
  const files = readdirSync(`${DIST}/assets/samples`).filter((f) => f.endsWith(".html") && !f.includes(".preview.")).concat(["../design-system/light.html", "../design-system/dark.html"]);
  for (const file of files) {
    const local = [];
    const onErr = (err) => local.push(`pageerror ${err.message.slice(0, 160)}`);
    const onCon = (msg) => { if (msg.type() === "error") local.push(`console ${msg.text().slice(0, 160)}`); };
    page.on("pageerror", onErr);
    page.on("console", onCon);
    await page.goto(`${BASE}/assets/samples/${file}`, { waitUntil: "load", timeout: 60000 }).catch((e) => local.push(`goto ${e.message.slice(0, 100)}`));
    await page.waitForTimeout(1200);
    const status = await page.locator('#status, [role="status"]').first().textContent().catch(() => "");
    console.log(`sample ${file}: ${local.length ? local.join(" | ") : "clean"}${status ? ` · status="${status.trim().slice(0, 80)}"` : ""}`);
    page.off("pageerror", onErr);
    page.off("console", onCon);
  }
  await context.close();
}

await browser.close();
server.kill();
console.log("errors:", errors.length ? errors : "none");
