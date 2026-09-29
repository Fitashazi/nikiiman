import { PROJECTS } from "./projects.js?v=weichie99";
import { COPY, currentLang, nextLang } from "./i18n.js?v=weichie99";
import { asset, page } from "./root.js";

const stage = document.getElementById("stage");
const heroStage = document.getElementById("heroStage");
const grid = document.getElementById("workGrid");
const caseEl = document.getElementById("case");
const casePhotos = document.getElementById("casePhotos");
let form = document.getElementById("briefForm");
const header = document.querySelector("[data-header]");
const menuToggle = document.getElementById("menu-toggle");
const themeToggle = document.querySelector("[data-theme-toggle]");
const langToggle = document.querySelector("[data-lang-toggle]");
const heroLabels = document.getElementById("heroLabels");
const stickyContent = document.getElementById("stickyContent");
const teamTrack = document.getElementById("teamTrack");
let offices = document.getElementById("offices");
/* Paste real profile IDs / URLs when ready — empty keeps # until set */
const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/mehrdad-mehrafarid-66201522b",
  instagram: "https://www.instagram.com/mehrdad.mehrafarid",
  whatsapp: "https://wa.me/905317059444",
};
let pick = document.getElementById("pick");
let pickForm = document.getElementById("pickForm");
let touch = document.getElementById("touch");
let touchLocs = document.getElementById("touchLocs");
let touchForm = document.getElementById("touchForm");
let touchMessage = document.getElementById("touchMessage");
let touchCount = document.getElementById("touchCount");
let touchOk = document.getElementById("touchOk");

const NEED_COLS = [
  ["hospitality", "water", "material", "joinery", "threshold", "opinion"],
  ["wellness", "interiors", "lighting", "conservation", "athletic"],
];
const ARROW_SVG =
  '<svg viewBox="-5 0 16 20" aria-hidden="true"><path d="M-3.906 15.771V5.828C-3.906 2.61 -1.297 0.001 1.921 0.001H10.921" stroke="currentColor" stroke-width="2" fill="none"/></svg>';
const selectedNeeds = new Set();

let lang = currentLang();

function t() {
  return COPY[lang] || COPY.en;
}

function isOpen(tz, open = "09:00", close = "18:00") {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const mins = Number(map.hour) * 60 + Number(map.minute);
    const [oh, om] = open.split(":").map(Number);
    const [ch, cm] = close.split(":").map(Number);
    const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(map.weekday);
    return weekday && mins >= oh * 60 + om && mins < ch * 60 + cm;
  } catch {
    return true;
  }
}

function applyStaticCopy() {
  const c = t();
  document.documentElement.lang = c.lang;
  const pageId = document.body.dataset.page;
  const pageTitle = {
    services: c.servicesMeta,
    about: c.aboutMeta,
    contact: c.contactMeta,
    work: c.workMeta,
    privacy: c.privacyMeta,
    imprint: c.imprintMeta,
  }[pageId];
  if (!document.body.dataset.project) {
    document.title = pageTitle || c.metaTitle;
  }
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (typeof c[key] === "string") el.textContent = c[key];
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.dataset.i18nHtml;
    if (typeof c[key] === "string") el.innerHTML = c[key];
  });
  const cur = document.querySelector("[data-lang-current]");
  const oth = document.querySelector("[data-lang-other]");
  if (cur) cur.textContent = c.lang.toUpperCase();
  if (oth) oth.textContent = c.other;
  document.querySelectorAll("[data-home-ending] a[href]").forEach((el) => {
    const href = el.getAttribute("href") || "";
    if (!href || /^(https?:|mailto:|tel:|#|\.\.?\/)/i.test(href)) return;
    el.setAttribute("href", page(href));
  });
}

const LABEL_ICONS = [
  '<svg viewBox="0 0 24 24" fill="none"><path d="M6 20V10a6 6 0 0 1 12 0v10" stroke="currentColor" stroke-width="1.6"/><path d="M10 20v-4.2a2 2 0 0 1 4 0V20" stroke="currentColor" stroke-width="1.6"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.1" stroke="currentColor" stroke-width="1.6"/><path d="M12 4.2v2M12 17.8v2M4.2 12h2M17.8 12h2M6.6 6.6l1.4 1.4M16 16l1.4 1.4M6.6 17.4l1.4-1.4M16 8l1.4-1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 4.4s-5.8 6.8-5.8 10.6a5.8 5.8 0 1 0 11.6 0c0-3.8-5.8-10.6-5.8-10.6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.1" stroke="currentColor" stroke-width="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.1" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.1" stroke="currentColor" stroke-width="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.1" stroke="currentColor" stroke-width="1.6"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 4 20 9.4 12 20 4 9.4 12 4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 9.4h16M12 4v16" stroke="currentColor" stroke-width="1.6"/></svg>',
];

/* Six photos on Weichie’s 15-plane ring (their 5 services × 3).
   No duplicate neighbors, including the wrap. */
const HERO_CIRCLE = [
  { src: "assets/img/circle/01.jpg", title: "Private suite" },
  { src: "assets/img/circle/02.jpg", title: "Indoor outdoor" },
  { src: "assets/img/circle/03.jpg", title: "Gathering hall" },
  { src: "assets/img/circle/04.jpg", title: "Atrium light" },
  { src: "assets/img/circle/05.jpg", title: "City threshold" },
  { src: "assets/img/circle/kitchen.png", title: "Sustainable dream house" },
];
const HERO_ORDER = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 2, 4];

function heroSlides() {
  const ids = PROJECTS.map((p) => p.id);
  return HERO_ORDER.map((hi, i) => {
    const img = HERO_CIRCLE[hi];
    return {
      id: ids[i % Math.max(ids.length, 1)] || "orbis",
      src: img.src,
      title: img.title,
    };
  });
}

function fillLabels() {
  if (!heroLabels) return;
  const ids = PROJECTS.map((p) => p.id);
  heroLabels.innerHTML = t()
    .labels.map((label, i) => ({ label, id: ids[i], i }))
    .filter((item) => item.id)
    .map(
      ({ label, id, i }) =>
        `<li><button type="button" data-hero-id="${id}" aria-label="${label}">
          <span class="hero__label-icon" aria-hidden="true">${LABEL_ICONS[i] || ""}</span>
          <span class="hero__label-text">${label}</span>
        </button></li>`
    )
    .join("");
}

function bentHeroMedia(src, alt, extraClass = "") {
  /* Enough strips to approximate Weichie mesh curvature smoothly */
  const strips = 24;
  const parts = Array.from({ length: strips }, (_, i) => {
    const x = (i + 0.5) / strips - 0.5;
    return `<span class="hero__strip" style="--i:${i};--x:${x.toFixed(4)}"><img src="${src}" alt="" draggable="false" /></span>`;
  }).join("");
  const isBack = extraClass.includes("hero__media--back");
  const a11y = isBack || !alt ? ' aria-hidden="true"' : ` role="img" aria-label="${alt}"`;
  return `<span class="hero__media hero__media--bent${extraClass ? ` ${extraClass}` : ""}" style="--strips:${strips}"${a11y}>${parts}</span>`;
}

function fillStage() {
  if (!stage) return;
  stage.innerHTML = heroSlides()
    .map(
      (s) =>
        `<a class="hero__card" href="${page("work/" + s.id + ".html")}" data-id="${s.id}" aria-label="${s.title}" draggable="false">
          ${bentHeroMedia(asset(s.src), s.title)}
          ${bentHeroMedia(asset(s.src), "", "hero__media--back")}
        </a>`
    )
    .join("");
}

