import { PROJECTS } from "./projects.js";
import { COPY, currentLang, nextLang } from "./i18n.js";
import { asset, page } from "./root.js";

const stage = document.getElementById("stage");
const heroStage = document.getElementById("heroStage");
const grid = document.getElementById("workGrid");
const caseEl = document.getElementById("case");
const casePhotos = document.getElementById("casePhotos");
const form = document.getElementById("briefForm");
const header = document.querySelector("[data-header]");
const menuToggle = document.getElementById("menu-toggle");
const themeToggle = document.querySelector("[data-theme-toggle]");
const langToggle = document.querySelector("[data-lang-toggle]");
const heroLabels = document.getElementById("heroLabels");
const stickyContent = document.getElementById("stickyContent");
const teamTrack = document.getElementById("teamTrack");
const offices = document.getElementById("offices");
const pick = document.getElementById("pick");
const pickForm = document.getElementById("pickForm");
const touch = document.getElementById("touch");
const touchLocs = document.getElementById("touchLocs");
const touchForm = document.getElementById("touchForm");
const touchMessage = document.getElementById("touchMessage");
const touchCount = document.getElementById("touchCount");
const touchOk = document.getElementById("touchOk");

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
  document.title = c.metaTitle;
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
}

const LABEL_ICONS = [
  '<svg viewBox="0 0 24 24" fill="none"><path d="M6 20V10a6 6 0 0 1 12 0v10" stroke="currentColor" stroke-width="1.6"/><path d="M10 20v-4.2a2 2 0 0 1 4 0V20" stroke="currentColor" stroke-width="1.6"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.1" stroke="currentColor" stroke-width="1.6"/><path d="M12 4.2v2M12 17.8v2M4.2 12h2M17.8 12h2M6.6 6.6l1.4 1.4M16 16l1.4 1.4M6.6 17.4l1.4-1.4M16 8l1.4-1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 4.4s-5.8 6.8-5.8 10.6a5.8 5.8 0 1 0 11.6 0c0-3.8-5.8-10.6-5.8-10.6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.1" stroke="currentColor" stroke-width="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.1" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.1" stroke="currentColor" stroke-width="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.1" stroke="currentColor" stroke-width="1.6"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 4 20 9.4 12 20 4 9.4 12 4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 9.4h16M12 4v16" stroke="currentColor" stroke-width="1.6"/></svg>',
];

function heroSlides() {
  const slides = [];
  PROJECTS.forEach((p) => {
    p.images.forEach((src) => slides.push({ id: p.id, src, title: p.title }));
  });
  return slides.slice(0, 12);
}

function fillLabels() {
  if (!heroLabels) return;
  const ids = PROJECTS.map((p) => p.id);
  heroLabels.innerHTML = t()
    .labels.map(
      (label, i) =>
        `<li><button type="button" data-hero-id="${ids[i] || ids[0]}" aria-label="${label}">
          <span class="hero__label-icon" aria-hidden="true">${LABEL_ICONS[i] || LABEL_ICONS[0]}</span>
          <span class="hero__label-text">${label}</span>
        </button></li>`
    )
    .join("");
}

function fillStage() {
  if (!stage) return;
  stage.innerHTML = heroSlides()
    .map(
      (s) =>
        `<a class="hero__card" href="${page("work/" + s.id + ".html")}" data-id="${s.id}" aria-label="${s.title}">
          <span class="hero__media"><img src="${asset(s.src)}" alt="${s.title}" /></span>
          <span class="hero__media hero__media--back" aria-hidden="true"><img src="${asset(s.src)}" alt="" /></span>
        </a>`
    )
    .join("");
}

