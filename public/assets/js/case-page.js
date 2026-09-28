import { PROJECTS } from "./projects.js?v=weichie99";
import { COPY, currentLang } from "./i18n.js?v=weichie99";
import { asset, page } from "./root.js";

function copy() {
  return COPY[currentLang()] || COPY.en;
}

export function fillCasePage(root = document) {
  const id = document.body.dataset.project;
  const project = PROJECTS.find((item) => item.id === id);
  if (!project) return;

  const c = copy();
  const w = c.work?.[project.id] || {};

  document.title = `${project.title} — Nikiman`;
  const q = (sel) => root.querySelector(sel);
  const title = q("[data-c-title]");
  const info = q("[data-c-info]");
  const type = q("[data-c-type]");
  const loc = q("[data-c-loc]");
  const year = q("[data-c-year]");
  const area = q("[data-c-area]");
  const brief = q("[data-c-brief]");
  const approach = q("[data-c-approach]");
  const result = q("[data-c-result]");
  const materials = q("[data-c-materials]");
  const rooms = q("[data-c-rooms]");

  if (title) title.textContent = project.title;
  if (info) info.textContent = w.blurb || project.lead;
  if (type) type.textContent = w.type || project.type;
  if (loc) loc.textContent = w.loc || project.loc;
  if (year) year.textContent = project.year;
  if (area) area.textContent = project.area;
  if (brief) brief.textContent = w.brief || project.brief;
  if (approach) approach.textContent = w.approach || project.approach;
  if (result) result.textContent = w.result || project.result;
  mountPhotos(root, project);
  if (materials) {
    const list = w.materials || project.materials;
    materials.innerHTML = list.map((item) => `<li>${item}</li>`).join("");
  }
  if (rooms) {
    const list = w.rooms || project.rooms;
    rooms.innerHTML = list.map((item) => `<li>${item}</li>`).join("");
  }

  const index = PROJECTS.findIndex((item) => item.id === id);
  const next = index >= 0 && index < PROJECTS.length - 1 ? PROJECTS[index + 1] : null;
  const prev = index > 0 ? PROJECTS[index - 1] : null;
  if (next) {
    root.querySelector("[data-home-ending]")?.remove();
    mountNextProject(next, c, root);
  } else {
    const staleNext = root.querySelector("[data-next-project]");
    if (staleNext) {
      unbindNextScroll();
      staleNext.remove();
    }
    mountHomeEnding(root);
  }
  mountPrevProject(prev, c, root);
}

const ARRIVAL_KEY = "nikiiman:case-scroll-arrival";
const SCROLL_ICON =
  '<svg viewBox="0 0 8 21" fill="none" aria-hidden="true"><path d="M7.96 19.9 6.95 20.77c-.55-.12-1.13-.14-1.7-.18-1.75-.14-3.38.02-4.83.34L0 20.42C.55 19.04.92 17.46 1.03 15.69c.03-.41.03-1.06.05-1.66l1.01-.92c.48 1.75.76 3.2.74 4.28l2.67-2.67c.57-.53.82-.99.82-1.59 0-.6-.66-1.31-1.49-2.27l-.83-.99C3.83 8.49 3.05 7.77 3.05 6.19c0-1.5.69-2.42 1.98-3.64L6.6 0 7.75 1.17 5.15 3.73c-.9.85-1.47 1.45-1.47 2.46 0 1.13.69 1.59 1.56 2.62l.85 1.01c.9 1.06 1.87 2.23 1.87 3.31 0 1.06-.49 1.96-1.31 2.76l-2.72 2.69c1.08.14 2.44.6 4.03 1.31Z" fill="currentColor"/></svg>';