function fillGrid() {
  if (!grid) return;
  const copy = t().work;
  const lane = new URLSearchParams(location.search).get("type");
  const all = PROJECTS.filter((p) => !lane || p.lane === lane);
  /* Homepage mirrors Weichie: 3 featured projects; full archive on /work */
  const homePreview = !document.body.dataset.page;
  const list = homePreview ? all.slice(0, 3) : all;
  /* Weichie latest-work slot parallax strengths */
  const itemParallax = { 1: 10, 2: 26, 3: 16 };
  grid.innerHTML = list
    .map((p, i) => {
      const w = copy[p.id] || {};
      const pos = (i % 3) + 1;
      const lift = itemParallax[pos] || 12;
      return `<li class="work__item reveal" data-pos="${pos}" data-parallax="${lift}" data-parallax-min="980" style="--stagger:${Math.min(i, 3)}">
        <a href="${page("work/" + p.id + ".html")}" data-id="${p.id}">
          <span class="work__media">
            <span class="work__shift" data-parallax="-12" data-parallax-mode="cover" data-parallax-min="980">
              <img src="${asset(p.images[0])}" alt="${p.title}" draggable="false" />
            </span>
          </span>
          <div class="work__body">
            <h3>${p.title}</h3>
            <span>${w.type || p.type}</span>
            <p>${w.blurb || p.lead}</p>
          </div>
        </a>
      </li>`;
    })
    .join("");
}

function fillSticky() {
  if (!stickyContent) return;
  const c = t();
  const blocks = [
    [c.sticky1Title, c.sticky1Body, c.sticky1Items],
    [c.sticky2Title, c.sticky2Body, c.sticky2Items],
    [c.sticky3Title, c.sticky3Body, c.sticky3Items],
  ];
  stickyContent.innerHTML = blocks
    .map(
      ([title, body, items], i) =>
        `<article class="reveal" style="--stagger:${i}">
          <h3>${title}</h3>
          <p>${body}</p>
          <ul>${items.map(([k, v]) => `<li><strong>${k}</strong>: ${v}</li>`).join("")}</ul>
        </article>`
    )
    .join("");
}

function fillTeam() {
  if (!teamTrack) return;
  const c = t();
  const cards = c.team
    .map((person) => {
      const open = isOpen(person.tz);
      return `<article class="team-card">
        <img src="${asset(person.img)}" alt="${person.name}" />
        <div>
          <p><span class="dot ${open ? "" : "is-off"}"></span>${person.name}</p>
          <span>${person.role}</span>
        </div>
      </article>`;
    })
    .join("");
  teamTrack.innerHTML = cards + cards;
}

const OFFICE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Adam%20Plaza%2C%20Yenig%C3%B6l%2C%20Serik%20Cd.%20No%3A%2086%2C%2007230%20Muratpa%C5%9Fa%2FAntalya";
const OFFICE_MAPS_EMBED =
  "https://maps.google.com/maps?q=Adam%20Plaza%2C%20Yenig%C3%B6l%2C%20Serik%20Cd.%20No%3A%2086%2C%2007230%20Muratpa%C5%9Fa%2FAntalya&z=16&output=embed";

function fillOffices() {
  if (!offices) return;
  const c = t();
  const phoneIcon = `<span class="card-office__phone-icon" aria-hidden="true">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 0C5.53043 0 6.03899 0.210865 6.41406 0.585938L6.54688 0.732422C6.83855 1.08833 7 1.53581 7 2V5C7 5.31049 6.92792 5.61682 6.78906 5.89453L6.67285 6.0957C6.54602 6.28934 6.38629 6.45998 6.2002 6.59961L5.73242 6.95117C5.54884 7.09135 5.41944 7.29086 5.36621 7.51562C5.31305 7.74028 5.3393 7.97606 5.44043 8.18359C6.80711 10.9595 9.05446 13.2052 11.832 14.5684C11.9868 14.6394 12.1563 14.6689 12.3242 14.6562L12.4912 14.6299C12.7117 14.5748 12.9073 14.4455 13.0449 14.2646L13.4004 13.7998C13.5867 13.5516 13.8279 13.3497 14.1055 13.2109C14.3832 13.0721 14.6895 13 15 13H18C18.5304 13 19.039 13.2109 19.4141 13.5859L19.5469 13.7324C19.8385 14.0883 20 14.5358 20 15V18C20 18.5304 19.7891 19.039 19.4141 19.4141C19.039 19.7891 18.5304 20 18 20C13.2261 20 8.64812 18.1032 5.27246 14.7275C1.89681 11.3519 0 6.7739 0 2C0 1.53581 0.161455 1.08833 0.453125 0.732422L0.585938 0.585938C0.96101 0.210865 1.46957 0 2 0H5Z" fill="currentColor"/>
    </svg>
  </span>`;

  offices.innerHTML = (c.offices || [])
    .map((office, i) => {
      const open = isOpen(office.tz, office.open || "09:00", office.close || "18:00");
      return `<a class="card-office${open ? "" : " is-closed"}" style="--stagger:${i}" href="${OFFICE_MAPS_URL}" target="_blank" rel="noopener noreferrer"${open ? "" : " data-closed"}>
        <span class="card-office__media">
          <iframe class="card-office__map" title="${office.name}" loading="lazy" tabindex="-1" referrerpolicy="no-referrer-when-downgrade" src="${OFFICE_MAPS_EMBED}"></iframe>
          <span class="card-office__map-label">${c.mapOpen}</span>
        </span>
        <span class="card-office__body">
          <span class="card-office__header">
            <span class="card-office__status">
              <span class="pill-location ${open ? "is-open" : "is-closed"}" aria-hidden="true">
                <span class="pill-location__dot"></span>
              </span>
              <span class="card-office__status-open">${c.officeOpen}</span>
              <span class="card-office__status-closed">${c.officeClosed}</span>
            </span>
            <span class="card-office__city">${office.name}</span>
          </span>
          <span class="card-office__footer">
            ${office.address ? `<span class="card-office__address">${office.address}</span>` : ""}
            <span class="card-office__hours">${office.hours}</span>
            <span class="card-office__phone">
              ${phoneIcon}
              <span class="card-office__phone-text">${office.phone}</span>
            </span>
          </span>
        </span>
      </a>`;
    })
    .join("");
}

