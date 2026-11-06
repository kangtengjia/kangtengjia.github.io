// Optional development tool. See README for installing QA packages outside the repo.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseURL = process.argv[2] || "http://127.0.0.1:8000";
const require = process.argv[3] ? createRequire(resolve(process.argv[3], "package.json")) : createRequire(import.meta.url);
const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");
const output = resolve(root, "test-results");
mkdirSync(output, { recursive: true });
const source = readFileSync(resolve(root, "data.js"), "utf8");
const results = [];
const errors = [];
const browser = await chromium.launch({ channel: "chromium", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
const page = await context.newPage();
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
const ready = async (target) => target.waitForSelector("html[data-ready]", { state: "attached" });
const go = async (target = page) => { await target.goto(baseURL); await ready(target); };
const check = (name) => { results.push(name); console.log(`PASS ${name}`); };

async function noOverflow(target, label) {
  const sizes = await target.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert.ok(sizes.document <= sizes.viewport + 1 && sizes.body <= sizes.viewport + 1, `${label}: ${JSON.stringify(sizes)}`);
}

async function accessibility(target, label) {
  const result = await new AxeBuilder({ page: target }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  assert.deepEqual(result.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })), [], label);
}

try {
  await go();
  assert.equal(await page.title(), "Tengjia Kang | Academic Homepage");
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  assert.equal(await page.locator("h1").textContent(), "Tengjia Kang");
  assert.equal(await page.locator("#news").isVisible(), false);
  assert.equal(await page.locator("a[download]").count(), 0);
  assert.equal(await page.locator("#publication-list article").count(), 0);
  assert.equal(await page.locator("#project-list article").count(), 0);
  assert.equal(await page.locator("a[href^='mailto:']").count(), 0);
  assert.equal(await page.locator("#current-year").textContent(), String(new Date().getFullYear()));
  await accessibility(page, "Desktop light accessibility");
  await page.screenshot({ path: resolve(output, "desktop-en.png"), fullPage: true });
  check("English/light defaults, genuine profile, empty collections, no missing links, desktop accessibility");

  await page.locator('[data-language="zh"]').click();
  assert.equal(await page.locator("html").getAttribute("lang"), "zh-CN");
  assert.equal(await page.locator("h1").textContent(), "康腾甲");
  assert.equal(await page.locator("#education-list h3").textContent(), "哈尔滨工业大学");
  assert.equal(await page.locator("#publications-title").textContent(), "学术论文");
  assert.match(await page.locator(".site-footer").textContent(), /使用 GitHub Pages 构建/);
  await page.locator("#theme-toggle").click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.reload();
  await ready(page);
  assert.equal(await page.locator("h1").textContent(), "康腾甲");
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  assert.equal(await page.evaluate(() => localStorage.getItem("tk-language")), "zh");
  await accessibility(page, "Desktop dark accessibility");
  await page.screenshot({ path: resolve(output, "desktop-zh-dark.png"), fullPage: true });
  check("Chinese content, translated controls/footer, dark theme and persisted preferences");

  for (const lang of ["en", "zh"]) {
    await page.locator(`[data-language="${lang}"]`).click();
    for (const width of [320, 375, 390, 560, 768, 800, 801, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await noOverflow(page, `${lang} at ${width}px`);
    }
  }
  check("No horizontal overflow in English/Chinese at nine viewport widths (320–1440px)");

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.locator("#menu-toggle");
  assert.equal(await page.locator("#main-nav").isVisible(), false);
  await menu.focus();
  await page.keyboard.press("Enter");
  assert.equal(await menu.getAttribute("aria-expanded"), "true");
  await page.keyboard.press("Escape");
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  assert.equal(await menu.evaluate((node) => document.activeElement === node), true);
  await page.keyboard.press("Space");
  await page.locator('#main-nav a[href="#research"]').click();
  assert.equal(await menu.getAttribute("aria-expanded"), "false");
  assert.ok(page.url().endsWith("#research"));
  await page.waitForFunction(() => document.querySelector("#research").getBoundingClientRect().top >= document.querySelector(".site-header").getBoundingClientRect().height - 1);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");
  await accessibility(page, "Mobile Chinese dark accessibility");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: resolve(output, "mobile-zh-dark.png"), fullPage: true });
  await page.locator('[data-language="en"]').click();
  await page.locator("#theme-toggle").click();
  await accessibility(page, "Mobile English light accessibility");
  await page.screenshot({ path: resolve(output, "mobile-en.png"), fullPage: true });
  check("Mobile keyboard/menu/Escape, hash navigation, visible anchors, reduced motion and accessibility");

  const fixture = `
    window.SITE_DATA.publications = [
      { title: { en: '[TEST ONLY] Earlier paper', zh: '[仅测试] 较早论文' }, authors: ['Tengjia Kang'], year: 2023, venue: 'Test venue', links: {} },
      { title: { en: '[TEST ONLY] Recent paper', zh: '[仅测试] 较新论文' }, authors: ['Test Author', 'Tengjia Kang'], year: 2025, venue: 'Test venue', links: { pdf: 'assets/images/social-card.png', doi: 'https://doi.org/test-only', project: 'https://example.org', code: 'https://github.com/kangtengjia' }, thumbnail: { src: 'assets/favicon.svg', alt: { en: 'Test thumbnail', zh: '测试缩略图' } } }
    ];
    window.SITE_DATA.projects = [
      { title: { en: '[TEST ONLY] Text project', zh: '[仅测试] 文本项目' }, description: { en: 'Test text', zh: '测试文字' }, technologies: ['Test'], links: {} },
      { title: { en: '[TEST ONLY] Image project', zh: '[仅测试] 图片项目' }, description: { en: 'Test text', zh: '测试文字' }, image: { src: 'assets/favicon.svg', alt: 'Test image' }, links: {} }
    ];
    window.SITE_DATA.news = [
      { date: '2023-01-01', text: { en: '[TEST ONLY] Earlier news', zh: '[仅测试] 较早动态' } },
      { date: '2025-03-04', text: { en: '[TEST ONLY] Recent news', zh: '[仅测试] 较新动态' } },
      { date: '2025-02-31', text: 'Invalid calendar date' }
    ];
  `;
  const fixturePage = await context.newPage();
  fixturePage.on("pageerror", (error) => errors.push(error.message));
  await fixturePage.route("**/data.js", (route) => route.fulfill({ contentType: "text/javascript", body: source + fixture }));
  await fixturePage.setViewportSize({ width: 1440, height: 1000 });
  await go(fixturePage);
  assert.deepEqual(await fixturePage.locator(".publication-year").allTextContents(), ["2025", "2023"]);
  assert.equal(await fixturePage.locator(".entry-authors strong").count(), 2);
  assert.equal(await fixturePage.locator("#publication-list .entry-links a").count(), 4);
  const earlierYear = fixturePage.locator('[data-year="2023"]');
  await earlierYear.focus();
  await fixturePage.keyboard.press("Enter");
  assert.deepEqual(await fixturePage.locator(".publication-year").allTextContents(), ["2023"]);
  assert.equal(await earlierYear.evaluate((node) => document.activeElement === node), true);
  await fixturePage.locator('[data-language="zh"]').click();
  assert.deepEqual(await fixturePage.locator(".publication-year").allTextContents(), ["2023"]);
  assert.match(await fixturePage.locator("#publication-list").textContent(), /较早论文/);
  await fixturePage.locator('[data-year="all"]').click();
  assert.equal(await fixturePage.locator("#publication-list article").count(), 2);
  assert.equal(await fixturePage.locator("#project-list article").count(), 2);
  assert.equal(await fixturePage.locator("#project-list .has-image").count(), 1);
  assert.equal(await fixturePage.locator("#news").isVisible(), true);
  assert.deepEqual(await fixturePage.locator("#news-list time").evaluateAll((nodes) => nodes.map((node) => node.dateTime)), ["2025-03-04", "2023-01-01"]);
  await noOverflow(fixturePage, "Populated desktop layout");
  await accessibility(fixturePage, "Populated content accessibility");
  await fixturePage.screenshot({ path: resolve(output, "populated-test-only.png"), fullPage: true });
  await fixturePage.setViewportSize({ width: 320, height: 800 });
  await noOverflow(fixturePage, "Populated mobile layout");
  await fixturePage.close();
  check("Temporary-only papers: descending years, keyboard filters, author emphasis, bilingual projects, images and news sorting");

  for (const variant of ["missing", "html", "invalid", "valid"]) {
    const cvPage = await context.newPage();
    await cvPage.route("**/data.js", (route) => route.fulfill({ contentType: "text/javascript", body: `${source}\nwindow.SITE_DATA.cv.enabled = true;` }));
    let requested = false;
    await cvPage.route("**/assets/cv.pdf", async (route) => {
      requested = true;
      assert.equal(route.request().headers().range, "bytes=0-4");
      await route.fulfill({
        status: variant === "missing" ? 404 : 200,
        contentType: variant === "html" || variant === "missing" ? "text/html" : "application/pdf",
        body: variant === "valid" ? "%PDF-1.4\n% test-only response" : "<html>Not a PDF</html>"
      });
    });
    await go(cvPage);
    await cvPage.waitForLoadState("networkidle");
    assert.equal(requested, true);
    assert.equal(await cvPage.locator("a[download]").count(), variant === "valid" ? 2 : 0, variant);
    await cvPage.close();
  }
  check("CV downloads appear only after an existing PDF MIME type and signature pass validation");

  const noStorage = await browser.newContext();
  await noStorage.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage unavailable"); } }));
  const storagePage = await noStorage.newPage();
  await go(storagePage);
  await storagePage.locator('[data-language="zh"]').click();
  await storagePage.locator("#theme-toggle").click();
  assert.equal(await storagePage.locator("h1").textContent(), "康腾甲");
  assert.equal(await storagePage.locator("html").getAttribute("data-theme"), "dark");
  await noStorage.close();
  check("Language and theme remain usable when localStorage is unavailable");

  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await noJS.newPage();
  await staticPage.goto(baseURL);
  assert.equal(await staticPage.locator("h1").textContent(), "Tengjia Kang");
  assert.equal(await staticPage.locator("#main-nav").isVisible(), true);
  await noOverflow(staticPage, "No JavaScript fallback");
  await noJS.close();
  const filePage = await browser.newPage();
  await filePage.goto(pathToFileURL(resolve(root, "index.html")).href);
  await ready(filePage);
  await filePage.locator('[data-language="zh"]').click();
  assert.equal(await filePage.locator("h1").textContent(), "康腾甲");
  await filePage.close();
  check("Basic profile without JavaScript and direct file:// bilingual operation");

  const missingPage = await context.newPage();
  await missingPage.route("**/deep/path/missing", (route) => route.fulfill({ status: 404, contentType: "text/html", body: readFileSync(resolve(root, "404.html"), "utf8") }));
  await missingPage.goto(`${baseURL}/deep/path/missing`);
  await ready(missingPage);
  assert.equal(await missingPage.locator("h1").textContent(), "未找到页面");
  assert.equal(await missingPage.locator(".text-link").getAttribute("href"), "./");
  assert.ok(await missingPage.locator("h1").evaluate((node) => getComputedStyle(node).fontSize !== "32px"));
  await missingPage.close();
  check("Nested GitHub Pages 404 paths resolve shared styles, scripts and language correctly");

  assert.deepEqual(errors, [], "Unexpected browser console, script or HTTP errors");
  check("No unexpected browser console, JavaScript or resource-loading errors");
} finally {
  writeFileSync(resolve(output, "browser-results.json"), JSON.stringify({ passed: results, errors }, null, 2) + "\n");
  await browser.close();
}
