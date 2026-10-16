import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
const D = new URL("..", import.meta.url).pathname;
const server = spawn("python3", ["-m", "http.server", "8090", "--bind", "127.0.0.1", "--directory", D], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 1000));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });
const OUT = new URL("../.local/screenshots/local-", import.meta.url).pathname;
(await import("node:fs")).mkdirSync(new URL("../.local/screenshots/", import.meta.url).pathname, { recursive: true });
for (const [name, path, theme] of [["ds-light", "lilac-mint/preview/index.html", "light"], ["ds-dark", "lilac-mint/preview/index.html", "dark"], ["gallery", "gallery-static/dist/local.html", "light"]]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: theme });
  const page = await ctx.newPage();
  const errs = [];
  page.on("response", (r) => { if (r.status() >= 400) errs.push("404 " + r.url()); }); page.on("pageerror", (e) => errs.push(e.message.slice(0, 150)));
  page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g|net::ERR|esm\.sh|jsdelivr|nationalmap/.test(m.text())) errs.push(m.text().slice(0, 150)); });
  await page.goto(`http://127.0.0.1:8090/${path}`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => ({ frames: document.querySelectorAll("iframe").length, sections: document.querySelectorAll("section").length, bg: getComputedStyle(document.body).backgroundColor, theme: document.documentElement.dataset.theme }));
  if (name.startsWith("ds")) {
    for (const f of page.frames().slice(1, 6)) await f.waitForLoadState().catch(() => {});
    const inner = await page.frames()[2]?.evaluate(() => ({ t: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor })).catch((e) => e.message);
    info.inner = inner;
  }
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log(name, JSON.stringify(info), errs.length ? "ERR " + errs.join(" | ") : "clean");
  await ctx.close();
}
await browser.close(); server.kill();