function socialHref(key, value) {
  const v = (value || "").trim();
  if (!v) return "#";
  if (/^https?:\/\//i.test(v) || v.startsWith("mailto:") || v.startsWith("tel:")) return v;
  if (key === "linkedin") {
    if (v.includes("/")) return `https://www.linkedin.com/${v.replace(/^\//, "")}`;
    return `https://www.linkedin.com/company/${v}`;
  }
  if (key === "instagram") {
    return `https://www.instagram.com/${v.replace(/^@/, "")}/`;
  }
  if (key === "whatsapp") {
    const digits = v.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : "#";
  }
  return v;
}

function wireSocial() {
  document.querySelectorAll("[data-social]").forEach((el) => {
    const key = el.getAttribute("data-social");
    const href = socialHref(key, SOCIAL_LINKS[key]);
    el.setAttribute("href", href);
    if (href === "#") el.setAttribute("aria-disabled", "true");
    else el.removeAttribute("aria-disabled");
    if (el.dataset.socialBound) return;
    el.dataset.socialBound = "1";
    el.addEventListener("click", (e) => {
      const k = el.getAttribute("data-social");
      if (socialHref(k, SOCIAL_LINKS[k]) === "#") e.preventDefault();
    });
  });
}

function needLabel(id) {
  return t().needs[id] || id;
}

function fillNeedUI() {
  const labels = t().needs;
  document.querySelectorAll("[data-tech-grid]").forEach((grid) => {
    const keep = grid.querySelector("li.is-in");
    grid.innerHTML = NEED_COLS.map(
      (col, ci) =>
        `<ul>${col
          .map((id, ri) => {
            const on = selectedNeeds.has(id);
            const stagger = ri * 2 + ci;
            return `<li style="--stagger:${stagger}"${keep ? ' class="is-in"' : ""}>
              <button type="button" class="tech-row${on ? " is-on" : ""}" data-need="${id}" aria-pressed="${on}">
                <span class="tech-row__arrow">${ARROW_SVG}</span>
                <span class="tech-row__label">${labels[id]}</span>
                <span class="tech-row__plus" aria-hidden="true">${on ? "−" : "+"}</span>
              </button>
            </li>`;
          })
          .join("")}</ul>`
    ).join("");
  });
  document.querySelectorAll("[data-need-pills]").forEach((el) => {
    el.innerHTML = [...selectedNeeds]
      .map(
        (id) =>
          `<span data-need="${id}">${labels[id]}<button type="button" data-remove-need="${id}" aria-label="Remove">×</button></span>`
      )
      .join("");
  });
  document.querySelectorAll("[data-need-add]").forEach((btn) => {
    btn.setAttribute("aria-label", t().needAdd);
  });
}

function toggleNeed(id) {
  if (!id || !t().needs[id]) return;
  if (selectedNeeds.has(id)) selectedNeeds.delete(id);
  else selectedNeeds.add(id);
  fillNeedUI();
  wireReveal();
}

function applyNeedsToMessage() {
  if (!touchMessage || !selectedNeeds.size) return;
  const labels = [...selectedNeeds].map(needLabel);
  touchMessage.value = t().needLead + labels.join(", ") + ".";
  updateTouchCount();
}

function closeCase() {
  if (!caseEl) return;
  caseEl.classList.remove("is-open");
  hideOverlay(caseEl);
  document.body.classList.remove("is-case");
}

function openCase(id) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p || !caseEl) return;
  const w = t().work[p.id] || {};
  caseEl.querySelector("[data-c-title]").textContent = p.title;
  caseEl.querySelector("[data-c-info]").textContent = w.blurb || p.lead;
  caseEl.querySelector("[data-c-type]").textContent = w.type || p.type;
  caseEl.querySelector("[data-c-loc]").textContent = p.loc;
  caseEl.querySelector("[data-c-year]").textContent = p.year;
  casePhotos.innerHTML = p.images.map((src) => `<img src="${asset(src)}" alt="${p.title}" />`).join("");
  document.body.classList.add("is-case");
  showOverlay(caseEl);
}

function fillTouchLocs() {
  if (!touchLocs) return;
  const zones = ["Europe/Istanbul", "Asia/Dubai", "Asia/Tehran"];
  const icons = [
    '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 4l2 4h6v4h-2v12h-3V16h-6v8H10V12H8V8h6l2-4zm-7 22h14v2H9v-2z"/></svg>',
    '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M15 3h2v4h3v3h-1v16h-6V10h-1V7h3V3zm-6 10h3v12H9V13zm14 4h3v8h-3v-8zM6 27h20v2H6v-2z"/></svg>',
    '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M8 14h4v12H8V14zm6-6h4v18h-4V8zm6 4h4v14h-4V12zM6 28h20v2H6v-2z"/></svg>',
  ];
  touchLocs.innerHTML = (t().cities || [])
    .map((city, i) => {
      const open = zones[i] ? isOpen(zones[i]) : false;
      return `<article class="touch-loc">
        <span class="touch-loc__icon">${icons[i] || ""}</span>
        <h3>${city.name} <span class="dot ${open ? "" : "is-off"}"></span></h3>
        <p class="touch-loc__legal">${city.legal}</p>
        <p class="touch-loc__address">${city.address}</p>
        <a href="mailto:info@nikiiman.com">info@nikiiman.com</a>
      </article>`;
    })
    .join("");
}

function updateTouchCount() {
  if (!touchMessage || !touchCount) return;
  const n = touchMessage.value.length;
  touchCount.textContent = t().charCount.replace("{n}", String(n));
}

function openPick(e) {
  if (e) e.preventDefault();
  if (!pick) return;
  closeCase();
  closeTouch({ silent: true });
  document.body.classList.add("is-pick");
  if (location.hash !== "#pick") history.pushState({ pick: true }, "", "#pick");
  showOverlay(pick);
  pick.scrollTop = 0;
  playPickMotion();
}

function closePick(opts = {}) {
  if (!pick) return;
  hideOverlay(pick);
  document.body.classList.remove("is-pick");
  if (!opts.silent && location.hash === "#pick") {
    history.pushState({}, "", location.pathname + location.search);
  }
}

function openTouch(e) {
  if (e) e.preventDefault();
  if (!touch) return;
  closeCase();
  closePick({ silent: true });
  document.body.classList.add("is-touch");
  if (location.hash !== "#touch") history.pushState({ touch: true }, "", "#touch");
  showOverlay(touch);
  touch.scrollTop = 0;
  playOverlayIn(touch);
}

function closeTouch(opts = {}) {
  if (!touch) return;
  hideOverlay(touch);
  document.body.classList.remove("is-touch");
  if (!opts.silent && location.hash === "#touch") {
    history.pushState({}, "", location.pathname + location.search);
  }
}

let revealIO;
const hideTimers = new Map();
let parallaxEls = [];
let parallaxQueued = false;

function reducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function showOverlay(el) {
  if (!el) return;
  const pending = hideTimers.get(el);
  if (pending) {
    clearTimeout(pending);
    hideTimers.delete(el);
  }
  el.hidden = false;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add("is-open"));
  });
}

function hideOverlay(el) {
  if (!el) return;
  el.classList.remove("is-open");
  if (reducedMotion()) {
    el.hidden = true;
    return;
  }
  const pending = hideTimers.get(el);
  if (pending) clearTimeout(pending);
  hideTimers.set(
    el,
    setTimeout(() => {
      el.hidden = true;
      hideTimers.delete(el);
    }, 480)
  );
}

function maskHeadings(scope = document) {
  scope.querySelectorAll("[data-mask]").forEach((el) => {
    const seen = el.classList.contains("is-in");
    const text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return;
    el.classList.add("reveal-mask");
    el.innerHTML = text
      .split(" ")
      .map((word, i) => `<span class="mask" style="--stagger:${i}"><span class="mask__in">${word}</span></span>`)
      .join("");
    if (seen) el.classList.add("is-in");
  });
}

function wireReveal() {
  const items = document.querySelectorAll(".reveal, .reveal-mask, .tech-grid li");
  if (reducedMotion()) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  if (!revealIO) {
    revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealIO.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
  }
  items.forEach((el) => {
    if (el.classList.contains("is-in")) return;
    if (el.closest(".pick, .touch, .case")) return;
    revealIO.observe(el);
  });
}

