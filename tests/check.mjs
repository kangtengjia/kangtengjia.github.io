// Run with: node tests/check.mjs (Node.js 18+, no packages required).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(read("data.js"), sandbox);
const { SITE_DATA: data, SITE_I18N: i18n } = sandbox.window;
const html = read("index.html");

function checkLocalFile(url) {
  if (!url || /^(?:https?:|mailto:|#)/.test(url)) return;
  assert.ok(!/^[a-z]+:/i.test(url), `Unsupported URL: ${url}`);
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  assert.ok(existsSync(resolve(root, path)), `Missing local file: ${path}`);
}

test("English and Chinese dictionaries cover the same interface keys", () => {
  assert.deepEqual(Object.keys(i18n.en).sort(), Object.keys(i18n.zh).sort());
  for (const [lang, entries] of Object.entries(i18n)) {
    for (const [key, value] of Object.entries(entries)) assert.ok(value.trim(), `${lang}.${key} is empty`);
  }
  for (const file of ["index.html", "404.html"]) {
    for (const match of read(file).matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) {
      assert.ok(i18n.en[match[1]] && i18n.zh[match[1]], `Missing translation: ${match[1]}`);
    }
  }
});

test("profile, research and education use bilingual data", () => {
  for (const key of ["name", "role", "institution", "intro", "about"]) {
    assert.ok(data.profile[key].en && data.profile[key].zh, `Missing bilingual profile.${key}`);
  }
  for (const item of data.research) assert.ok(item.title.en && item.title.zh && item.description.en && item.description.zh);
  for (const item of data.education) assert.ok(item.institution.en && item.institution.zh && item.role.en && item.role.zh);
  for (const key of ["publications", "projects", "news"]) assert.ok(Array.isArray(data[key]));
});

test("local HTML resources, icons and navigation targets exist", () => {
  for (const file of ["index.html", "404.html"]) {
    for (const match of read(file).matchAll(/(?:src|href)="([^"]+)"/g)) {
      if (file === "404.html" && ["/", "./"].includes(match[1])) continue;
      checkLocalFile(match[1]);
    }
  }
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(match[1]), `Missing anchor ${match[1]}`);
  checkLocalFile(data.profile.portrait.src);
  assert.ok(existsSync(resolve(root, "assets/images/social-card.png")));
});

test("SEO and structured identity match the actual profile", () => {
  assert.ok(html.includes(`<title>${data.site.title}</title>`));
  assert.ok(html.includes(`<link rel="canonical" href="${data.site.url}">`));
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema.name, data.profile.name.en);
  assert.equal(schema.jobTitle, data.profile.role.en);
  assert.equal(schema.affiliation.name, data.profile.institution.en);
  assert.equal(schema.url, data.site.url);
  assert.ok(!schema.email && !schema.award && !schema.alumniOf);
  assert.ok(read("robots.txt").includes(`${data.site.url}sitemap.xml`));
  assert.ok(read("sitemap.xml").includes(`<loc>${data.site.url}</loc>`));
});

test("published data has real years, valid dates and available local assets", () => {
  for (const paper of data.publications) {
    assert.ok(paper.title && Number.isInteger(paper.year) && paper.year > 0, "Finish or remove the publication draft");
    assert.ok(paper.authors?.length && paper.venue, "Publication needs authors and venue");
    checkLocalFile(paper.thumbnail?.src);
    Object.values(paper.links || {}).forEach(checkLocalFile);
  }
  for (const project of data.projects) {
    assert.ok(project.title && project.description);
    checkLocalFile(project.image?.src);
    Object.values(project.links || {}).forEach(checkLocalFile);
  }
  for (const news of data.news) {
    assert.match(news.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(`${news.date}T00:00:00Z`).toISOString().slice(0, 10), news.date);
    assert.ok(news.text);
    checkLocalFile(news.url);
  }
});

test("CV is absent by default, or enabled only with a real PDF file", () => {
  assert.ok(!html.includes('href="assets/cv.pdf"'), "Do not hardcode a missing CV download");
  if (data.cv.enabled) {
    checkLocalFile(data.cv.path);
    assert.equal(readFileSync(resolve(root, data.cv.path)).subarray(0, 5).toString(), "%PDF-");
  }
});

test("GitHub Pages publishes directly from the repository root", () => {
  assert.ok(existsSync(resolve(root, ".nojekyll")));
  assert.ok(existsSync(resolve(root, "404.html")));
  assert.ok(!existsSync(resolve(root, "package.json")), "The site must remain buildless");
  assert.ok(!html.includes("legacy/"), "Legacy template should not be part of the new page");
});