const BACK_ICON =
  '<svg viewBox="0 0 20 9" fill="none" aria-hidden="true"><path d="M17.62 8.19H19.11V0H17.62v3.34H3.8C4.47 2.6 5.15 1.47 5.82 0H4.62C3.15 1.72 1.6 2.98 0 3.8v.59c1.6.82 3.15 2.08 4.62 3.8h1.2C5.15 6.7 4.45 5.57 3.8 4.83h13.82V8.19Z" fill="currentColor"/></svg>';

let nextScrollHandler = null;
let nextScrollBound = false;
let arrivalChecked = false;
let arrivedFromScroll = false;
let transitioning = false;

function mountPhotos(root, project) {
  const article = root.querySelector(".case-page");
  article?.querySelector("[data-c-cover]")?.remove();
  const photos = article?.querySelector("[data-c-photos]") || root.querySelector("[data-c-photos]");
  if (!photos) return;
  photos.innerHTML = project.images
    .map((src) => `<img src="${asset(src)}" alt="${project.title}" />`)
    .join("");
}

function mountNextProject(next, c, root = document) {
  if (!next) return;
  const url = page(`work/${next.id}.html`);
  let section = root.querySelector("[data-next-project]");
  if (!section) {
    section = document.createElement("section");
    section.className = "next-project";
    section.setAttribute("data-next-project", "");
    section.innerHTML = `
      <div class="next-project__inner">
        <h2 class="next-project__heading">
          <a class="next-project__heading-link" data-c-next-title href="#"></a>
        </h2>
        <span class="next-project__caption">
          <span class="next-project__caption-icon" aria-hidden="true">${SCROLL_ICON}</span>
          <span data-c-scroll-next></span>
        </span>
        <a class="next-project__caption" data-variant="link" data-c-overview href="#">
          <span class="next-project__caption-icon" aria-hidden="true">${BACK_ICON}</span>
          <span data-c-overview-label></span>
        </a>
      </div>
      <div class="next-project__preview">
        <figure class="next-project__media">
          <img class="next-project__preview-image" alt="" data-c-next-image />
          <span class="next-project__loader" aria-hidden="true">
            <span class="next-project__loader-arrow" data-layer="base">${SCROLL_ICON}</span>
            <span class="next-project__loader-arrow" data-layer="fill">${SCROLL_ICON}</span>
          </span>
        </figure>
      </div>`;
    const foot = root.querySelector(".foot");
    if (foot) foot.before(section);
    else (root === document ? document.body : root).append(section);
  }

  section.dataset.nextProjectUrl = url;
  section.setAttribute("aria-label", next.title);
  const title = section.querySelector("[data-c-next-title]");
  const scrollLabel = section.querySelector("[data-c-scroll-next]");
  const overview = section.querySelector("[data-c-overview]");
  const overviewLabel = section.querySelector("[data-c-overview-label]");
  const image = section.querySelector("[data-c-next-image]");
  if (title) {
    title.href = url;
    title.textContent = next.title;
  }
  if (scrollLabel) scrollLabel.textContent = c.caseScrollNext || "Scroll to access next project";
  if (overview) overview.href = page("work/");
  if (overviewLabel) {
    overviewLabel.innerHTML = `${c.caseOverview1 || "Back to case"}<br>${c.caseOverview2 || "overview"}`;
  }
  if (image) {
    image.src = asset(next.images[0]);
    image.alt = "";
  }

  const legacy = root.querySelector("[data-c-next]");
  if (legacy) {
    legacy.hidden = true;
    legacy.setAttribute("aria-hidden", "true");
  }

  bindNextScroll(section, url);
}