/* Match Weichie data-icon-pop: scale 0 + rotate -25°, then back.out on scroll */
function wireIconPop() {
  const icons = document.querySelectorAll("[data-icon-pop]");
  if (!icons.length) return;
  if (reducedMotion()) {
    icons.forEach((el) => el.classList.add("is-in"));
    return;
  }
  if (!wireIconPop.io) {
    wireIconPop.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          wireIconPop.io.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -20% 0px" }
    );
  }
  icons.forEach((el) => {
    if (el.classList.contains("is-in")) return;
    wireIconPop.io.observe(el);
  });
}

function playOverlayIn(root) {
  if (!root) return;
  const rows = root.querySelectorAll(".reveal, .reveal-mask, .tech-grid li, .need");
  if (reducedMotion()) {
    rows.forEach((el) => el.classList.add("is-in"));
    return;
  }
  rows.forEach((el) => el.classList.remove("is-in"));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      rows.forEach((el) => el.classList.add("is-in"));
    });
  });
}

function playPickMotion() {
  playOverlayIn(pick);
}

function wireParallax() {
  parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  tickParallax();
}

function parallaxProgress(box, view) {
  /* 0 when top enters bottom of viewport; 1 when bottom leaves top — Weichie scrub range */
  const start = view;
  const end = -box.height;
  const span = start - end || 1;
  return Math.min(1, Math.max(0, (start - box.top) / span));
}

function tickParallax() {
  if (reducedMotion()) return;
  /* Re-query so fillGrid / lang re-renders never leave a stale NodeList */
  parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  if (!parallaxEls.length) return;
  const view = window.innerHeight || 1;
  const wide = window.matchMedia("(min-width: 980px)").matches;

  parallaxEls.forEach((el) => {
    const minW = parseFloat(el.dataset.parallaxMin);
    if (minW && !wide) {
      el.style.transform = "";
      return;
    }
    const box = el.getBoundingClientRect();
    const amount = parseFloat(el.dataset.parallax);
    const t = Number.isFinite(amount) ? amount : 12;
    const p = parallaxProgress(box, view);
    /* Scrub from +t to -t so cards levitate upward while scrolling */
    const yPercent = t + (-t - t) * p;

    if (el.dataset.parallaxMode === "cover") {
      const scale = 1 + Math.abs(t) * 0.02;
      el.style.transform = `translate3d(0, ${yPercent.toFixed(2)}%, 0) scale(${scale})`;
    } else {
      el.style.transform = `translate3d(0, ${yPercent.toFixed(2)}%, 0)`;
    }
  });
}

function queueParallax() {
  if (parallaxQueued) return;
  parallaxQueued = true;
  requestAnimationFrame(() => {
    tickParallax();
    parallaxQueued = false;
  });
}

