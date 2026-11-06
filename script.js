/* Plain JavaScript, with no build step or third-party runtime dependencies. */
(() => {
  "use strict";
  const data = window.SITE_DATA;
  const dictionary = window.SITE_I18N;
  if (!data || !dictionary) return;

  const root = document.documentElement;
  const $ = (id) => document.getElementById(id);
  const isHomepage = Boolean($("home"));
  let language = root.lang === "zh-CN" ? "zh" : "en";
  let selectedYear = "all";
  let cvURL = "";
  let scrollPending = false;

  function text(value, lang = language) {
    if (typeof value === "string" || typeof value === "number") return String(value);
    return value?.[lang] || value?.en || value?.zh || "";
  }

  function t(key, values = {}) {
    return (dictionary[language][key] || dictionary.en[key] || key)
      .replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
  }

  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function icon(name, filled = false) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", `icon${filled ? " icon-fill" : ""}`);
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#icon-${name}`);
    svg.append(use);
    return svg;
  }

  // Reject executable URLs. Relative files work both on GitHub Pages and file://.
  function safeURL(value) {
    if (typeof value !== "string" || !value.trim() || value.trim().startsWith("#")) return "";
    try {
      const url = new URL(value, document.baseURI);
      if (["http:", "https:"].includes(url.protocol)) return url.href;
      if (url.protocol === "mailto:" && url.pathname) return url.href;
      if (location.protocol === "file:" && url.protocol === "file:") return url.href;
    } catch (_) { /* An empty/invalid link is omitted. */ }
    return "";
  }

  function link(label, value, className = "") {
    const url = safeURL(value);
    if (!url) return null;
    const anchor = el("a", className, label);
    anchor.href = url;
    return anchor;
  }

  function savePreference(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* Preferences remain in memory. */ }
  }

  function renderCommon() {
    root.lang = language === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAria));
    });
    document.querySelectorAll("[data-profile]").forEach((node) => {
      node.textContent = text(data.profile[node.dataset.profile]);
    });
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });
    if ($("current-year")) $("current-year").textContent = new Date().getFullYear();
    const github = $("footer-github");
    if (github) {
      const url = safeURL(data.links.github);
      github.hidden = !url;
      if (url) github.href = url;
    }
    updateThemeButton();
    updateMenuLabel();
  }

  function renderPortrait() {
    const portrait = $("portrait");
    portrait.replaceChildren();
    const fallback = el("span", "initials", data.profile.initials);
    fallback.setAttribute("role", "img");
    fallback.setAttribute("aria-label", t("portraitPlaceholder", { name: text(data.profile.name) }));
    const rule = el("span", "portrait-rule");
    rule.setAttribute("aria-hidden", "true");
    portrait.append(fallback, rule);
    const src = safeURL(data.profile.portrait?.src);
    if (!src) return;
    const image = el("img");
    image.alt = text(data.profile.portrait.alt) || text(data.profile.name);
    image.width = 456;
    image.height = 540;
    image.decoding = "async";
    image.fetchPriority = "high"; // The above-the-fold portrait should not be lazy-loaded.
    image.addEventListener("load", () => { fallback.hidden = true; rule.hidden = true; });
    image.addEventListener("error", () => image.remove());
    image.src = src;
    portrait.append(image);
  }

  function renderProfileLinks() {
    const target = $("profile-links");
    target.replaceChildren();
    const items = [
      ["github", data.links.github, "github"],
      ["email", data.links.email ? `mailto:${data.links.email}` : "", "mail"],
      ["scholar", data.links.scholar, "book"],
      ["orcid", data.links.orcid, "arrow"]
    ];
    for (const [key, url, symbol] of items) {
      const anchor = link(t(key), url, "text-link");
      if (!anchor) continue;
      anchor.prepend(icon(symbol, key === "github"));
      anchor.append(icon("arrow"));
      target.append(anchor);
    }
    if (cvURL) {
      const anchor = link(t("downloadCV"), cvURL, "text-link");
      anchor.setAttribute("download", "Tengjia-Kang-CV.pdf");
      anchor.prepend(icon("download"));
      target.append(anchor);
    }
  }

  function renderResearch() {
    const tags = $("interest-tags");
    const list = $("research-list");
    tags.replaceChildren();
    list.replaceChildren();
    data.research.forEach((item, index) => {
      tags.append(el("li", "", text(item.title)));
      const article = el("article", "research-card");
      const code = el("span", "research-code", `${String(index + 1).padStart(2, "0")}${item.label ? ` / ${item.label}` : ""}`);
      code.setAttribute("aria-hidden", "true");
      article.append(code, el("h3", "", text(item.title)), el("p", "", text(item.description)));
      list.append(article);
    });
  }

  function emptyState(key, symbol) {
    const box = el("div", "empty-state");
    box.append(icon(symbol), el("p", "", t(key)));
    return box;
  }

  function renderEntryLinks(items) {
    const row = el("div", "entry-links");
    for (const [label, url] of items) {
      const anchor = link(t(label), url);
      if (anchor) row.append(anchor);
    }
    return row;
  }

  function addEntryImage(container, image) {
    const src = safeURL(image?.src);
    if (!src) return;
    const img = el("img", "entry-image");
    img.alt = text(image.alt);
    img.width = 360;
    img.height = 225;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => { img.remove(); container.classList.remove("has-image"); });
    img.src = src;
    container.classList.add("has-image");
    container.prepend(img);
  }

  function publicationItems() {
    // Invalid/incomplete draft entries stay out of the public list.
    return data.publications.filter((item) => text(item.title) && Number.isInteger(item.year) && item.year > 0)
      .slice().sort((a, b) => b.year - a.year);
  }

  function renderPublications() {
    const items = publicationItems();
    const years = [...new Set(items.map((item) => item.year))];
    const filters = $("year-filters");
    filters.replaceChildren();
    filters.hidden = !items.length;
    if (selectedYear !== "all" && !years.includes(selectedYear)) selectedYear = "all";
    if (items.length) {
      ["all", ...years].forEach((year) => {
        const button = el("button", "", year === "all" ? t("allYears") : String(year));
        button.type = "button";
        button.dataset.year = String(year);
        button.setAttribute("aria-pressed", String(year === selectedYear));
        button.addEventListener("click", () => {
          selectedYear = year;
          // Keep the focused filter button in place for keyboard/screen reader users.
          filters.querySelectorAll("button").forEach((node) => {
            node.setAttribute("aria-pressed", String(node === button));
          });
          renderPublicationList(items);
        });
        filters.append(button);
      });
    }
    renderPublicationList(items);
  }

  function renderPublicationList(items) {
    const target = $("publication-list");
    target.replaceChildren();
    const filtered = items.filter((item) => selectedYear === "all" || item.year === selectedYear);
    $("publication-status").textContent = items.length ? t("publicationCount", { count: filtered.length }) : "";
    if (!filtered.length) {
      target.append(emptyState("publicationsEmpty", "book"));
      return;
    }
    let year;
    let yearList;
    for (const item of filtered) {
      if (item.year !== year) {
        year = item.year;
        yearList = el("ol", "publication-list");
        target.append(el("h3", "publication-year", String(year)), yearList);
      }
      const li = el("li", "publication-item");
      const article = el("article");
      article.append(el("h4", "entry-title", text(item.title)));
      const authors = el("p", "entry-authors");
      (item.authors || []).forEach((author, index) => {
        if (index) authors.append(document.createTextNode(", "));
        const ownName = Object.values(data.profile.name).some((name) => name.toLowerCase() === author.trim().toLowerCase());
        authors.append(ownName ? el("strong", "", author) : document.createTextNode(author));
      });
      const links = item.links || {};
      article.append(authors, el("p", "entry-venue", text(item.venue)), renderEntryLinks([
        ["pdf", links.pdf], ["doi", links.doi], ["projectPage", links.project], ["code", links.code]
      ]));
      li.append(article);
      addEntryImage(li, item.thumbnail);
      yearList.append(li);
    }
  }

  function renderProjects() {
    const target = $("project-list");
    target.replaceChildren();
    if (!data.projects.length) {
      target.append(emptyState("projectsEmpty", "folder"));
      return;
    }
    data.projects.forEach((item) => {
      const article = el("article", "project-item");
      const body = el("div");
      body.append(el("h3", "", text(item.title)));
      if (text(item.period)) body.append(el("p", "entry-period", text(item.period)));
      body.append(el("p", "entry-description", text(item.description)));
      if (item.technologies?.length) {
        const tags = el("ul", "technology-tags");
        item.technologies.forEach((label) => tags.append(el("li", "", label)));
        body.append(tags);
      }
      const links = item.links || {};
      body.append(renderEntryLinks([["projectLink", links.website], ["code", links.github], ["paper", links.paper]]));
      article.append(body);
      addEntryImage(article, item.image);
      target.append(article);
    });
  }

  function renderEducation() {
    const target = $("education-list");
    target.replaceChildren();
    data.education.forEach((item) => {
      const row = el("li");
      const dot = el("span", "timeline-dot");
      dot.setAttribute("aria-hidden", "true");
      row.append(dot);
      if (text(item.period)) row.append(el("p", "entry-period", text(item.period)));
      row.append(el("h3", "", text(item.institution)), el("p", "", text(item.role)));
      if (text(item.details)) row.append(el("p", "", text(item.details)));
      target.append(row);
    });
  }

  function newsDate(value) {
    // Require an actual calendar date rather than Date's rollover behaviour.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
  }

  function renderNews() {
    const target = $("news-list");
    target.replaceChildren();
    const items = data.news.filter((item) => newsDate(item.date) && text(item.text))
      .slice().sort((a, b) => b.date.localeCompare(a.date));
    $("news").hidden = !items.length;
    const formatter = new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-GB", {
      year: "numeric", month: "short", day: "numeric", timeZone: "UTC"
    });
    items.forEach((item) => {
      const row = el("li");
      const time = el("time", "", formatter.format(newsDate(item.date)));
      time.dateTime = item.date;
      const body = el("p");
      body.append(link(text(item.text), item.url) || document.createTextNode(text(item.text)));
      row.append(time, body);
      target.append(row);
    });
  }

  function renderCV() {
    const target = $("cv-content");
    target.replaceChildren();
    if (!cvURL) {
      target.append(el("p", "muted", t("cvEmpty")));
      return;
    }
    const anchor = link(t("downloadCV"), cvURL, "cv-download");
    anchor.setAttribute("download", "Tengjia-Kang-CV.pdf");
    anchor.prepend(icon("download"));
    target.append(anchor, el("span", "cv-format", t("cvFormat")));
  }

  async function verifyCV() {
    // Opt-in avoids requesting a missing PDF on every visit to the initial site.
    if (!data.cv.enabled || location.protocol === "file:") return;
    const value = safeURL(data.cv.path);
    if (!value) return;
    const url = new URL(value);
    if (url.origin !== location.origin || !url.pathname.toLowerCase().endsWith(".pdf")) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let reader;
    try {
      const response = await fetch(url, { headers: { Range: "bytes=0-4" }, cache: "no-store", signal: controller.signal });
      if (!response.ok || !response.headers.get("content-type")?.toLowerCase().includes("application/pdf")) {
        await response.body?.cancel();
        return;
      }
      // Read only the PDF signature, even if a host ignores the Range header.
      reader = response.body.getReader();
      const signature = [];
      while (signature.length < 5) {
        const { value: chunk, done } = await reader.read();
        if (done) break;
        for (let i = 0; i < chunk.length && signature.length < 5; i++) signature.push(chunk[i]);
      }
      if (String.fromCharCode(...signature) !== "%PDF-") return;
      cvURL = url.href;
      renderCV();
      renderProfileLinks();
    } catch (_) { /* Missing, offline or invalid PDFs keep the unavailable state. */ }
    finally {
      clearTimeout(timer);
      if (reader) await reader.cancel().catch(() => {});
    }
  }

  function updateSEO() {
    document.title = data.site.title;
    const description = text(data.site.description);
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[name="author"]').content = data.profile.name.en;
    document.querySelector('link[rel="canonical"]').href = data.site.url;
    for (const [property, value] of Object.entries({
      "og:title": data.site.title, "og:site_name": data.site.title, "og:description": description,
      "og:url": data.site.url, "og:locale": language === "zh" ? "zh_CN" : "en_US"
    })) document.querySelector(`meta[property="${property}"]`).content = value;
    $("person-schema").textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "Person", name: data.profile.name.en,
      alternateName: data.profile.name.zh, url: data.site.url, jobTitle: text(data.profile.role, "en"),
      affiliation: { "@type": "CollegeOrUniversity", name: text(data.profile.institution, "en") },
      knowsAbout: data.research.map((item) => text(item.title, "en")),
      sameAs: [data.links.github, data.links.scholar, data.links.orcid].filter((url) => /^https?:/.test(safeURL(url)))
    });
  }

  function render() {
    renderCommon();
    if (isHomepage) {
      const alternate = $("alternate-name");
      alternate.textContent = data.profile.name[language === "en" ? "zh" : "en"];
      alternate.lang = language === "en" ? "zh-CN" : "en";
      renderPortrait();
      renderProfileLinks();
      renderResearch();
      renderPublications();
      renderProjects();
      renderEducation();
      renderNews();
      renderCV();
      updateSEO();
    } else {
      document.title = `${t("notFoundTitle")} | ${data.profile.name.en}`;
    }
    root.dataset.ready = "";
    delete root.dataset.languagePending;
    scheduleActiveLink();
  }

  function updateThemeButton() {
    const dark = root.dataset.theme === "dark";
    if ($("theme-toggle")) {
      $("theme-toggle").setAttribute("aria-label", t(dark ? "themeLight" : "themeDark"));
      $("theme-toggle").setAttribute("aria-pressed", String(dark));
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#111923" : "#fafbfd";
  }

  function updateMenuLabel() {
    const button = $("menu-toggle");
    if (button) button.setAttribute("aria-label", t(button.getAttribute("aria-expanded") === "true" ? "menuClose" : "menuOpen"));
  }

  function setMenu(open, restoreFocus = false) {
    if (!$("menu-toggle")) return;
    $("menu-toggle").setAttribute("aria-expanded", String(open));
    $("main-nav").classList.toggle("is-open", open);
    const header = document.querySelector(".site-header");
    if (header) root.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`);
    updateMenuLabel();
    if (restoreFocus) $("menu-toggle").focus();
  }

  function scheduleActiveLink() {
    if (!isHomepage || scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      scrollPending = false;
      const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
      let active = "home";
      const offset = document.querySelector(".site-header").getBoundingClientRect().height + 36;
      for (const anchor of navLinks) {
        const section = $(anchor.hash.slice(1));
        if (section && !section.hidden && section.getBoundingClientRect().top <= offset) active = section.id;
      }
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) active = "cv";
      navLinks.forEach((anchor) => {
        if (anchor.hash === `#${active}`) anchor.setAttribute("aria-current", "location");
        else anchor.removeAttribute("aria-current");
      });
    });
  }

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.language === language) return;
      language = button.dataset.language;
      savePreference("tk-language", language);
      render();
    });
  });
  $("theme-toggle")?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    savePreference("tk-theme", root.dataset.theme);
    updateThemeButton();
  });
  $("menu-toggle")?.addEventListener("click", () => {
    setMenu($("menu-toggle").getAttribute("aria-expanded") !== "true");
  });
  $("main-nav")?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("menu-toggle")?.getAttribute("aria-expanded") === "true") setMenu(false, true);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setMenu(false);
  });
  window.addEventListener("scroll", scheduleActiveLink, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) setMenu(false);
    scheduleActiveLink();
  });
  const header = document.querySelector(".site-header");
  if (header && "ResizeObserver" in window) {
    new ResizeObserver(() => root.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`)).observe(header);
  }
  if ($("header-controls")) $("header-controls").hidden = false;
  if ($("menu-toggle")) $("menu-toggle").hidden = false;
  render();
  if (isHomepage) void verifyCV();
})();