function mountHomeEnding(root = document) {
  if (root.querySelector("[data-home-ending]")) return;
  const ending = document.createElement("div");
  ending.setAttribute("data-home-ending", "");
  ending.innerHTML = `
    <section class="contact" id="contact">
      <h2 data-mask data-i18n="needTitle">Tell us what you need.</h2>
      <form class="need reveal" id="briefForm">
        <div class="need__lead">
          <span class="need__prefix" data-i18n="needPrefix">I need a</span>
          <div class="need__pills" data-need-pills></div>
          <button class="need__add" type="button" data-need-add aria-label="Add a room type">
            <span aria-hidden="true">+</span>
          </button>
        </div>
        <button class="need__next" type="submit" data-magnetic>
          <span data-i18n="needNext">Next</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
      <div class="tech-grid" data-tech-grid></div>
    </section>
    <footer class="foot">
      <div class="foot__locations reveal">
        <div class="offices" id="offices" aria-label="Studio locations"></div>
        <nav class="foot__social" aria-label="Social">
          <a class="foot__social-link" data-social="linkedin" href="https://www.linkedin.com/in/mehrdad-mehrafarid-66201522b" target="_blank" rel="noopener noreferrer" data-i18n="socialLinkedin">LinkedIn</a>
          <a class="foot__social-link" data-social="instagram" href="#" target="_blank" rel="noopener noreferrer" data-i18n="socialInstagram">Instagram</a>
          <a class="foot__social-link" data-social="whatsapp" href="https://wa.me/905317059444" target="_blank" rel="noopener noreferrer" data-i18n="socialWhatsapp">WhatsApp</a>
        </nav>
      </div>
      <div class="foot__grid reveal">
        <p class="foot__blurb" data-i18n="footBlurb">Nikiman is an interiors atelier at Adam Plaza, Yenigöl, Serik Cd. No: 86, 07230 Muratpaşa/Antalya.</p>
        <div class="foot__col">
          <h4 data-i18n="footStudio">Studio</h4>
          <a href="${page("work/")}" data-i18n="navProject">Project</a>
          <a href="${page("about.html")}" data-i18n="navAbout">About</a>
        </div>
        <div class="foot__col">
          <h4 data-i18n="footExpertises">Expertises</h4>
          <a href="${page("services.html")}" data-i18n="expHospitality">Hospitality</a>
          <a href="${page("services.html")}" data-i18n="expWellness">Wellness</a>
          <a href="${page("services.html")}" data-i18n="expWater">Private water</a>
        </div>
        <div class="foot__col">
          <h4 data-i18n="footLegal">Legal</h4>
          <a href="${page("privacy.html")}" data-i18n="privacy">Privacy</a>
          <a href="${page("imprint.html")}" data-i18n="imprint">Imprint</a>
        </div>
        <div class="foot__col">
          <h4 data-i18n="footBiz">Business inquiries</h4>
          <a class="foot__mail" href="mailto:info@nikiiman.com">info@nikiiman.com</a>
        </div>
      </div>
      <div class="foot__brand">
        <p class="foot__word">NIKIMAN</p>
        <p class="foot__copy">NIKIMAN © 2026</p>
      </div>
    </footer>
    <section class="pick" id="pick" hidden>
      <form class="need reveal" id="pickForm">
        <div class="need__lead">
          <span class="need__prefix" data-i18n="needPrefix">I need a</span>
          <div class="need__pills" data-need-pills></div>
          <button class="need__add" type="button" data-need-add aria-label="Add a room type">
            <span aria-hidden="true">+</span>
          </button>
        </div>
        <button class="need__next" type="submit" data-magnetic>
          <span data-i18n="needNext">Next</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
      <div class="tech-grid" data-tech-grid></div>
    </section>
    <section class="touch" id="touch" hidden>
      <div class="touch__grid">
        <div class="touch__intro">
          <h1 data-mask data-i18n="touchTitle">Contact us.</h1>
          <p data-i18n-html="touchBody">
            Interested in working together? So are we! Simply fill out the form on this page to start the conversation. Already have a project brief? Please send your RFP directly to
            <a href="mailto:info@nikiiman.com">info@nikiiman.com</a>
          </p>
          <div class="touch__locs" id="touchLocs"></div>
        </div>
        <form class="touch-form" id="touchForm">
          <label>
            <span><span data-i18n="fieldName">Name</span><em>*</em></span>
            <input type="text" name="name" required autocomplete="name" />
          </label>
          <label>
            <span><span data-i18n="fieldCompany">Company</span><em>*</em></span>
            <input type="text" name="company" required autocomplete="organization" />
          </label>
          <label>
            <span><span data-i18n="fieldEmail">Email</span><em>*</em></span>
            <input type="email" name="email" required autocomplete="email" />
          </label>
          <label>
            <span data-i18n="fieldPhone">Phone</span>
            <input type="tel" name="phone" autocomplete="tel" />
          </label>
          <label class="touch-form__message">
            <span><span data-i18n="fieldMessage">Message</span><em>*</em></span>
            <textarea name="message" required maxlength="600" id="touchMessage"></textarea>
            <small id="touchCount">0 of 600 max characters</small>
          </label>
          <label class="touch-form__check">
            <input type="checkbox" name="privacy" required />
            <span data-i18n-html="fieldPrivacy">I agree to the <a href="${page("privacy.html")}">privacy policy</a>.<em>*</em></span>
          </label>
          <button class="touch-form__send" type="submit">
            <span data-i18n="fieldSend">Send message</span>
            <span aria-hidden="true">→</span>
          </button>
          <p class="form-ok" id="touchOk" hidden data-i18n="needOk">Your mail client should open with the brief.</p>
        </form>
      </div>
    </section>`;
  const foot = root.querySelector(".foot");
  if (foot) foot.replaceWith(ending);
  else (root === document ? document.body : root).append(ending);
}