function wireMagnetic() {
  if (reducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
  const targets = document.querySelectorAll(
    [
      "[data-magnetic]",
      ".site-header .nav-main > a",
      ".site-header .nav-main__trigger",
      ".site-header .icon-btn",
      ".site-header .lang-switcher",
    ].join(", ")
  );
  targets.forEach((el) => {
    if (el.dataset.mag) return;
    el.dataset.mag = "1";
    const compact = el.matches(".icon-btn, .lang-switcher, .nav-main__trigger, .nav-main > a");
    const pullX = compact ? 12 : 18;
    const pullY = compact ? 8 : 12;
    el.addEventListener("pointermove", (e) => {
      const box = el.getBoundingClientRect();
      const x = ((e.clientX - box.left) / box.width - 0.5) * pullX;
      const y = ((e.clientY - box.top) / box.height - 0.5) * pullY;
      const scale = el.matches(".icon-btn, .lang-switcher") ? " scale(1.06)" : "";
      el.style.transform = `translate3d(${x}px, ${y}px, 0)${scale}`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

function initSmoothScroll() {
  if (initSmoothScroll.bound) return;
  initSmoothScroll.bound = true;

  const html = document.documentElement;
  let current = window.scrollY;
  let target = window.scrollY;
  let running = false;
  let scrollLocked = false;
  const ease = 0.1;

  function snapTop() {
    current = 0;
    target = 0;
    window.scrollTo(0, 0);
  }

  window.addEventListener("nikiiman:scroll-lock", () => {
    scrollLocked = true;
  });
  window.addEventListener("nikiiman:scroll-top", snapTop);
  window.addEventListener("nikiiman:scroll-unlock", () => {
    scrollLocked = false;
    snapTop();
  });

  if (reducedMotion()) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  html.classList.add("is-smooth");

  function maxY() {
    return Math.max(0, html.scrollHeight - window.innerHeight);
  }

  function overlaysOpen() {
    const b = document.body;
    return (
      b.classList.contains("is-nav") ||
      b.classList.contains("is-pick") ||
      b.classList.contains("is-touch") ||
      b.classList.contains("is-case")
    );
  }

  function animate() {
    if (scrollLocked) {
      running = false;
      return;
    }
    running = true;
    if (overlaysOpen()) {
      current = window.scrollY;
      target = window.scrollY;
      running = false;
      return;
    }
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.4) current = target;
    window.scrollTo(0, current);
    queueParallax();
    if (current !== target) requestAnimationFrame(animate);
    else running = false;
  }

  function nudge(delta) {
    if (scrollLocked) return;
    target = Math.max(0, Math.min(maxY(), target + delta));
    if (!running) requestAnimationFrame(animate);
  }

  window.addEventListener(
    "wheel",
    (e) => {
      if (scrollLocked) {
        e.preventDefault();
        return;
      }
      if (overlaysOpen() || e.ctrlKey) return;
      e.preventDefault();
      nudge(e.deltaY);
    },
    { passive: false }
  );

  window.addEventListener("keydown", (e) => {
    if (scrollLocked || overlaysOpen()) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
    const page = window.innerHeight * 0.88;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      nudge(80);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nudge(-80);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      nudge(page);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      nudge(-page);
    } else if (e.key === " " && !e.shiftKey) {
      e.preventDefault();
      nudge(page);
    } else if (e.key === " " && e.shiftKey) {
      e.preventDefault();
      nudge(-page);
    } else if (e.key === "Home") {
      e.preventDefault();
      target = 0;
      if (!running) requestAnimationFrame(animate);
    } else if (e.key === "End") {
      e.preventDefault();
      target = maxY();
      if (!running) requestAnimationFrame(animate);
    }
  });

  window.addEventListener(
    "scroll",
    () => {
      if (scrollLocked || running) return;
      current = window.scrollY;
      target = window.scrollY;
    },
    { passive: true }
  );
}

function isShot() {
  return new URLSearchParams(location.search).has("shot");
}

let servicesMotion = null;

function wireServices() {
  const page = document.querySelector("[data-page='services'] .svc");
  if (!page) return;
  servicesMotion?.destroy();

  const reduce = reducedMotion();
  const fine = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
  const title = page.querySelector("[data-svc-title]");
  const hero = page.querySelector(".svc-hero");
  const host = page.querySelector("[data-svc-list]");
  const preview = page.querySelector("[data-svc-preview]");
  const rows = [...page.querySelectorAll("[data-svc-row]")];
  const panels = [...page.querySelectorAll("[data-svc-panel]")];
  const counter = page.querySelector("[data-svc-count]");
  const gallery = page.querySelector("[data-svc-gallery]");
  const strip = gallery?.querySelector(".svc-gallery__strip");
  const cleanups = [];
  const timers = [];
  let cancelled = false;
  cleanups.push(() => {
    cancelled = true;
    timers.forEach((id) => window.clearTimeout(id));
  });

  if (counter) counter.textContent = reduce ? "130" : "127";

  if (title) {
    const text = title.textContent.replace(/\s+/g, " ").trim();
    const beats = ["is-arrow", "is-lead", "is-count", "is-plus"];
    if (reduce) {
      title.textContent = text;
      title.classList.add("is-in");
      hero?.classList.add(...beats);
    } else {
      const words = text.split(" ").filter(Boolean);
      title.innerHTML = words
        .map((word, i) => `<span class="svc-word" style="--i:${i}"><span>${word}</span></span>`)
        .join(" ");
      title.classList.remove("is-in");
      hero?.classList.remove(...beats);
      /* Weichie load chain: words (0.8s, 0.08 stagger), then arrow, lead, count with 0.2s overlap.
         The count beat shows 127, then 128, 129, and 130. Each step is a little longer, like the
         end of Weichie's count. The plus joins 200ms after 130. */
      const wordEnd = 800 + Math.max(0, words.length - 1) * 80;
      const arrowAt = wordEnd;
      const leadAt = arrowAt + 400;
      const countAt = leadAt + 400;
      const countFrom = 127;
      const countTo = 130;
      const countGaps = [160, 190, 240];
      const plusAfterFinal = 200;
      requestAnimationFrame(() => {
        if (cancelled) return;
        title.classList.add("is-in");
        const later = (ms, fn) => {
          timers.push(window.setTimeout(fn, ms));
        };
        later(arrowAt, () => hero?.classList.add("is-arrow"));
        later(leadAt, () => hero?.classList.add("is-lead"));
        later(countAt, () => {
          hero?.classList.add("is-count");
          if (!counter) {
            later(plusAfterFinal, () => hero?.classList.add("is-plus"));
            return;
          }
          let value = countFrom;
          counter.textContent = String(value);
          const step = () => {
            if (cancelled) return;
            if (value >= countTo) {
              hero?.classList.add("is-plus");
              return;
            }
            value += 1;
            counter.textContent = String(value);
            later(value === countTo ? plusAfterFinal : countGaps[value - countFrom], step);
          };
          later(countGaps[0], step);
        });
      });
    }
  }

  const setActive = (index, swap) => {
    rows.forEach((row, i) => {
      const on = i === index;
      row.classList.toggle("is-active", on);
      row.setAttribute("aria-current", on ? "true" : "false");
    });
    panels.forEach((panel, i) => {
      const on = i === index;
      panel.hidden = !on;
      panel.classList.toggle("is-swap", on && swap && !reduce);
    });
  };
  setActive(Math.max(0, rows.findIndex((row) => row.classList.contains("is-active"))), false);

  const imgs = preview ? [...preview.querySelectorAll("img")] : [];
  let shown = imgs[0] || null;
  let activeRow = null;
  let hideAt = 0;
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let scale = 0.8;
  let opacity = 0;
  let targetScale = 0.8;
  let targetOpacity = 0;
  let following = false;
  let raf = 0;

  const paintPreview = () => {
    if (!preview) return;
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    scale += (targetScale - scale) * 0.18;
    opacity += (targetOpacity - opacity) * 0.18;
    preview.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(${scale})`;
    preview.style.opacity = String(opacity);
    if (following || opacity > 0.01) raf = requestAnimationFrame(paintPreview);
    else raf = 0;
  };

  const wake = () => {
    if (!raf) raf = requestAnimationFrame(paintPreview);
  };

  const showImage = (src) => {
    if (!preview || !src) return;
    if (shown?.getAttribute("src") === src && shown.classList.contains("is-show")) return;
    const next = imgs.find((img) => img !== shown) || imgs[0];
    if (!next) return;
    next.src = src;
    next.classList.add("is-show");
    shown?.classList.remove("is-show");
    shown = next;
  };

  const place = (row, clientX) => {
    if (!host || !preview) return;
    const hostBox = host.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    const w = preview.offsetWidth || 240;
    const h = preview.offsetHeight || 263;
    const minX = rowBox.left - hostBox.left;
    const maxX = rowBox.right - hostBox.left - w;
    let x = clientX - hostBox.left + 24;
    x = maxX >= minX ? Math.max(minX, Math.min(maxX, x)) : Math.max(0, minX);
    let y = rowBox.top - hostBox.top + rowBox.height / 2 - h / 2;
    y = Math.max(0, Math.min(y, host.offsetHeight - h));
    tx = x;
    ty = y;
    if (opacity < 0.08) {
      cx = x;
      cy = y;
    }
  };

  const onEnter = (event) => {
    if (!fine || reduce) return;
    const row = event.currentTarget;
    const index = rows.indexOf(row);
    if (index < 0) return;
    activeRow = row;
    setActive(index, true);
    following = true;
    targetOpacity = 1;
    targetScale = 1;
    showImage(row.dataset.img);
    place(row, event.clientX || row.getBoundingClientRect().left + 48);
    wake();
  };

  const onMove = (event) => {
    if (!fine || reduce || !following || !activeRow) return;
    place(activeRow, event.clientX);
  };

  const onLeave = () => {
    activeRow = null;
    following = false;
    targetOpacity = 0;
    targetScale = 0.8;
    hideAt = performance.now();
    wake();
  };

  const onFocus = (event) => {
    const row = event.currentTarget;
    const index = rows.indexOf(row);
    if (index >= 0) setActive(index, true);
    if (!fine || reduce || !row) return;
    activeRow = row;
    following = true;
    targetOpacity = 1;
    targetScale = 1;
    showImage(row.dataset.img);
    const box = row.getBoundingClientRect();
    place(row, box.left + Math.min(160, box.width * 0.35));
    wake();
  };
  const onBlur = () => {
    if (host?.matches(":hover")) return;
    onLeave();
  };

  if (host && fine && !reduce) {
    rows.forEach((row) => {
      row.addEventListener("mouseenter", onEnter);
      row.addEventListener("focus", onFocus);
      row.addEventListener("blur", onBlur);
    });
    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseleave", onLeave);
    cleanups.push(() => {
      rows.forEach((row) => {
        row.removeEventListener("mouseenter", onEnter);
        row.removeEventListener("focus", onFocus);
        row.removeEventListener("blur", onBlur);
      });
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    });
  }

  const onChoose = (event) => {
    const row = event.currentTarget;
    const index = rows.indexOf(row);
    if (index < 0) return;
    setActive(index, true);
    if (!fine || reduce) {
      const copy = page.querySelector("[data-svc-copy]");
      const box = copy?.getBoundingClientRect();
      if (box && (box.top > window.innerHeight * 0.85 || box.bottom < 0)) {
        copy.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      }
    }
  };
  rows.forEach((row) => {
    row.addEventListener("click", onChoose);
    if (!fine || reduce) row.addEventListener("focus", onChoose);
  });
  cleanups.push(() => {
    rows.forEach((row) => {
      row.removeEventListener("click", onChoose);
      row.removeEventListener("focus", onChoose);
    });
  });

  const onScroll = () => {
    if (!gallery || !strip || reduce) return;
    const rect = gallery.getBoundingClientRect();
    const view = window.innerHeight || 1;
    const total = rect.height + view;
    const progress = Math.min(1, Math.max(0, (view - rect.top) / total));
    const overflow = Math.max(0, strip.scrollWidth - gallery.offsetWidth);
    gallery.style.setProperty("--svc-gallery-x", `${-overflow * 0.4 * progress}px`);
  };
  if (gallery && !reduce) {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    });
  }

  servicesMotion = {
    destroy() {
      cleanups.forEach((fn) => fn());
      servicesMotion = null;
    },
  };
}

/* Weichie footer logo scrub: scale 1 → 0.8 and x 20% → 0 while the footer settles.
   Copyright fades in over the second half on desktop, the last quarter on mobile. */
function wireFooterWord() {
  if (wireFooterWord.bound) return;
  wireFooterWord.bound = true;

  const mobileQuery = window.matchMedia("(max-width: 767px)");
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function activeFooter() {
    const feet = document.querySelectorAll(".foot");
    for (const footer of feet) {
      if (footer.closest(".case-swap--leave")) continue;
      return footer;
    }
    return feet[0] || null;
  }

  function tick() {
    const footer = activeFooter();
    const word = footer?.querySelector(".foot__word");
    if (!footer || !word) return;
    const copy = footer.querySelector(".foot__copy");
    const brand = footer.querySelector(".foot__brand") || word;
    if (reduceQuery.matches) {
      word.style.transform = "";
      if (copy) copy.style.opacity = "";
      return;
    }
    const view = window.innerHeight || 1;
    const brandTop = brand.getBoundingClientRect().top;
    const footerBottom = footer.getBoundingClientRect().bottom;
    /* start: top of the word at 95% of the viewport (where Weichie’s hand bottom sits)
       end: footer bottom against the viewport bottom */
    const travelled = view * 0.95 - brandTop;
    const distance = footerBottom - brandTop - view * 0.05;
    const progress =
      distance <= 0 ? (travelled > 0 ? 1 : 0) : Math.min(1, Math.max(0, travelled / distance));
    const scale = 1 - 0.2 * progress;
    const x = 20 * (1 - progress);
    word.style.transform = `translate3d(${x.toFixed(3)}%, 0, 0) scale(${scale.toFixed(4)})`;
    if (copy) {
      const start = mobileQuery.matches ? 0.75 : 0.5;
      const duration = mobileQuery.matches ? 0.25 : 0.5;
      const fade = Math.min(1, Math.max(0, (progress - start) / duration));
      copy.style.opacity = String(0.5 * fade);
    }
  }

  wireFooterWord.tick = tick;
  tick();
  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", tick);
  mobileQuery.addEventListener?.("change", tick);
  reduceQuery.addEventListener?.("change", tick);
}

function bootMotion() {
  document.documentElement.classList.add("is-ready");
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const wait = heroStage && !reduced && !isShot() ? 2000 : 0;
  window.setTimeout(() => {
    document.documentElement.classList.add("is-hero-cards");
  }, wait);
  maskHeadings();
  wireReveal();
  wireIconPop();
  wireParallax();
  wireMagnetic();
  initSmoothScroll();
  wireFooterWord();
  wireServices();
}

function syncHash() {
  if (location.hash === "#pick") openPick();
  else if (location.hash === "#touch") openTouch();
  else {
    closePick({ silent: true });
    closeTouch({ silent: true });
  }
}

function render() {
  applyStaticCopy();
  fillLabels();
  fillGrid();
  fillSticky();
  fillTeam();
  fillOffices();
  wireSocial();
  fillNeedUI();
  fillTouchLocs();
  updateTouchCount();
  bootMotion();
}

function spinRing() {
  if (!stage || !heroStage) return;
  const cards = [...stage.children];
  const n = cards.length;
  if (!n) return;

  /*
    Weichie hero camera (HeroHomepage):
      desktop  fov 24, cameraZ 8.6, radius 4.3, plane 1.6, tilt -13°
      tablet   fov 40
      phone    fov 49, radius 4
    Every plane is the same world size. The front card is large and the
    cards turning away get smaller because the camera is close to the ring.
    CSS +Y is down, so rotateX(+13°) matches Three.js rotateX(-13°).
  */
  const AUTO = -0.04;
  const RISE_DUR = 1200;
  const DRAG = 0.005;
  const VEL_BLEND = 0.35;
  const VEL_MAX = 6;
  const IDLE_MS = 100;
  const HOLD_MS = 1500;
  const CLICK_PX = 5;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const shot = isShot();

  let radius = 420;
  let drop = 0;
  let rotation = 0;
  let spin = reduced || shot ? 0 : AUTO;
  let dragging = false;
  let moved = false;
  let lastX = 0;
  let downX = 0;
  let downY = 0;
  let lastTick = performance.now();
  let lastPointer = performance.now();
  let animating = false;
  let animFrom = 0;
  let animTo = 0;
  let animStart = 0;
  let animDur = 0;
  let riseStart = 0;
  let rise = reduced || shot ? 0 : 1;
  let holdUntil = 0;

  function overlaysOpen() {
    const b = document.body;
    return b.classList.contains("is-pick") || b.classList.contains("is-touch") || b.classList.contains("is-case");
  }

  /* Pixels per world unit so the stage height is the vertical FOV at cameraZ. */
  function cameraFrame() {
    const w = heroStage.clientWidth;
    const h = heroStage.clientHeight || window.innerHeight;
    let fov = 24;
    let ring = 4.3;
    const cameraZ = 8.6;
    const plane = 1.6;
    if (w <= 720) {
      /* Same rotating ring, framed close enough that the front photo fills most of the phone width. */
      fov = 22;
      ring = 4;
    } else if (w <= 768) {
      fov = 49;
      ring = 4;
    } else if (w <= 1024) {
      fov = 40;
    }
    const tilt = (13 * Math.PI) / 180;
    const tan = Math.tan((fov * Math.PI) / 360);
    const k = h / (2 * cameraZ * tan);
    return {
      card: plane * k,
      radiusPx: ring * k,
      perspective: cameraZ * k,
      drop: ring * k * Math.sin(tilt),
      bend: plane * k * 0.3,
    };
  }

  function layout() {
    const frame = cameraFrame();
    radius = frame.radiusPx;
    drop = frame.drop;
    const hero = heroStage.closest(".hero");
    if (hero) {
      hero.style.setProperty("--card-w", `${frame.card}px`);
      hero.style.setProperty("--card-h", `${frame.card}px`);
      hero.style.setProperty("--hero-bend", `${frame.bend}px`);
    }
    heroStage.style.perspective = `${frame.perspective}px`;
    cards.forEach((el, i) => {
      el.dataset.base = String((i / n) * Math.PI * 2);
    });
  }

  function frontIndex() {
    let best = 0;
    let score = -Infinity;
    cards.forEach((el, i) => {
      const facing = Math.cos(Number(el.dataset.base) + rotation);
      if (facing > score) {
        score = facing;
        best = i;
      }
    });
    return best;
  }

  function paint() {
    const lift = rise * (heroStage.clientHeight || 0);
    /* Tilt, then seat the front card on the stage center. No extra Z push. */
    stage.style.transform = `translate3d(0, ${drop + lift}px, 0) rotateX(13deg) rotateY(${(rotation * 180) / Math.PI}deg)`;
    const threshold = Math.cos(Math.PI / 3);
    cards.forEach((el) => {
      const facing = Math.cos(Number(el.dataset.base) + rotation);
      el.style.transform = `rotateY(${(Number(el.dataset.base) * 180) / Math.PI}deg) translateZ(${radius}px)`;
      el.style.opacity = "";
      el.style.zIndex = String(Math.round((facing + 1) * 100));
      el.style.pointerEvents = facing >= threshold ? "auto" : "none";
      const opacity = facing >= threshold ? 1 : (facing + 1) / (threshold + 1);
      el.querySelectorAll(".hero__media").forEach((node) => {
        node.style.opacity = opacity >= 0.999 ? "" : String(opacity);
      });
    });
    const front = cards[frontIndex()];
    const id = front?.dataset.id;
    heroLabels?.querySelectorAll("button").forEach((btn) => {
      const on = btn.dataset.heroId === id;
      btn.classList.toggle("is-on", on);
      btn.classList.toggle("is-active", on);
    });
  }

  function goTo(id) {
    const matches = [];
    cards.forEach((card, i) => {
      if (card.dataset.id === id) matches.push(i);
    });
    if (!matches.length) return;
    const index = matches[Math.floor(Math.random() * matches.length)];
    const tau = Math.PI * 2;
    let target = -Number(cards[index].dataset.base || 0);
    while (target - rotation > Math.PI) target -= tau;
    while (target - rotation < -Math.PI) target += tau;
    if (Math.random() < 0.5) target += target > rotation ? -tau : tau;
    animFrom = rotation;
    animTo = target;
    animStart = performance.now();
    animDur = (0.8 + 2 * Math.min(Math.abs(target - rotation) / tau, 1)) * 1000;
    animating = true;
    holdUntil = 0;
    spin = 0;
  }

  function tick(now) {
    const dt = Math.min((now - lastTick) / 1000, 0.05);
    lastTick = now;

    if (!reduced && rise > 0 && document.documentElement.classList.contains("is-hero-cards")) {
      if (!riseStart) riseStart = now;
      const u = Math.min((now - riseStart) / RISE_DUR, 1);
      /* power3.out — same rise Weichie uses for the canvas */
      rise = (1 - u) ** 3;
      if (u >= 1) rise = 0;
    }

    if (animating) {
      const u = Math.min((now - animStart) / animDur, 1);
      const e = u < 0.5 ? 2 * u * u : 1 - ((-2 * u + 2) ** 2) / 2;
      rotation = animFrom + (animTo - animFrom) * e;
      if (u >= 1) {
        animating = false;
        rotation = animTo;
        spin = reduced ? 0 : AUTO;
        holdUntil = now + HOLD_MS;
      }
    } else if (dragging) {
      /* rotation updated in pointermove */
    } else if (now < holdUntil) {
      spin = reduced ? 0 : AUTO;
    } else if (!overlaysOpen() && !reduced && !shot) {
      const damp = 0.94 ** (dt * 60);
      spin = AUTO + (spin - AUTO) * damp;
      if (Math.abs(spin - AUTO) < 0.001) spin = AUTO;
      rotation += spin * dt;
    }

    paint();
    requestAnimationFrame(tick);
  }

  /*
    cameraFrame() reads the stage box once. On a cold load the module can run
    before the stylesheet is applied, so the stage is still a one-line box and
    the ring is locked tiny. A refresh already has CSS, so that same read is
    the right size. Wait for the styled box, and measure again if it changes
    without a window resize.
  */
  let sizedW = -1;
  let sizedH = -1;

  function measure() {
    if (getComputedStyle(heroStage).position !== "relative") return;
    const w = heroStage.clientWidth;
    const h = heroStage.clientHeight;
    if (w <= 0 || h <= 0) return;
    if (w === sizedW && h === sizedH) return;
    sizedW = w;
    sizedH = h;
    layout();
    paint();
  }

  measure();
  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => measure()).observe(heroStage);
  }
  requestAnimationFrame(function arm(now) {
    if (sizedW < 0) {
      measure();
      requestAnimationFrame(arm);
      return;
    }
    tick(now);
  });
  window.addEventListener("resize", () => {
    sizedW = -1;
    sizedH = -1;
    measure();
  });

  heroStage.addEventListener("dragstart", (e) => {
    e.preventDefault();
  });
  heroStage.addEventListener("pointerdown", (e) => {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    moved = false;
    animating = false;
    holdUntil = 0;
    lastX = e.clientX;
    downX = e.clientX;
    downY = e.clientY;
    lastPointer = performance.now();
    spin = 0;
    heroStage.classList.add("is-drag");
    try {
      heroStage.setPointerCapture(e.pointerId);
    } catch (_) {}
  });
  heroStage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    e.preventDefault();
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > CLICK_PX) moved = true;
    const now = performance.now();
    const dt = Math.max((now - lastPointer) / 1000, 0.001);
    lastPointer = now;
    const dRot = dx * DRAG;
    rotation += dRot;
    spin = spin * (1 - VEL_BLEND) + (dRot / dt) * VEL_BLEND;
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    heroStage.classList.remove("is-drag");
    if (e?.pointerId != null) {
      try {
        heroStage.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
    if (reduced || shot) {
      spin = 0;
      return;
    }
    if (performance.now() - lastPointer > IDLE_MS) spin = AUTO;
    else spin = Math.max(-VEL_MAX, Math.min(VEL_MAX, spin));
  }
  heroStage.addEventListener("pointerup", endDrag);
  heroStage.addEventListener("pointercancel", endDrag);
  heroStage.addEventListener("lostpointercapture", endDrag);
  heroStage.addEventListener(
    "click",
    (e) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  heroLabels?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-hero-id]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    goTo(btn.dataset.heroId);
  });
}

function wireNeed() {
  document.addEventListener("click", (e) => {
    const remove = e.target.closest("[data-remove-need]");
    if (remove) {
      e.preventDefault();
      toggleNeed(remove.dataset.removeNeed);
      return;
    }
    const row = e.target.closest(".tech-row[data-need]");
    if (row) {
      e.preventDefault();
      toggleNeed(row.dataset.need);
    }
  });
}

try {
  fillStage();
  render();
  spinRing();
  wireNeed();
} catch (err) {
  console.error("[nikiiman] init failed", err);
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-open-pick]")) {
    openPick(e);
    header?.classList.remove("is-open");
    document.body.classList.remove("is-nav");
    return;
  }
  if (e.target.closest("[data-open-touch]")) {
    openTouch(e);
    header?.classList.remove("is-open");
    document.body.classList.remove("is-nav");
    return;
  }
  const card = e.target.closest(".hero__card[data-id], .work__item [data-id]");
  if (card?.dataset.id && card.tagName !== "A") {
    e.preventDefault();
    openCase(card.dataset.id);
  }
  if (e.target.closest("[data-close]")) closeCase();
  if (e.target.closest(".branding") && (document.body.classList.contains("is-touch") || document.body.classList.contains("is-pick"))) {
    closeTouch();
    closePick();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCase();
    closeTouch();
    closePick();
  }
});

function applyTheme(dark) {
  const meta = document.querySelector('meta[name="theme-color"]');
  const root = document.documentElement;
  if (dark) {
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
    root.style.backgroundColor = "#15140e";
    localStorage.setItem("theme", "dark");
    if (meta) meta.setAttribute("content", "#15140e");
  } else {
    root.removeAttribute("data-theme");
    root.style.colorScheme = "light";
    root.style.backgroundColor = "#fdf9f9";
    localStorage.setItem("theme", "light");
    if (meta) meta.setAttribute("content", "#fdf9f9");
  }
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") !== "dark");
  });
}

if (langToggle) {
  langToggle.addEventListener("click", () => {
    lang = nextLang(lang);
    localStorage.setItem("lang", lang);
    render();
    window.dispatchEvent(new Event("nikiiman:lang"));
  });
}

window.addEventListener("nikiiman:case-enter", () => {
  applyStaticCopy();
  if (document.querySelector("[data-home-ending]")) bindLateHome();
});

document.querySelectorAll("[data-nav-drop]").forEach((drop) => {
  const trigger = drop.querySelector(".nav-main__trigger");
  const menu = drop.querySelector(".nav-main__menu");
  if (!trigger || !menu) return;

  menu.removeAttribute("hidden");

  const close = () => {
    drop.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    trigger.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => {
      drop.classList.add("is-open");
    });
  };

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (drop.classList.contains("is-open")) close();
    else open();
  });

  drop.querySelectorAll(".nav-main__menu a").forEach((link) => {
    link.addEventListener("click", () => close());
  });

  document.addEventListener("click", (e) => {
    if (!drop.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
});

if (menuToggle && header) {
  menuToggle.addEventListener("click", () => {
    const open = header.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("is-nav", open);
  });
  header.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      header.classList.remove("is-open");
      document.body.classList.remove("is-nav");
      if (!a.hasAttribute("data-open-touch") && !a.hasAttribute("data-open-pick")) {
        closeTouch();
        closePick();
      }
    });
  });
}

window.addEventListener(
  "scroll",
  () => {
    document.documentElement.toggleAttribute("data-scrolled", window.scrollY > 12);
    queueParallax();
  },
  { passive: true }
);
document.documentElement.toggleAttribute("data-scrolled", window.scrollY > 12);

if (touchMessage && !touchMessage.dataset.inputBound) {
  touchMessage.dataset.inputBound = "1";
  touchMessage.addEventListener("input", updateTouchCount);
}

if (touchForm && !touchForm.dataset.submitBound) {
  touchForm.dataset.submitBound = "1";
  touchForm.addEventListener("submit", onTouchSubmit);
}

const SITE_BACK_FLAG = "nikiman-internal-nav";

function parentHref() {
  if (document.body.dataset.page === "case") return "index.html";
  return page("index.html");
}

function siteBackNeeded() {
  /* index.html has no is-page class. Never show Back there, including after the hero. */
  if (!document.body.classList.contains("is-page")) return false;
  if (document.body.classList.contains("is-nav")) return false;
  return true;
}

function wireSiteBack() {
  if (document.querySelector("[data-site-back]")) return;
  const link = document.createElement("a");
  link.className = "site-back";
  link.setAttribute("data-site-back", "");
  link.href = parentHref();
  link.innerHTML =
    '<span class="site-back__icon" aria-hidden="true"><svg width="20" height="9" viewBox="0 0 20 9" fill="none"><path d="M17.6196 8.19011H19.1106V0.000105053H17.6196V3.33911H3.80164C4.47364 2.60411 5.14564 1.4701 5.81764 0.000105053H4.62064C3.15064 1.7221 1.59664 2.9821 0.000640094 3.8011V4.38911C1.59664 5.20811 3.15064 6.46811 4.62064 8.19011H5.81764C5.14564 6.69911 4.45264 5.56511 3.80164 4.83011H17.6196V8.19011Z" fill="currentColor"/></svg></span><span class="site-back__label" data-i18n="navBack">Back</span>';
  document.body.appendChild(link);
  const label = link.querySelector("[data-i18n]");
  if (label && t().navBack) label.textContent = t().navBack;

  const show = (on) => {
    document.documentElement.toggleAttribute("data-back", on);
    if (on) {
      link.setAttribute("data-visible", "");
      link.removeAttribute("aria-hidden");
      link.removeAttribute("tabindex");
    } else {
      link.removeAttribute("data-visible");
      link.setAttribute("aria-hidden", "true");
      link.tabIndex = -1;
    }
  };

  const update = () => show(siteBackNeeded());
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  window.addEventListener("popstate", update);
  new MutationObserver(update).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  document.addEventListener(
    "click",
    (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.hasAttribute("data-site-back")) return;
      try {
        const url = new URL(a.href, location.href);
        if (url.origin === location.origin) sessionStorage.setItem(SITE_BACK_FLAG, "1");
      } catch (err) {}
    },
    true
  );

  link.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (document.body.classList.contains("is-case") && caseEl && !caseEl.hidden) {
      closeCase();
      return;
    }
    if (location.hash === "#touch" || location.hash === "#pick") {
      history.back();
      return;
    }
    let sameOrigin = false;
    try {
      sameOrigin = !!document.referrer && new URL(document.referrer).origin === location.origin;
    } catch (err) {}
    const internal = sessionStorage.getItem(SITE_BACK_FLAG) === "1";
    if (history.length > 1 && (internal || sameOrigin || document.referrer)) {
      history.back();
      return;
    }
    const dest = new URL(parentHref(), location.href);
    const here = new URL(location.href);
    if (dest.pathname === here.pathname) {
      window.scrollTo(0, 0);
      return;
    }
    window.location.href = dest.href;
  });
}

wireSiteBack();
syncHash();
window.addEventListener("popstate", syncHash);
function goToContact(e) {
  e.preventDefault();
  applyNeedsToMessage();
  openTouch();
}
function onTouchSubmit(e) {
  e.preventDefault();
  const data = new FormData(touchForm);
  const c = t();
  const subject = encodeURIComponent(c.touchSubject + " — " + (data.get("name") || ""));
  const body = encodeURIComponent(
    `${c.fieldName}: ${data.get("name")}\n${c.fieldCompany}: ${data.get("company")}\n${c.fieldEmail}: ${data.get("email")}\n${c.fieldPhone}: ${data.get("phone") || "—"}\n\n${data.get("message")}`
  );
  window.location.href = `mailto:info@nikiiman.com?subject=${subject}&body=${body}`;
  if (touchOk) touchOk.hidden = false;
}
function bindLateHome() {
  form = document.getElementById("briefForm");
  offices = document.getElementById("offices");
  pick = document.getElementById("pick");
  pickForm = document.getElementById("pickForm");
  touch = document.getElementById("touch");
  touchLocs = document.getElementById("touchLocs");
  touchForm = document.getElementById("touchForm");
  touchMessage = document.getElementById("touchMessage");
  touchCount = document.getElementById("touchCount");
  touchOk = document.getElementById("touchOk");
  if (form && !form.dataset.submitBound) {
    form.dataset.submitBound = "1";
    form.addEventListener("submit", goToContact);
  }
  if (pickForm && !pickForm.dataset.submitBound) {
    pickForm.dataset.submitBound = "1";
    pickForm.addEventListener("submit", goToContact);
  }
  if (touchMessage && !touchMessage.dataset.inputBound) {
    touchMessage.dataset.inputBound = "1";
    touchMessage.addEventListener("input", updateTouchCount);
  }
  if (touchForm && !touchForm.dataset.submitBound) {
    touchForm.dataset.submitBound = "1";
    touchForm.addEventListener("submit", onTouchSubmit);
  }
  fillOffices();
  wireSocial();
  fillNeedUI();
  fillTouchLocs();
  updateTouchCount();
  const ending = document.querySelector("[data-home-ending]");
  if (ending) maskHeadings(ending);
  wireReveal();
  wireMagnetic();
  wireFooterWord.tick?.();
}
if (form && !form.dataset.submitBound) {
  form.dataset.submitBound = "1";
  form.addEventListener("submit", goToContact);
}
if (pickForm && !pickForm.dataset.submitBound) {
  pickForm.dataset.submitBound = "1";
  pickForm.addEventListener("submit", goToContact);
}
