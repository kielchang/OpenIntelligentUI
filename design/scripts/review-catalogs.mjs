import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const OUT = new URL("../.local/screenshots/review-catalogs/", import.meta.url).pathname;
(await import("node:fs")).mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });
const errors = [];
const warnings = [];

async function openGallery(width, dark) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: dark ? "dark" : "light" });
  const page = await context.newPage();
  page.on("pageerror", (err) => errors.push(`[pageerror ${width}${dark ? " dark" : ""}] ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[console.error ${width}${dark ? " dark" : ""}] ${msg.text().slice(0, 300)}`);
    if (msg.type() === "warning" && /A2UI/.test(msg.text())) warnings.push(msg.text().slice(0, 300));
  });
  await page.goto(`${process.env.BASE_URL ?? "http://localhost:3000"}/gallery`, { waitUntil: "load", timeout: 120000 });
  if (dark) {
    await page.getByRole("button", { name: "深色" }).first().click();
    await page.waitForTimeout(300);
  }
  await page.addStyleTag({ content: ".gal-topbar, .gal-nav { position: static !important; }" });
  await page.locator("#item-a2ui-content h1").waitFor({ timeout: 60000 });
  return { context, page };
}

async function shoot(page, selector, file) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await el.screenshot({ path: `${OUT}${file}`, timeout: 60000 });
  console.log("shot", file);
}

// 1280 light: every item in the section + interactions
{
  const { context, page } = await openGallery(1280, false);
  const items = ["item-collections", "item-a2ui-content", "item-a2ui-layout", "item-a2ui-inputs", "item-a2ui-functions", "item-a2ui-icons", "item-a2ui-versions", "item-sandbox-materials", "item-skills", "item-controlled"];
  for (const [i, id] of items.entries()) {
    await shoot(page, `#${id}`, `${String(i + 1).padStart(2, "0")}-${id}.png`);
  }

  // Interactions on the live surfaces
  const stage = page.locator("#item-a2ui-layout .gal-a2ui-stage");
  await page.getByRole("button", { name: "方案 B" }).click();
  await page.waitForTimeout(200);
  console.log("tab B text:", (await stage.getByText("方案 B 的內容").count()) ? "visible" : "missing");
  await page.getByRole("button", { name: "開啟 Modal" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}11-modal-open.png`, fullPage: false });
  console.log("modal content:", (await page.getByText("關閉鈕由渲染器提供").count()) ? "visible" : "missing");
  await page.getByRole("button", { name: "×" }).first().click();
  await page.waitForTimeout(200);

  const inputs = page.locator("#item-a2ui-inputs .gal-a2ui-stage");
  const nameField = inputs.getByLabel(/Name/);
  await nameField.fill("Sample Chen");
  const slider = inputs.getByLabel(/Volume/);
  await slider.fill("7");
  await page.waitForTimeout(200);
  const echo = await inputs.getByText(/formatString：/).textContent();
  console.log("echo after edits:", echo);
  const plural = await inputs.getByText(/pluralize：/).textContent();
  console.log("plural:", plural);
  const currency = await inputs.locator("small").filter({ hasText: /\$|NT|TWD/ }).first().textContent().catch(() => "n/a");
  console.log("currency:", currency);
  await inputs.getByLabel(/Email/).fill("not-an-email");
  await page.waitForTimeout(200);
  console.log("email check:", (await inputs.getByText("請輸入有效的 email").count()) ? "error shown" : "no error");
  await inputs.getByRole("button", { name: "海岸" }).click().catch(() => {});
  await inputs.getByRole("button", { name: "城市" }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Primary：送出 action" }).click();
  await page.waitForTimeout(400);
  const toast = await page.locator(".gal-toast").last().textContent().catch(() => "no toast");
  console.log("toast:", toast);
  await shoot(page, "#item-a2ui-inputs", "12-item-a2ui-inputs-after-edits.png");
  await context.close();
}

// 1280 dark: stage stays white, chrome goes dark
{
  const { context, page } = await openGallery(1280, true);
  await shoot(page, "#item-collections", "13-dark-item-collections.png");
  await shoot(page, "#item-a2ui-inputs", "14-dark-item-a2ui-inputs.png");
  await context.close();
}

// 390 mobile
{
  const { context, page } = await openGallery(390, false);
  await shoot(page, "#item-collections", "15-mobile-item-collections.png");
  await shoot(page, "#item-a2ui-layout", "16-mobile-item-a2ui-layout.png");
  await context.close();
}

// Home page sanity
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", (err) => errors.push(`[home pageerror] ${err.message}`));
  await page.goto(`${process.env.BASE_URL ?? "http://localhost:3000"}/`, { waitUntil: "load", timeout: 120000 });
  console.log("home title:", await page.title());
  await context.close();
}

await browser.close();
console.log("A2UI warnings:", warnings.length ? warnings : "none");
console.log("errors:", errors.length ? errors : "none");
