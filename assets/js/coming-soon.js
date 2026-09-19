(() => {
  /* Same greeting cycle as portfolio, with Merhaba in the opening */
  const GREETINGS = [
    ["Hello", ""],
    ["Bonjour", ""],
    ["स्वागत हे", ""],
    ["Ciao", ""],
    ["Olá", ""],
    ["おい", "jap"],
    ["Hallå", ""],
    ["Guten tag", ""],
    ["سلام", ""],
    ["Merhaba", ""],
    ["Hallo", "last"],
  ];

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const curveH = window.innerWidth > 540 ? "10vh" : "5vh";
  const WORD_HOLD = 0.16;
  const riseHome = window.innerWidth > 540 ? "50vh" : "12vh";

  const wordHtml = (text, extra) =>
    `<h2 class="${extra}" data-word="${text}">${text}<div class="dot"></div></h2>`;

  const mountLoader = () => {
    document.querySelectorAll("[data-loader]").forEach((el) => el.remove());
    const greet = GREETINGS.map(([text, kind], i) => {
      let cls = "home-active";
      if (i === 0) cls += " home-active-first";
      if (kind === "last") cls += " home-active-last";
      if (kind === "jap") cls += " jap";
      return wordHtml(text, cls);
    }).join("");
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="loading-container" data-loader>
        <div class="loading-screen" data-screen>
          <div class="rounded-div-wrap top"><div class="rounded-div"></div></div>
          <div class="loading-words" data-words>${greet}</div>
          <div class="rounded-div-wrap bottom"><div class="rounded-div"></div></div>
        </div>
      </div>`
    );
  };

  const hideAllWords = () => {
    document.querySelectorAll(".loading-words h2").forEach((el) => {
      el.classList.remove("is-show");
      el.style.opacity = "0";
      el.style.display = "none";
    });
  };

  const greetings = () => Array.from(document.querySelectorAll(".home-active"));

  const showOnly = (el) => {
    hideAllWords();
    if (!el) return;
    el.classList.add("is-show");
    el.style.display = "block";
    el.style.opacity = "1";
  };

  const addHelloCycle = (tl, holdLast = 0.28) => {
    const words = greetings();
    words.forEach((el, i) => {
      const hold = i < words.length - 1 ? WORD_HOLD : holdLast;
      tl.call(() => showOnly(el));
      tl.to(el, { duration: hold, opacity: 1, ease: "none" });
    });
  };

  const incomingEls = () => Array.from(document.querySelectorAll(".once-in"));

  const parkScreen = (yPercent) => {
    const screen = document.querySelector("[data-screen]");
    if (screen) gsap.set(screen, { yPercent, top: 0, force3D: true });
  };

  const finishAway = (snap = true) => {
    const screen = document.querySelector("[data-screen]");
    const loader = document.querySelector("[data-loader]");
    if (snap && screen && window.gsap) parkScreen(-100);
    else if (screen) screen.style.transform = "translate3d(0,-100%,0)";
    if (loader) loader.classList.add("is-away");
    document.documentElement.classList.remove("is-waiting");
    document.documentElement.classList.add("is-ready", "is-booted");
    document.body.classList.remove("is-loading");
  };

  const playHomeLoader = () => {
    const screen = document.querySelector("[data-screen]");
    const words = document.querySelector("[data-words]");
    const bottom = document.querySelector(".rounded-div-wrap.bottom");
    const incoming = incomingEls();
    if (!window.gsap || !screen) return finishAway(true);

    document.documentElement.classList.add("is-waiting");
    document.body.classList.add("is-loading");
    hideAllWords();

    parkScreen(0);
    gsap.set(words, { opacity: 0, y: -50 });
    gsap.set(bottom, { height: curveH });
    if (incoming.length) gsap.set(incoming, { y: riseHome, force3D: true });
    showOnly(document.querySelector(".home-active-first"));

    if (reduce) {
      parkScreen(-100);
      if (incoming.length) gsap.set(incoming, { y: 0, clearProps: "transform" });
      finishAway(true);
      return;
    }

    let wiped = false;
    const playWipeOut = () => {
      if (wiped) return;
      wiped = true;
      gsap.killTweensOf(screen);
      gsap.set(screen, { yPercent: 0, top: 0 });
      gsap.to(words, { duration: 0.2, opacity: 0, ease: "none", overwrite: true });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          gsap.to(screen, {
            yPercent: -100,
            duration: 1.8,
            ease: "power4.inOut",
            force3D: true,
            overwrite: true,
          });
        });
      });
      if (incoming.length) {
        gsap.to(incoming, {
          duration: 1.8,
          y: 0,
          stagger: 0.07,
          ease: "expo.out",
          overwrite: true,
          clearProps: "transform",
        });
      }
      gsap.to(bottom, { duration: 0.6, height: "0vh", ease: "power4.inOut", delay: 1.1 });
      window.setTimeout(() => finishAway(false), 2000);
    };

    const tl = gsap.timeline({ onComplete: playWipeOut });
    tl.to(words, { duration: 0.5, opacity: 1, y: -50, ease: "power4.out", delay: 0.15 });
    addHelloCycle(tl, 0.4);
    window.setTimeout(playWipeOut, 3400);
  };

  /* Same motion as portfolio “Fatemeh Shahbazi” marquee */
  const nameScroll = () => {
    const track = document.querySelector("[data-big-name]");
    const heading = track?.querySelector("h1");
    if (!track || !heading) return;

    if (!reduce && window.gsap) {
      gsap.to(heading, {
        xPercent: -50,
        duration: 20,
        ease: "none",
        repeat: -1,
      });
    }
  };

  const boot = () => {
    mountLoader();
    document.documentElement.classList.add("is-booted");
    playHomeLoader();
    nameScroll();
    window.setTimeout(() => {
      if (!document.documentElement.classList.contains("is-ready")) finishAway(true);
    }, 7000);
  };

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    try {
      boot();
    } catch (_) {
      document.documentElement.classList.add("is-booted", "is-ready");
      document.body.classList.remove("is-loading");
    }
  };

  if (window.gsap) start();
  else {
    window.addEventListener("load", start);
    window.setTimeout(start, 1200);
  }
})();
