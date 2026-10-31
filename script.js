/* =========================================================
   script.js — interaksi utama website
   (isi/teks website diedit di config.js, bukan di sini)
   ========================================================= */
(() => {
  "use strict";

  const C = typeof CONFIG !== "undefined" ? CONFIG : {};

  /* ---------- Helper kecil ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduceMotion = () => motionQuery.matches;

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);

  // "2026-11-01T00:00:00" -> Date (waktu lokal, aman di semua browser)
  const parseLocalDate = (str) => {
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(String(str || "").trim());
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  };

  const formatDate = (date) =>
    date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const centerOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  // Jalankan setiap bagian secara terpisah, supaya satu error tidak merusak semuanya
  const safe = (name, fn) => {
    try { fn(); } catch (err) { console.warn(`[${name}]`, err); }
  };

  /* =========================================================
     FX — confetti, hearts & sparkles di satu canvas
     ========================================================= */
  const FX = (() => {
    const canvas = $("#fx-canvas");
    const ctx = canvas.getContext("2d");
    const heartPath = new Path2D("M12 21s-7.5-4.6-9.6-9.3C.9 8.3 2.9 4.5 6.6 4.5c2.1 0 3.5 1.2 4.4 2.5.9-1.3 2.3-2.5 4.4-2.5 3.7 0 5.7 3.8 4.2 7.2C19.5 16.4 12 21 12 21z");
    const sparklePath = new Path2D("M12 2c.6 6 4 9.4 10 10-6 .6-9.4 4-10 10-.6-6-4-9.4-10-10 6-.6 9.4-4 10-10z");
    const COLORS = ["#6B1839", "#F4A7C1", "#C77D98", "#E8CFA9", "#E98CAD", "#FFFFFF"];
    const SOFT = ["#F4A7C1", "#E98CAD", "#C77D98", "#E8CFA9"];

    let particles = [];
    let running = false;
    let last = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const add = (p) => {
      if (particles.length > 500) return;
      particles.push(Object.assign({ life: 0, rot: 0, vr: 0, drag: 1, g: 0, alpha: 1 }, p));
      if (!running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(loop);
      }
    };

    const draw = (p, t) => {
      const fade = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade * p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "heart" || p.shape === "sparkle") {
        const s = (p.size / 24) * (p.shape === "sparkle" ? 1 - t * 0.6 : 1);
        ctx.scale(s, s);
        ctx.translate(-12, -12);
        ctx.fill(p.shape === "heart" ? heartPath : sparklePath);
      } else {
        ctx.scale(1, Math.cos(p.life * p.flip));
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    };

    const loop = (now) => {
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        const t = p.life / p.maxLife;
        if (t >= 1 || p.y > h + 80) { particles.splice(i, 1); continue; }
        const drag = Math.pow(p.drag, dt * 60);
        p.vx *= drag;
        p.vy = p.vy * drag + p.g * dt;
        p.x += p.vx * dt + (p.sway ? Math.sin(p.life * 3 + p.seed) * p.sway * dt : 0);
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        draw(p, t);
      }

      if (particles.length) requestAnimationFrame(loop);
      else { running = false; ctx.clearRect(0, 0, w, h); }
    };

    // Ledakan confetti + hati dari satu titik
    const burst = (x, y, { count = 70, hearts = 0.4, power = 1 } = {}) => {
      const n = reduceMotion() ? Math.min(12, count) : count;
      for (let i = 0; i < n; i++) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(160, 480) * power;
        const isHeart = Math.random() < hearts;
        add({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - rand(120, 280) * power,
          g: 680,
          drag: 0.975,
          size: isHeart ? rand(12, 24) : rand(8, 13),
          shape: isHeart ? "heart" : "rect",
          color: pick(COLORS),
          rot: rand(0, Math.PI * 2),
          vr: rand(-7, 7),
          flip: rand(5, 12),
          maxLife: rand(1.8, 2.8)
        });
      }
    };

    // Hujan confetti dari atas layar
    const rain = (count = 120) => {
      const n = reduceMotion() ? Math.min(20, count) : count;
      for (let i = 0; i < n; i++) {
        const isHeart = Math.random() < 0.35;
        add({
          x: rand(0, w),
          y: rand(-h * 0.6, -20),
          vx: rand(-30, 30),
          vy: rand(80, 200),
          g: 60,
          sway: rand(20, 60),
          seed: rand(0, 6),
          size: isHeart ? rand(12, 22) : rand(8, 12),
          shape: isHeart ? "heart" : "rect",
          color: pick(COLORS),
          rot: rand(0, Math.PI * 2),
          vr: rand(-4, 4),
          flip: rand(4, 9),
          maxLife: rand(4.5, 6.5)
        });
      }
    };

    // Hati-hati kecil melayang ke atas
    const hearts = (x, y, count = 14) => {
      const n = reduceMotion() ? Math.min(5, count) : count;
      for (let i = 0; i < n; i++) {
        add({
          x: x + rand(-20, 20),
          y: y + rand(-10, 10),
          vx: rand(-90, 90),
          vy: rand(-260, -120),
          g: -30,
          drag: 0.97,
          sway: rand(10, 40),
          seed: rand(0, 6),
          size: rand(12, 24),
          shape: "heart",
          color: pick(SOFT.concat("#6B1839")),
          rot: rand(-0.4, 0.4),
          vr: rand(-1, 1),
          maxLife: rand(1.2, 1.9)
        });
      }
    };

    const sparkle = (x, y) => {
      add({
        x, y,
        vx: rand(-30, 30),
        vy: rand(-40, 10),
        g: 50,
        size: rand(8, 15),
        shape: "sparkle",
        color: pick(["#E8CFA9", "#F4A7C1", "#C77D98"]),
        vr: rand(-2, 2),
        maxLife: rand(0.6, 0.9)
      });
    };

    return { burst, rain, hearts, sparkle };
  })();

  /* =========================================================
     Fade-in saat di-scroll (IntersectionObserver)
     ========================================================= */
  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
    : null;

  const observeReveal = (el) => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add("is-visible");
  };

  /* =========================================================
     Musik latar
     ========================================================= */
  const Music = (() => {
    const audio = $("#bg-music");
    const toggle = $("#music-toggle");
    const cfg = C.music || {};
    const target = Math.min(1, Math.max(0, Number(cfg.volume ?? 0.25)));
    let available = Boolean(cfg.src);
    let fadeTimer = null;

    const setUI = (playing) => {
      toggle.classList.toggle("is-playing", playing);
      toggle.setAttribute("aria-pressed", String(playing));
      toggle.setAttribute("aria-label", playing ? "Jeda musik" : "Putar musik");
    };

    if (available) {
      audio.src = cfg.src;
      audio.volume = target;
      $("#music-label").textContent = cfg.title || "our song";
      audio.addEventListener("error", () => {
        available = false;
        toggle.hidden = true;
        console.warn("Musik tidak ditemukan:", cfg.src);
      });
      audio.addEventListener("play", () => setUI(true));
      audio.addEventListener("pause", () => setUI(false));
    }

    // Volume naik pelan-pelan supaya tidak kaget
    const fadeIn = () => {
      clearInterval(fadeTimer);
      audio.volume = 0;
      fadeTimer = setInterval(() => {
        audio.volume = Math.min(target, audio.volume + target / 20);
        if (audio.volume >= target) clearInterval(fadeTimer);
      }, 100);
    };

    const play = (withFade = false) => {
      if (!available) return;
      if (withFade) fadeIn();
      const p = audio.play();
      if (p && p.catch) p.catch(() => setUI(false));
    };

    const pause = () => {
      if (!available) return;
      audio.pause();
    };

    toggle.addEventListener("click", () => (audio.paused ? play() : pause()));

    return {
      start: () => play(true),
      play,
      pause,
      showToggle: () => { if (available) toggle.hidden = false; },
      get available() { return available; },
      get playing() { return available && !audio.paused; }
    };
  })();

  /* =========================================================
     A. Opening
     ========================================================= */
  const initOpening = () => {
    const opening = $("#opening");
    const btn = $("#open-btn");
    const envelope = $("#envelope");
    const site = $("#site");

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    if (Music.available) $("#opening-hint").hidden = false;

    btn.addEventListener("click", () => {
      btn.disabled = true;
      Music.start();
      envelope.classList.add("is-open");

      const fast = reduceMotion();
      setTimeout(() => {
        const r = envelope.getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + r.height * 0.15, { count: 90, hearts: 0.45 });
      }, fast ? 0 : 1000);

      setTimeout(() => {
        opening.classList.add("is-leaving");
        document.body.classList.remove("is-locked");
        document.body.classList.add("is-revealed");
        site.removeAttribute("inert");
        Music.showToggle();
      }, fast ? 250 : 2300);

      setTimeout(() => {
        opening.remove();
        FX.rain(60);
      }, fast ? 500 : 3300);
    });
  };

  /* =========================================================
     Background: hati & sparkle melayang pelan
     ========================================================= */
  const initAmbient = () => {
    if (reduceMotion()) return;
    const box = $("#ambient");
    const total = window.innerWidth < 600 ? 9 : 15;
    const colors = ["#F4A7C1", "#E8CFA9", "#C77D98", "#F4A7C1"];

    for (let i = 0; i < total; i++) {
      const el = document.createElement("span");
      const size = rand(10, 22);
      el.className = "ambient__item";
      el.innerHTML = `<svg viewBox="0 0 24 24"><use href="#${Math.random() < 0.7 ? "i-heart" : "i-sparkle"}"/></svg>`;
      el.style.cssText = `
        left:${rand(0, 100)}%;
        width:${size}px; height:${size}px;
        color:${pick(colors)};
        animation-duration:${rand(18, 34)}s;
        animation-delay:${-rand(0, 34)}s;
        --drift:${rand(-40, 40)}px;
        --o:${rand(0.22, 0.5)};
      `;
      box.appendChild(el);
    }
  };

  /* =========================================================
     Scroll: progress ribbon + parallax lembut
     ========================================================= */
  const initScrollEffects = () => {
    const bar = $("#progress");
    const layers = reduceMotion() ? [] : $$("[data-parallax]");
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (y < window.innerHeight * 1.3) {
        layers.forEach((el) => {
          el.style.translate = `0 ${(y * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
        });
      }
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  };

  /* Sparkle kecil mengikuti kursor (hanya desktop) */
  const initCursorSparkles = () => {
    if (reduceMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let lastTime = 0;
    window.addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - lastTime < 55) return;
      lastTime = now;
      FX.sparkle(e.clientX + rand(-6, 6), e.clientY + rand(-6, 6));
    }, { passive: true });
  };

  /* =========================================================
     B. Hero: ketuk foto = hati + gelembung kata
     ========================================================= */
  const initHero = () => {
    const frame = $("#hero-frame");
    const bubble = $("#hero-bubble");
    const lines = [
      "hey, that's my favorite person ♡",
      "cantik banget sih",
      "ok stop, aku salting",
      "birthday girl detected!",
      "ketuk lagi, aku ga keberatan"
    ];
    let i = 0;
    let hideTimer = null;

    frame.addEventListener("click", (e) => {
      const x = e.clientX || centerOf(frame).x;
      const y = e.clientY || centerOf(frame).y;
      FX.hearts(x, y, 12);
      bubble.textContent = lines[i++ % lines.length];
      bubble.classList.add("is-on");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => bubble.classList.remove("is-on"), 1800);
    });
  };

  /* =========================================================
     C. Countdown
     ========================================================= */
  const initCountdown = () => {
    const target = parseLocalDate(C.birthday);
    const timer = $("#cd-timer");
    const celebrate = $("#cd-celebrate");
    const title = $("#cd-celebrate-title");
    const text = $("#cd-celebrate-text");
    const dateEl = $("#cd-date");
    const card = $(".countdown__card");
    const nums = {
      d: $("#cd-days"), h: $("#cd-hours"), m: $("#cd-minutes"), s: $("#cd-seconds")
    };
    const DAY = 86400000;
    let mode = null;
    let celebrated = false;

    const showCelebration = (newMode, msSince) => {
      timer.hidden = true;
      celebrate.hidden = false;
      if (newMode === "today") {
        title.textContent = "It's your birthday!! 🎂";
        text.textContent = "Hari ini dunia resmi merayakan kamu. Selamat 21 tahun, sayang. Hari ini kamu bebas minta apa aja (dalam batas wajar, ya).";
      } else {
        const days = Math.max(1, Math.floor(msSince / DAY));
        title.textContent = "21 looks so good on you";
        text.textContent = `Udah ${days} hari kamu jadi 21 tahun, dan aku masih belum selesai merayakan kamu.`;
      }
      if (target) dateEl.textContent = `${formatDate(target)} ♡`;
    };

    if (!target) {
      // Tanggal tidak valid -> tetap tampil cantik, tanpa angka error
      showCelebration("today", 0);
      dateEl.textContent = "";
      console.warn("Format CONFIG.birthday tidak valid. Contoh: 2026-11-01T00:00:00");
      return;
    }

    dateEl.textContent = `menuju ${formatDate(target)} ♡`;

    const setNum = (el, value) => {
      const str = String(value).padStart(2, "0");
      if (el.textContent === str) return;
      el.textContent = str;
      el.classList.remove("tick");
      void el.offsetWidth; // restart animasi
      el.classList.add("tick");
    };

    const celebrateNow = () => {
      if (celebrated) return;
      celebrated = true;
      const c = centerOf(card);
      FX.burst(c.x, c.y, { count: 80, hearts: 0.5 });
    };

    const render = () => {
      const diff = target.getTime() - Date.now();
      if (diff > 0) {
        mode = "count";
        setNum(nums.d, Math.floor(diff / DAY));
        setNum(nums.h, Math.floor((diff % DAY) / 3600000));
        setNum(nums.m, Math.floor((diff % 3600000) / 60000));
        setNum(nums.s, Math.floor((diff % 60000) / 1000));
        return;
      }
      const newMode = -diff < DAY ? "today" : "after";
      if (newMode !== mode) {
        const justHappened = mode === "count";
        mode = newMode;
        showCelebration(mode, -diff);
        if (justHappened) { celebrated = false; celebrateNow(); FX.rain(140); }
      }
    };

    render();
    setInterval(render, 1000);

    // Confetti saat kartu terlihat dalam mode perayaan
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && mode !== "count") {
          setTimeout(celebrateNow, 400);
          io.disconnect();
        }
      }, { threshold: 0.5 });
      io.observe(card);
    }
  };

  /* =========================================================
     Lightbox foto
     ========================================================= */
  const Lightbox = (() => {
    const box = $("#lightbox");
    const img = $("#lb-img");
    const caption = $("#lb-caption");
    const counter = $("#lb-count");
    const prevBtn = $("#lb-prev");
    const nextBtn = $("#lb-next");
    let list = [];
    let index = 0;
    let opener = null;
    let startX = null;

    const preload = (i) => {
      const item = list[(i + list.length) % list.length];
      if (item) { const im = new Image(); im.src = item.src; }
    };

    const show = (i) => {
      index = (i + list.length) % list.length;
      const item = list[index];
      img.classList.add("is-swapping");

      const apply = () => {
        img.src = item.src;
        img.alt = item.alt || item.caption || "Foto";
        caption.textContent = item.caption || "";
        counter.textContent = `${index + 1} / ${list.length}`;
        requestAnimationFrame(() => img.classList.remove("is-swapping"));
      };

      const loader = new Image();
      loader.onload = apply;
      loader.onerror = apply;
      loader.src = item.src;
      if (loader.complete) { loader.onload = null; apply(); }

      preload(index + 1);
      preload(index - 1);
    };

    const open = (items, i, from) => {
      list = items;
      opener = from || null;
      const multiple = list.length > 1;
      prevBtn.hidden = !multiple;
      nextBtn.hidden = !multiple;
      box.hidden = false;
      document.body.classList.add("is-locked");
      show(i);
      $("#lb-close").focus({ preventScroll: true });
    };

    const close = () => {
      if (box.hidden) return;
      box.hidden = true;
      document.body.classList.remove("is-locked");
      if (opener) opener.focus({ preventScroll: true });
    };

    $("#lb-close").addEventListener("click", close);
    prevBtn.addEventListener("click", () => show(index - 1));
    nextBtn.addEventListener("click", () => show(index + 1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });

    // Swipe kiri/kanan di HP
    box.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      startX = e.clientX;
    });
    box.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50 && list.length > 1) show(index + (dx < 0 ? 1 : -1));
    });

    document.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "ArrowLeft") show(index - 1);
    });

    return { open, close };
  })();

  /* =========================================================
     D. Galeri — "A collection of you"
     ========================================================= */
  const initGallery = () => {
    const grid = $("#gallery-grid");
    const items = (C.gallery || []).filter((it) => it && it.src);

    // Justified rows: foto disusun kiri ke kanan sesuai urutan di config.js,
    // tiap baris setinggi sama dan pas selebar layar, tanpa memotong foto.
    const layout = () => {
      const width = grid.clientWidth;
      if (!width) return;
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 12;
      const target = width < 600 ? 250 : width < 1000 ? 280 : 340;
      const fit = (count, ratios) => (width - gap * (count - 1)) / ratios;
      const place = (row, height) => row.forEach((el) => {
        el.style.width = `${Math.floor(el.ratio * height * 100) / 100}px`;
        el.style.height = `${Math.floor(height * 100) / 100}px`;
      });
      let row = [];
      let ratioSum = 0;
      $$(".g-item", grid).filter((el) => !el.hidden).forEach((el) => {
        row.push(el);
        ratioSum += el.ratio;
        if (ratioSum * target + gap * (row.length - 1) < width) return;
        // Baris penuh: pilih mau menyertakan foto ini atau tidak, mana yang tingginya lebih dekat ke target
        const withIt = fit(row.length, ratioSum);
        const without = row.length > 1 ? fit(row.length - 1, ratioSum - el.ratio) : Infinity;
        if (Math.abs(without - target) < Math.abs(withIt - target)) {
          row.pop();
          place(row, without);
          row = [el];
          ratioSum = el.ratio;
        } else {
          place(row, withIt);
          row = [];
          ratioSum = 0;
        }
      });
      // baris terakhir tidak ditarik melebar, cukup ditengahkan
      if (row.length) place(row, Math.min(target, (width - gap * (row.length - 1)) / ratioSum));
    };

    items.forEach((item, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "g-item";
      if (i % 4 === 1) btn.classList.add("g-item--framed", "g-item--tape");
      const hasBow = i % 5 === 3;

      btn.setAttribute("aria-label", `Lihat foto ${i + 1}${item.caption ? ": " + item.caption : ""}`);
      btn.innerHTML = `
        <img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.alt || item.caption || "Foto Khansa")}" loading="lazy" decoding="async">
        ${item.caption ? `<span class="g-item__cap">${escapeHTML(item.caption)}</span>` : ""}
        ${hasBow ? `<svg class="g-item__bow" aria-hidden="true" viewBox="0 0 100 72"><use href="#i-bow"/></svg>` : ""}
      `;
      const img = btn.querySelector("img");
      btn.ratio = 3 / 4; // sementara, diganti rasio asli saat foto selesai dimuat
      img.addEventListener("error", () => { btn.hidden = true; layout(); });
      img.addEventListener("load", () => {
        if (img.naturalWidth) btn.ratio = img.naturalWidth / img.naturalHeight;
        layout();
      });
      btn.setAttribute("data-reveal", "");
      btn.style.setProperty("--d", `${(i % 3) * 0.08}s`);
      btn.addEventListener("click", () => Lightbox.open(items, i, btn));
      grid.appendChild(btn);
      observeReveal(btn);
    });

    layout();
    let lastWidth = grid.clientWidth;
    const relayout = () => {
      if (grid.clientWidth === lastWidth) return;
      lastWidth = grid.clientWidth;
      layout();
    };
    if ("ResizeObserver" in window) new ResizeObserver(() => requestAnimationFrame(relayout)).observe(grid);
    else window.addEventListener("resize", relayout);
  };

  /* =========================================================
     E. Foto bersama — polaroid scrapbook
     ========================================================= */
  const initMemories = () => {
    const wall = $("#polaroid-wall");
    const items = (C.memories || []).filter((it) => it && it.src);
    const tilts = [-4, 3, -2, 5, -3, 2, -5, 4, -1.5, 3.5];

    items.forEach((item, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "memory";
      btn.style.setProperty("--tilt", `${tilts[i % tilts.length]}deg`);
      btn.style.setProperty("--tape", `${i % 2 ? 4 : -3}deg`);
      btn.style.setProperty("--d", `${(i % 4) * 0.08}s`);
      btn.setAttribute("aria-label", `Lihat foto kita ${i + 1}${item.caption ? ": " + item.caption : ""}`);
      btn.innerHTML = `
        <figure class="polaroid">
          <div class="polaroid__photo">
            <img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.alt || "Foto kita berdua")}" loading="lazy" decoding="async">
            ${item.date ? `<span class="polaroid__date">${escapeHTML(item.date)}</span>` : ""}
          </div>
          <figcaption class="polaroid__caption">${escapeHTML(item.caption || "")}</figcaption>
        </figure>
      `;
      btn.querySelector("img").addEventListener("error", () => { btn.hidden = true; });
      btn.setAttribute("data-reveal", "");
      btn.addEventListener("click", () => Lightbox.open(items, i, btn));
      wall.appendChild(btn);
      observeReveal(btn);
    });
  };

  /* =========================================================
     F. Video
     ========================================================= */
  const initVideos = () => {
    const videos = (C.videos || []).filter((v) => v && v.src);
    if (!videos.length) return; // section tetap tersembunyi

    const section = $("#videos");
    const grid = $("#video-grid");
    const modal = $("#video-modal");
    const player = $("#vm-player");
    const titleEl = $("#vm-title");
    let opener = null;
    let resumeMusic = false;

    section.hidden = false;

    const open = (video, from) => {
      opener = from;
      resumeMusic = Music.playing;
      Music.pause();
      player.poster = video.poster || "";
      player.src = video.src;
      titleEl.textContent = video.title || "";
      modal.hidden = false;
      document.body.classList.add("is-locked");
      $("#vm-close").focus({ preventScroll: true });
      // Diputar karena user sendiri yang menekan tombol play
      const p = player.play();
      if (p && p.catch) p.catch(() => {});
    };

    const close = () => {
      if (modal.hidden) return;
      player.pause();
      player.removeAttribute("src");
      player.load();
      modal.hidden = true;
      document.body.classList.remove("is-locked");
      if (resumeMusic) Music.play();
      if (opener) opener.focus({ preventScroll: true });
    };

    videos.forEach((video, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "video-card";
      card.setAttribute("aria-label", `Putar video ${video.title || i + 1}`);
      const thumb = video.poster
        ? `<img class="video-card__thumb" src="${escapeHTML(video.poster)}" alt="" loading="lazy" decoding="async">`
        : `<video class="video-card__thumb" src="${escapeHTML(video.src)}#t=0.1" preload="metadata" muted playsinline tabindex="-1" aria-hidden="true"></video>`;
      card.innerHTML = `
        ${thumb}
        <span class="video-card__play"><svg viewBox="0 0 24 24"><use href="#i-play"/></svg></span>
        ${video.title ? `<span class="video-card__title">${escapeHTML(video.title)}</span>` : ""}
      `;
      card.setAttribute("data-reveal", "");
      card.style.setProperty("--d", `${(i % 3) * 0.1}s`);
      card.addEventListener("click", () => open(video, card));
      grid.appendChild(card);
      observeReveal(card);
    });

    $("#vm-close").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  };

  /* =========================================================
     G. Surat cinta
     ========================================================= */
  const initLetter = () => {
    const L = C.letter || {};
    const closed = $("#letter-closed");
    const btn = $("#letter-btn");
    const paper = $("#letter-paper");
    const greetingEl = $("#letter-greeting");
    const body = $("#letter-body");
    const timers = [];
    let done = false;

    const target = parseLocalDate(C.birthday);
    $("#letter-date").textContent = formatDate(target || new Date());

    (L.paragraphs || []).forEach((text) => {
      const p = document.createElement("p");
      p.className = "reveal-line";
      p.textContent = text;
      body.appendChild(p);
    });
    [["#letter-closing", L.closing], ["#letter-signoff", L.signoff], ["#letter-sign", L.signature]].forEach(([sel, text]) => {
      const el = $(sel);
      el.textContent = text || "";
      el.classList.add("reveal-line");
    });
    $(".letter-paper__hearts").classList.add("reveal-line");

    const lines = $$(".reveal-line", paper);
    const greeting = L.greeting || "";

    const finish = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      greetingEl.textContent = greeting;
      greetingEl.classList.remove("is-typing");
      lines.forEach((el) => el.classList.add("is-shown"));
      paper.classList.add("is-done");
      const sign = $("#letter-sign").getBoundingClientRect();
      if (sign.top < window.innerHeight && sign.bottom > 0) FX.hearts(sign.left + 60, sign.top, 12);
    };

    const write = () => {
      if (reduceMotion()) { finish(); return; }

      // 1) Sapaan diketik huruf per huruf
      greetingEl.textContent = "";
      greetingEl.classList.add("is-typing");
      let delay = 500;
      [...greeting].forEach((ch, i) => {
        timers.push(setTimeout(() => { greetingEl.textContent = greeting.slice(0, i + 1); }, delay));
        delay += 60;
      });
      timers.push(setTimeout(() => greetingEl.classList.remove("is-typing"), delay + 300));

      // 2) Paragraf muncul satu per satu (lebih lama untuk paragraf panjang)
      delay += 500;
      lines.forEach((el) => {
        timers.push(setTimeout(() => el.classList.add("is-shown"), delay));
        delay += Math.min(2600, 700 + el.textContent.length * 9);
      });
      timers.push(setTimeout(finish, delay));
    };

    btn.addEventListener("click", () => {
      btn.disabled = true;
      closed.classList.add("is-leaving");
      setTimeout(() => {
        closed.hidden = true;
        paper.hidden = false;
        const top = paper.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: reduceMotion() ? "auto" : "smooth" });
        const c = centerOf(paper);
        FX.hearts(c.x, Math.min(c.y, window.innerHeight * 0.4), 16);
        write();
      }, reduceMotion() ? 0 : 550);
    });

    // Ketuk surat untuk langsung menampilkan semuanya
    paper.addEventListener("click", finish);
  };

  /* =========================================================
     Secret surprise
     ========================================================= */
  const initSurprise = () => {
    const S = C.surprise || {};
    const gift = $("#gift-btn");
    const hint = $("#gift-hint");
    const stage = $("#surprise-stage");
    const reveal = $("#surprise-reveal");
    const hints = (S.hints && S.hints.length) ? S.hints : ["there's one more thing..."];
    let taps = 0;

    hint.textContent = hints[0];
    $("#surprise-message-title").textContent = S.title || "";
    $("#surprise-final").textContent = S.finalLine || "";
    $("#surprise-photo-caption").textContent = S.photoCaption || "";
    const bodyEl = $("#surprise-body");
    (S.paragraphs || []).forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      bodyEl.appendChild(p);
    });

    const photo = $("#surprise-photo");
    const figure = photo.closest("figure");
    if (S.photo) {
      photo.addEventListener("error", () => { figure.hidden = true; });
    } else {
      figure.hidden = true;
    }

    const open = () => {
      gift.disabled = true;
      gift.classList.add("is-open");
      hint.textContent = "";
      if (S.photo) photo.src = S.photo;

      const c = centerOf(gift);
      FX.burst(c.x, c.y, { count: 140, hearts: 0.55, power: 1.2 });
      FX.hearts(c.x, c.y, 20);

      const fast = reduceMotion();
      setTimeout(() => stage.classList.add("is-gone"), fast ? 0 : 900);
      setTimeout(() => {
        stage.hidden = true;
        reveal.hidden = false;
        FX.rain(170);
        const top = reveal.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: fast ? "auto" : "smooth" });
      }, fast ? 0 : 1500);
    };

    gift.addEventListener("click", () => {
      taps += 1;
      if (taps < hints.length) {
        hint.textContent = hints[taps];
        gift.classList.remove("shake-1", "shake-2");
        void gift.offsetWidth;
        gift.classList.add(taps === 1 ? "shake-1" : "shake-2");
        const c = centerOf(gift);
        for (let i = 0; i < 6; i++) FX.sparkle(c.x + rand(-70, 70), c.y + rand(-80, 40));
        return;
      }
      open();
    });

    $("#more-hearts").addEventListener("click", (e) => {
      const c = centerOf(e.currentTarget);
      FX.burst(c.x, c.y, { count: 60, hearts: 0.8 });
      FX.hearts(c.x, c.y, 14);
    });
  };

  /* ---------- Footer ---------- */
  const initFooter = () => {
    const target = parseLocalDate(C.birthday);
    $("#footer-year").textContent = String((target || new Date()).getFullYear());
  };

  /* =========================================================
     Mulai!
     ========================================================= */
  // Dipakai juga oleh games.js
  window.KH = { FX, escapeHTML, reduceMotion, observeReveal, rand, pick };

  safe("reveal", () => $$("[data-reveal]").forEach(observeReveal));
  safe("opening", initOpening);
  safe("ambient", initAmbient);
  safe("scroll", initScrollEffects);
  safe("cursor", initCursorSparkles);
  safe("hero", initHero);
  safe("countdown", initCountdown);
  safe("gallery", initGallery);
  safe("memories", initMemories);
  safe("videos", initVideos);
  safe("letter", initLetter);
  safe("surprise", initSurprise);
  safe("footer", initFooter);
})();