function mountPrevProject(prev, c, root = document) {
  if (!arrivalChecked) {
    arrivalChecked = true;
    try {
      arrivedFromScroll = sessionStorage.getItem(ARRIVAL_KEY) === "1";
      if (arrivedFromScroll) sessionStorage.removeItem(ARRIVAL_KEY);
    } catch {
      arrivedFromScroll = false;
    }
  }
  let link = root.querySelector("[data-prev-project]");
  if (!prev || !arrivedFromScroll) {
    link?.remove();
    return;
  }
  if (!link) {
    link = document.createElement("a");
    link.className = "case-prev";
    link.setAttribute("data-prev-project", "");
    link.innerHTML = `<span class="case-prev__icon" aria-hidden="true">${BACK_ICON}</span><span data-c-prev></span>`;
    const article = root.querySelector(".case-page");
    article?.prepend(link);
  }
  link.href = page(`work/${prev.id}.html`);
  const label = link.querySelector("[data-c-prev]");
  if (label) label.textContent = c.casePrev || "Back to previous project";
}

function unbindNextScroll() {
  if (!nextScrollHandler) return;
  window.removeEventListener("scroll", nextScrollHandler);
  window.removeEventListener("resize", nextScrollHandler);
  nextScrollHandler = null;
  nextScrollBound = false;
}

function bindNextScroll(section, url) {
  if (nextScrollBound) return;
  nextScrollBound = true;
  const preview = section.querySelector(".next-project__preview");
  let armed = false;
  let gone = false;

  document.head.querySelectorAll("link[data-case-prefetch]").forEach((el) => el.remove());
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  link.setAttribute("data-case-prefetch", "");
  document.head.append(link);

  const onScroll = () => {
    if (gone || transitioning) return;
    const el = preview || section;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const endTop = vh / 2 - rect.height / 2;
    const span = vh - endTop || 1;
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / span));
    if (progress < 1) armed = true;
    section.style.setProperty("--fill-progress", progress.toFixed(3));
    if (armed && progress >= 0.995) {
      gone = true;
      goToCase(url, { fromScroll: true });
    }
  };

  nextScrollHandler = onScroll;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

function caseDestination(href) {
  let url;
  try {
    url = new URL(href, location.href);
  } catch {
    return null;
  }
  if (url.origin !== location.origin) return null;
  if (!/\/work\/(?!index(?:\.html)?$)[a-z0-9-]+\.html$/.test(url.pathname)) return null;
  if (url.pathname === location.pathname && url.search === location.search) return null;
  return url;
}