function fillGrid() {
  if (!grid) return;
  const copy = t().work;
  grid.innerHTML = PROJECTS.map((p, i) => {
    const w = copy[p.id] || {};
    const pos = (i % 3) + 1;
    return `<li class="work__item reveal" data-pos="${pos}" style="--stagger:${Math.min(i, 3)}">
        <a href="${page("work/" + p.id + ".html")}" data-id="${p.id}">
          <span class="work__media">
            <span class="work__shift" data-parallax>
              <img src="${asset(p.images[0])}" alt="${p.title}" />
            </span>
          </span>
          <div class="work__body">
            <h3>${p.title}</h3>
            <span>${w.type || p.type}</span>
            <p>${w.blurb || p.lead}</p>
          </div>
        </a>
      </li>`;
  }).join("");
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

function fillOffices() {
  return;
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
  return;
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

function maskHeadings() {
  document.querySelectorAll("[data-mask]").forEach((el) => {
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

function tickParallax() {
  if (reducedMotion() || !parallaxEls.length) return;
  const view = window.innerHeight || 1;
  parallaxEls.forEach((el) => {
    const box = el.getBoundingClientRect();
    if (box.bottom < -80 || box.top > view + 80) return;
    const p = (box.top + box.height * 0.5 - view * 0.5) / view;
    el.style.transform = `translate3d(0, ${(p * 42).toFixed(2)}px, 0)`;
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
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    if (el.dataset.mag) return;
    el.dataset.mag = "1";
    el.addEventListener("pointermove", (e) => {
      const box = el.getBoundingClientRect();
      const x = ((e.clientX - box.left) / box.width - 0.5) * 18;
      const y = ((e.clientY - box.top) / box.height - 0.5) * 12;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

function initSmoothScroll() {
  if (initSmoothScroll.bound) return;
  initSmoothScroll.bound = true;
  if (reducedMotion()) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const html = document.documentElement;
  html.classList.add("is-smooth");

  let current = window.scrollY;
  let target = window.scrollY;
  let running = false;
  const ease = 0.1;

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
    target = Math.max(0, Math.min(maxY(), target + delta));
    if (!running) requestAnimationFrame(animate);
  }

  window.addEventListener(
    "wheel",
    (e) => {
      if (overlaysOpen() || e.ctrlKey) return;
      e.preventDefault();
      nudge(e.deltaY);
    },
    { passive: false }
  );

  window.addEventListener("keydown", (e) => {
    if (overlaysOpen()) return;
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
      if (!running) {
        current = window.scrollY;
        target = window.scrollY;
      }
    },
    { passive: true }
  );
}

function isShot() {
  return new URLSearchParams(location.search).has("shot");
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
  wireParallax();
  wireMagnetic();
  initSmoothScroll();
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

  /* Match Weichie HeroHomepage WebGL: square planes, radius 4.3/1.6, tilt -13° */
  const TILT = -13;
  const IDLE = 0.04;
  const RISE_DUR = 1450;
  const DRAG_BLEND = 0.38;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const PX_TO_RAD = coarse ? 0.0064 : 0.0038;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const shot = isShot();

  let radius = 420;
  let rotation = 0;
  let spin = reduced || shot ? 0 : IDLE;
  let dragging = false;
  let moved = false;
  let lastX = 0;
  let lastTick = performance.now();
  let lastPointer = performance.now();
  let animating = false;
  let animFrom = 0;
  let animTo = 0;
  let animStart = 0;
  let animDur = 0;
  let riseStart = 0;
  let rise = reduced || shot ? 0 : 1;

  function overlaysOpen() {
    const b = document.body;
    return b.classList.contains("is-pick") || b.classList.contains("is-touch") || b.classList.contains("is-case");
  }

  function layout() {
    const w = heroStage.clientWidth;
    const vh = heroStage.clientHeight || window.innerHeight;
    /* Weichie FOV frames the front plane at ~85% of stage height — match that */
    let cardW = Math.min(vh * 0.92, w * 0.5, 42 * 16);
    if (w < 1024) cardW = Math.min(vh * 0.88, w * 0.58, 32 * 16);
    if (w < 768) cardW = Math.min(vh * 0.82, w * 0.82, 24 * 16);
    const cardH = cardW;
    /* Tighter radius so large covers still show the side curve */
    const radiusRatio = w < 768 ? 1.95 : w < 1024 ? 2.1 : 2.25;
    radius = cardW * radiusRatio;
    const hero = heroStage.closest(".hero");
    if (hero) {
      hero.style.setProperty("--card-w", `${cardW}px`);
      hero.style.setProperty("--card-h", `${cardH}px`);
    }
    cards.forEach((el, i) => {
      el.dataset.base = String((i / n) * Math.PI * 2);
    });
  }

  function ringScale() {
    const w = heroStage.clientWidth;
    const vh = heroStage.clientHeight || window.innerHeight;
    const cardW = cards[0].offsetWidth || 400;
    const cardH = cards[0].offsetHeight || 400;
    const step = (2 * Math.PI) / n;
    const wrap = step * 0.9;
    const halfSpan = radius * Math.sin(wrap) + (cardW / 2) * Math.cos(wrap);
    /* Prefer Weichie-scale height; on narrow screens allow more side overflow */
    const fillY = (vh * 0.9) / Math.max(cardH, 1);
    const xBoost = w < 768 ? 1.55 : w < 1024 ? 1.4 : 1.25;
    const fillX = (w * xBoost) / Math.max(halfSpan * 2, 1);
    return Math.min(fillX, fillY, 2.2);
  }

  function shortest(from, to) {
    let d = to - from;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return from + d;
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
    const fill = ringScale();
    const tiltRad = (TILT * Math.PI) / 180;
    const y = radius * Math.sin(tiltRad);
    const lift = rise * Math.min(heroStage.clientHeight * 0.28, 280);
    stage.style.transform = `translate3d(0, ${y + lift}px, ${-radius * 0.98}px) rotateX(${TILT}deg) rotateY(${(rotation * 180) / Math.PI}deg) scale(${fill})`;
    cards.forEach((el) => {
      const facing = Math.cos(Number(el.dataset.base) + rotation);
      const fade = (facing + 1) / 2;
      el.style.transform = `rotateY(${(Number(el.dataset.base) * 180) / Math.PI}deg) translateZ(${radius}px)`;
      el.style.opacity = "";
      el.style.zIndex = String(Math.round((facing + 1) * 50));
      el.style.pointerEvents = facing > 0.22 ? "auto" : "none";
      const media = el.querySelectorAll(".hero__media");
      media.forEach((node) => {
        /* Weichie minOpacity: 0 — hide backs, keep front arc crisp */
        const opacity = facing > 0.08 ? Math.min(1, 0.15 + 0.85 * fade) : 0;
        node.style.opacity = String(opacity);
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

  function snapTo(index, duration) {
    const el = cards[(index + n) % n];
    if (!el) return;
    animFrom = rotation;
    animTo = shortest(rotation, -Number(el.dataset.base || 0));
    animStart = performance.now();
    animDur = duration || 1100;
    animating = true;
    spin = 0;
  }

  function goTo(id) {
    const i = cards.findIndex((card) => card.dataset.id === id);
    if (i < 0) return;
    snapTo(i, 900 + Math.min(Math.abs(shortest(rotation, -Number(cards[i].dataset.base)) - rotation) / (Math.PI * 2), 1) * 500);
  }

  function tick(now) {
    const dt = Math.min((now - lastTick) / 1000, 0.05);
    lastTick = now;

    if (!reduced && rise > 0 && document.documentElement.classList.contains("is-hero-cards")) {
      if (!riseStart) riseStart = now;
      const u = Math.min((now - riseStart) / RISE_DUR, 1);
      rise = (1 - u) ** 4;
      if (u >= 1) rise = 0;
    }

    if (animating) {
      const u = Math.min((now - animStart) / animDur, 1);
      const e = 1 - (1 - u) ** 3;
      rotation = animFrom + (animTo - animFrom) * e;
      if (u >= 1) {
        animating = false;
        rotation = animTo;
        spin = reduced ? 0 : IDLE;
      }
    } else if (dragging) {
      /* rotation updated in pointermove */
    } else if (!overlaysOpen() && !reduced) {
      if (Math.abs(spin - IDLE) > 0.012) {
        spin += (IDLE - spin) * Math.min(1, dt * 1.15);
      } else {
        spin = IDLE;
      }
      rotation += spin * dt;
    }

    paint();
    requestAnimationFrame(tick);
  }

  layout();
  paint();
  requestAnimationFrame(tick);
  window.addEventListener("resize", () => {
    layout();
    paint();
  });

  heroStage.addEventListener("pointerdown", (e) => {
    if (e.button && e.button !== 0) return;
    dragging = true;
    moved = false;
    animating = false;
    lastX = e.clientX;
    lastPointer = performance.now();
    spin = 0;
    heroStage.classList.add("is-drag");
    heroStage.setPointerCapture(e.pointerId);
  });
  heroStage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    if (Math.abs(dx) > 2) moved = true;
    const now = performance.now();
    const dt = Math.max((now - lastPointer) / 1000, 0.001);
    lastPointer = now;
    const dRot = dx * PX_TO_RAD;
    rotation += dRot;
    spin = spin * (1 - DRAG_BLEND) + (dRot / dt) * DRAG_BLEND;
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    heroStage.classList.remove("is-drag");
    if (reduced) {
      spin = 0;
      return;
    }
    if (Math.abs(spin) < IDLE) spin = IDLE;
  }
  heroStage.addEventListener("pointerup", endDrag);
  heroStage.addEventListener("pointercancel", endDrag);
  heroStage.addEventListener(
    "click",
    (e) => {
      if (moved) e.stopPropagation();
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

fillStage();
render();
spinRing();
wireNeed();

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

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (dark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  });
}

if (langToggle) {
  langToggle.addEventListener("click", () => {
    lang = nextLang(lang);
    localStorage.setItem("lang", lang);
    render();
  });
}

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

if (touchMessage) {
  touchMessage.addEventListener("input", updateTouchCount);
}

if (touchForm) {
  touchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(touchForm);
    const c = t();
    const subject = encodeURIComponent(c.touchSubject + " — " + (data.get("name") || ""));
    const body = encodeURIComponent(
      `${c.fieldName}: ${data.get("name")}\n${c.fieldCompany}: ${data.get("company")}\n${c.fieldEmail}: ${data.get("email")}\n${c.fieldPhone}: ${data.get("phone") || "—"}\n\n${data.get("message")}`
    );
    window.location.href = `mailto:studio@lumen-atelier.com?subject=${subject}&body=${body}`;
    if (touchOk) touchOk.hidden = false;
  });
}

syncHash();
window.addEventListener("popstate", syncHash);
function goToContact(e) {
  e.preventDefault();
  applyNeedsToMessage();
  openTouch();
}
if (form) form.addEventListener("submit", goToContact);
if (pickForm) pickForm.addEventListener("submit", goToContact);