function rememberArrival(fromScroll) {
  if (!fromScroll) return;
  try {
    sessionStorage.setItem(ARRIVAL_KEY, "1");
  } catch {
    /* private mode */
  }
}

function lockScroll() {
  window.dispatchEvent(new Event("nikiiman:scroll-lock"));
}

function pinScrollTop() {
  window.scrollTo(0, 0);
  window.dispatchEvent(new Event("nikiiman:scroll-top"));
}

function unlockScroll() {
  window.scrollTo(0, 0);
  window.dispatchEvent(new Event("nikiiman:scroll-unlock"));
}

function playCaseTransition(nextBody, url) {
  const scrollY = window.scrollY;
  document.documentElement.style.overflow = "hidden";

  const leave = document.createElement("div");
  leave.className = "case-swap case-swap--leave";
  leave.style.top = `${-scrollY}px`;
  [...document.body.children].forEach((el) => {
    if (el.tagName === "SCRIPT") return;
    if (el.classList.contains("site-header")) return;
    if (el.hasAttribute("data-site-back")) return;
    leave.append(el);
  });
  document.body.append(leave);

  const enter = document.createElement("div");
  enter.className = "case-swap case-swap--enter";
  [...nextBody.children].forEach((el) => {
    if (el.tagName === "SCRIPT") return;
    if (el.classList.contains("site-header")) return;
    enter.append(document.importNode(el, true));
  });
  document.body.append(enter);

  document.body.dataset.project = nextBody.dataset.project || "";
  document.body.dataset.page = nextBody.dataset.page || "case";
  pinScrollTop();
  try {
    sessionStorage.setItem("nikiiman:case-swapped", "1");
  } catch {
    /* private mode */
  }
  history.pushState({ caseSwap: true }, "", url);
  unbindNextScroll();
  arrivalChecked = false;
  arrivedFromScroll = false;
  fillCasePage(enter);
  window.dispatchEvent(new Event("nikiiman:case-enter"));

  leave.getBoundingClientRect();
  leave.classList.add("is-leaving");
  enter.classList.add("is-entering");

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    leave.remove();
    enter.replaceWith(...enter.childNodes);
    document.documentElement.style.overflow = "";
    pinScrollTop();
    unlockScroll();
    transitioning = false;
  };
  enter.addEventListener("transitionend", (event) => {
    if (event.target === enter && event.propertyName === "transform") finish();
  });
  window.setTimeout(finish, 1400);
}

async function goToCase(href, { fromScroll = false } = {}) {
  if (transitioning) return;
  const url = caseDestination(href) || new URL(href, location.href);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    rememberArrival(fromScroll);
    window.location.href = url.href;
    return;
  }
  transitioning = true;
  lockScroll();
  let html;
  try {
    const res = await fetch(url.href, { credentials: "same-origin" });
    if (!res.ok) throw new Error(String(res.status));
    html = await res.text();
  } catch {
    rememberArrival(fromScroll);
    window.location.href = url.href;
    return;
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (doc.body?.dataset.page !== "case") {
    rememberArrival(fromScroll);
    window.location.href = url.href;
    return;
  }
  rememberArrival(fromScroll);
  if (doc.title) document.title = doc.title;
  playCaseTransition(doc.body, url.href);
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  if (link.target && link.target !== "_self") return;
  const url = caseDestination(link.href);
  if (!url) return;
  event.preventDefault();
  goToCase(url.href);
});

window.addEventListener("popstate", () => {
  try {
    if (sessionStorage.getItem("nikiiman:case-swapped") === "1") location.reload();
  } catch {
    /* private mode */
  }
});

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
fillCasePage();
window.addEventListener("nikiiman:lang", fillCasePage);
