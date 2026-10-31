/* =========================================================
   games.js — 3 mini games
   (pertanyaan & teks game diedit di config.js)
   ========================================================= */
(() => {
  "use strict";

  const C = typeof CONFIG !== "undefined" ? CONFIG : {};
  const KH = window.KH;
  if (!KH) return;

  const { FX, escapeHTML: esc, reduceMotion, rand, pick } = KH;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const centerOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  // Ambil pesan hasil berdasarkan skor (results diurutkan dari min terbesar)
  const resultFor = (results, score) =>
    [...(results || [])].sort((a, b) => b.min - a.min).find((r) => score >= r.min) ||
    { title: "Yay!", text: "" };

  /* =========================================================
     GAME 1 — Our Little Love Quiz
     ========================================================= */
  const LoveQuiz = (root, data = {}) => {
    const questions = data.questions || [];
    const total = questions.length;
    const yayPool = ["Yay, bener! ♡", "Pinter banget pacarku.", "Benar! Kamu kenal aku banget."];
    const oopsPool = ["Ehe, salah. Tapi tetap aku sayang.", "Hmm, bukan itu sayang.", "Salah, tapi lucu."];
    let index = 0;
    let score = 0;
    let answered = false;

    const intro = () => {
      root.innerHTML = `
        <div class="game-screen">
          <div class="game-screen__icon"><svg viewBox="0 0 24 24"><use href="#i-heart"/></svg></div>
          <h3 class="game-screen__title">${esc(data.title || "Love Quiz")}</h3>
          <p class="game-screen__text">${esc(data.intro || "")}</p>
          <div class="game-screen__actions">
            <button class="btn btn--primary" type="button" data-act="start">Mulai quiz</button>
          </div>
        </div>`;
    };

    const question = () => {
      const q = questions[index];
      answered = false;
      root.innerHTML = `
        <div class="quiz">
          <div class="quiz__top">
            <span>Pertanyaan ${index + 1} dari ${total}</span>
            <span>♡ ${score}</span>
          </div>
          <div class="quiz__progress"><span class="quiz__progress-fill" style="width:${(index / total) * 100}%"></span></div>
          <p class="quiz__q">${esc(q.q)}</p>
          <ul class="quiz__options">
            ${(q.options || []).map((opt, i) => `
              <li>
                <button class="quiz__opt" type="button" data-act="answer" data-i="${i}">
                  <span class="quiz__letter">${"ABCDEF"[i] || i + 1}</span>
                  <span>${esc(opt)}</span>
                </button>
              </li>`).join("")}
          </ul>
          <div class="quiz__slot" aria-live="polite"></div>
        </div>`;
    };

    const answer = (btn) => {
      if (answered) return;
      answered = true;
      const q = questions[index];
      const chosen = Number(btn.dataset.i);
      // answer bisa berupa angka, daftar angka [0, 2], atau "all" (semua benar)
      const isRight = (i) =>
        q.answer === "all" || (Array.isArray(q.answer) ? q.answer.includes(i) : i === q.answer);
      const correct = isRight(chosen);
      const buttons = $$(".quiz__opt", root);

      buttons.forEach((b, i) => {
        b.disabled = true;
        if (isRight(i)) b.classList.add("is-correct");
        else if (i === chosen) b.classList.add("is-wrong");
        else b.classList.add("is-dim");
      });

      if (correct) {
        score += 1;
        const c = centerOf(btn);
        FX.hearts(c.x, c.y, 10);
      }

      $(".quiz__progress-fill", root).style.width = `${((index + 1) / total) * 100}%`;
      $(".quiz__top span:last-child", root).textContent = `♡ ${score}`;

      const isLast = index === total - 1;
      $(".quiz__slot", root).innerHTML = `
        <div class="quiz__feedback ${correct ? "quiz__feedback--yay" : ""}">
          <span class="quiz__feedback-emoji" aria-hidden="true">${correct ? "💗" : "🙈"}</span>
          <span>${esc(correct ? (q.yay || pick(yayPool)) : (q.oops || pick(oopsPool)))}</span>
        </div>
        <div class="quiz__next">
          <button class="btn btn--primary" type="button" data-act="next">${isLast ? "Lihat hasil ♡" : "Lanjut →"}</button>
        </div>`;
      $("[data-act='next']", root).focus({ preventScroll: true });
    };

    const result = () => {
      const r = resultFor(data.results, score);
      const percent = total ? Math.round((score / total) * 100) : 0;
      root.innerHTML = `
        <div class="game-screen">
          <div class="score-ring" style="--p:${percent}"><span>${score}<small>/${total}</small></span></div>
          <h3 class="game-screen__title">${esc(r.title)}</h3>
          <p class="game-screen__text">${esc(r.text)}</p>
          <div class="game-screen__actions">
            <button class="btn btn--ghost" type="button" data-act="start">Main lagi</button>
          </div>
        </div>`;
      const c = centerOf($(".score-ring", root));
      if (percent >= 70) FX.burst(c.x, c.y, { count: 80, hearts: 0.5 });
      else FX.hearts(c.x, c.y, 14);
    };

    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === "start") { index = 0; score = 0; question(); }
      else if (act === "answer") answer(btn);
      else if (act === "next") {
        index += 1;
        if (index < total) question(); else result();
      }
    });

    if (total) intro();
    else root.innerHTML = `<p class="game-screen__text">Belum ada pertanyaan di config.js</p>`;
  };

  /* =========================================================
     GAME 2 — Catch the Hearts
     ========================================================= */
  const CatchGame = (data = {}) => {
    const stage = $("#catch-stage");
    const canvas = $("#catch-canvas");
    const overlay = $("#catch-overlay");
    const scoreEl = $("#catch-score");
    const timeEl = $("#catch-time");
    const bestEl = $("#catch-best");
    const ctx = canvas.getContext("2d");
    const heartPath = new Path2D("M12 21s-7.5-4.6-9.6-9.3C.9 8.3 2.9 4.5 6.6 4.5c2.1 0 3.5 1.2 4.4 2.5.9-1.3 2.3-2.5 4.4-2.5 3.7 0 5.7 3.8 4.2 7.2C19.5 16.4 12 21 12 21z");
    const DURATION = clamp(Number(data.duration) || 25, 10, 60);
    const BEST_KEY = "khansa-catch-best";
    const HEART_COLORS = ["#F4A7C1", "#E98CAD", "#C77D98", "#6B1839"];

    let W = 0;
    let H = 0;
    let state = "idle";
    let hearts = [];
    let pops = [];
    let sparks = [];
    let score = 0;
    let elapsed = 0;
    let spawnIn = 0;
    let last = 0;
    let raf = 0;
    let shownTime = DURATION;
    const basket = { x: 0, target: 0, w: 90, h: 56, squash: 0, blink: 0 };
    const keys = { left: false, right: false };

    const loadBest = () => {
      try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
    };
    const saveBest = (v) => {
      try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* abaikan */ }
    };
    let best = loadBest();
    bestEl.textContent = best;
    timeEl.textContent = DURATION;

    /* ---- Ukuran canvas mengikuti stage ---- */
    const resize = () => {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      basket.w = clamp(W * 0.2, 72, 112);
      basket.h = basket.w * 0.62;
      if (!basket.x) basket.x = basket.target = W / 2;
      basket.x = clamp(basket.x, basket.w / 2, W - basket.w / 2);
      basket.target = clamp(basket.target, basket.w / 2, W - basket.w / 2);
      if (state !== "playing") draw();
    };

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener("resize", resize);

    /* ---- Gambar ---- */
    const roundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const drawHeart = (h) => {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      const s = h.size / 24;
      ctx.scale(s, s);
      ctx.translate(-12, -13);
      if (h.gold) {
        ctx.shadowColor = "rgba(232, 176, 75, 0.8)";
        ctx.shadowBlur = 14;
      }
      ctx.fillStyle = h.color;
      ctx.fill(heartPath);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.ellipse(7.5, 9, 2.2, 1.4, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Keranjang lucu dengan wajah & pita
    const drawBasket = () => {
      const sq = basket.squash;
      const w = basket.w * (1 + sq * 0.1);
      const h = basket.h * (1 - sq * 0.12);
      const x = basket.x - w / 2;
      const bottom = H - 14;
      const y = bottom - h;

      // bayangan
      ctx.fillStyle = "rgba(107, 24, 57, 0.12)";
      ctx.beginPath();
      ctx.ellipse(basket.x, bottom + 6, w * 0.45, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // badan
      const grad = ctx.createLinearGradient(0, y, 0, bottom);
      grad.addColorStop(0, "#F8BDD1");
      grad.addColorStop(1, "#E98CAD");
      ctx.fillStyle = grad;
      roundRect(x, y + 6, w, h - 6, 16);
      ctx.fill();

      // pinggiran atas
      ctx.fillStyle = "#6B1839";
      roundRect(x - 4, y, w + 8, 12, 6);
      ctx.fill();

      // wajah
      const cy = y + h * 0.55;
      const blinking = basket.blink > 0;
      ctx.fillStyle = "#4A1029";
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        if (blinking) ctx.ellipse(basket.x + side * w * 0.17, cy, 4, 1.2, 0, 0, Math.PI * 2);
        else ctx.ellipse(basket.x + side * w * 0.17, cy, 3.2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.strokeStyle = "#4A1029";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(basket.x, cy + 4, sq > 0.3 ? 6 : 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.ellipse(basket.x + side * w * 0.3, cy + 6, 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // pita kecil di pojok
      const bx = x + w - 10;
      const by = y + 4;
      ctx.fillStyle = "#6B1839";
      ctx.beginPath();
      ctx.ellipse(bx - 8, by - 2, 8, 5, -0.5, 0, Math.PI * 2);
      ctx.ellipse(bx + 8, by - 2, 8, 5, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#9B3460";
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      hearts.forEach(drawHeart);

      sparks.forEach((s) => {
        ctx.globalAlpha = Math.max(0, 1 - s.t / s.life);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (W) drawBasket();

      pops.forEach((p) => {
        ctx.globalAlpha = Math.max(0, 1 - p.t / 0.9);
        ctx.fillStyle = p.gold ? "#B9822A" : "#6B1839";
        ctx.font = `600 ${p.gold ? 24 : 20}px "Playfair Display", serif`;
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x, p.y);
      });
      ctx.globalAlpha = 1;
    };

    /* ---- Logika ---- */
    const spawn = () => {
      const progress = elapsed / DURATION;
      const gold = Math.random() < 0.1;
      const size = gold ? 32 : rand(22, 32);
      hearts.push({
        x: rand(size, W - size),
        y: -size,
        size,
        gold,
        vy: H * rand(0.3, 0.42) * (1 + progress * 0.7) * (gold ? 1.25 : 1),
        color: gold ? "#E8B04B" : pick(HEART_COLORS),
        rot: rand(-0.3, 0.3),
        vr: rand(-0.8, 0.8),
        sway: rand(0, 40),
        seed: rand(0, 6),
        t: 0
      });
    };

    const catchHeart = (h) => {
      const points = h.gold ? 3 : 1;
      score += points;
      scoreEl.textContent = score;
      basket.squash = 1;
      pops.push({ x: h.x, y: H - basket.h - 24, text: `+${points}`, gold: h.gold, t: 0 });
      for (let i = 0; i < 8; i++) {
        const a = rand(0, Math.PI * 2);
        const v = rand(60, 160);
        sparks.push({
          x: h.x, y: H - basket.h - 10,
          vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80,
          r: rand(2, 4), color: h.gold ? "#E8CFA9" : pick(HEART_COLORS),
          t: 0, life: rand(0.4, 0.7)
        });
      }
    };

    const update = (dt) => {
      elapsed += dt;
      const timeLeft = Math.max(0, DURATION - elapsed);
      const secs = Math.ceil(timeLeft);
      if (secs !== shownTime) { shownTime = secs; timeEl.textContent = secs; }

      // gerak keranjang
      const speed = W * 1.3;
      if (keys.left) basket.target -= speed * dt;
      if (keys.right) basket.target += speed * dt;
      basket.target = clamp(basket.target, basket.w / 2, W - basket.w / 2);
      basket.x += (basket.target - basket.x) * Math.min(1, dt * 16);
      basket.squash = Math.max(0, basket.squash - dt * 4);
      basket.blink = basket.blink > 0 ? basket.blink - dt : (Math.random() < dt * 0.4 ? 0.15 : 0);

      // munculkan hati
      spawnIn -= dt;
      if (spawnIn <= 0) {
        spawn();
        const progress = elapsed / DURATION;
        spawnIn = (0.55 - 0.23 * progress) * rand(0.8, 1.2);
      }

      const top = H - 14 - basket.h;
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.t += dt;
        h.y += h.vy * dt;
        h.x += Math.sin(h.t * 3 + h.seed) * h.sway * dt;
        h.rot += h.vr * dt;

        const inX = Math.abs(h.x - basket.x) <= basket.w / 2 + h.size * 0.15;
        const inY = h.y + h.size * 0.35 >= top && h.y - h.size * 0.5 <= top + basket.h * 0.45;
        if (inX && inY) { catchHeart(h); hearts.splice(i, 1); continue; }
        if (h.y - h.size > H) hearts.splice(i, 1);
      }

      pops = pops.filter((p) => { p.t += dt; p.y -= 50 * dt; return p.t < 0.9; });
      sparks = sparks.filter((s) => {
        s.t += dt; s.vy += 400 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
        return s.t < s.life;
      });

      if (timeLeft <= 0) end();
    };

    const loop = (now) => {
      if (state !== "playing") return;
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
      last = now;
      update(dt);
      draw();
      if (state === "playing") raf = requestAnimationFrame(loop);
    };

    /* ---- Layar ---- */
    const showIntro = () => {
      overlay.innerHTML = `
        <div class="game-screen">
          <div class="game-screen__icon"><svg viewBox="0 0 24 24"><use href="#i-heart"/></svg></div>
          <h3 class="game-screen__title">Catch the Hearts</h3>
          <p class="game-screen__text">Tangkap hati sebanyak mungkin dalam ${DURATION} detik. Hati emas nilainya +3!</p>
          <div class="game-screen__actions">
            <button class="btn btn--primary" type="button" data-act="play">Mulai main</button>
          </div>
        </div>`;
      overlay.hidden = false;
    };

    const reset = () => {
      hearts = [];
      pops = [];
      sparks = [];
      score = 0;
      elapsed = 0;
      spawnIn = 0.3;
      shownTime = DURATION;
      scoreEl.textContent = "0";
      timeEl.textContent = DURATION;
      keys.left = keys.right = false;
    };

    const start = () => {
      resize();
      reset();
      overlay.hidden = true;
      state = "playing";
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    const end = () => {
      state = "over";
      cancelAnimationFrame(raf);
      hearts = [];
      draw();
      const isBest = score > best;
      if (isBest) { best = score; saveBest(best); bestEl.textContent = best; }
      const r = resultFor(data.results, score);
      overlay.innerHTML = `
        <div class="game-screen">
          <div class="score-ring" style="--p:${Math.min(100, Math.round((score / 50) * 100))}"><span>${score}</span></div>
          <h3 class="game-screen__title">${esc(r.title)}</h3>
          <p class="game-screen__text">${esc(r.text)}${isBest && score > 0 ? "<br><strong>New best score! ♡</strong>" : ""}</p>
          <div class="game-screen__actions">
            <button class="btn btn--primary" type="button" data-act="play">Main lagi</button>
          </div>
        </div>`;
      overlay.hidden = false;
      const c = centerOf(stage);
      if (score >= 15) FX.burst(c.x, c.y, { count: 70, hearts: 0.6 });
      else FX.hearts(c.x, c.y, 10);
    };

    const stop = () => {
      if (state !== "playing") return;
      state = "idle";
      cancelAnimationFrame(raf);
      reset();
      draw();
      showIntro();
    };

    /* ---- Kontrol ---- */
    overlay.addEventListener("click", (e) => {
      if (e.target.closest("[data-act='play']")) start();
    });

    const follow = (e) => {
      if (state !== "playing") return;
      const r = canvas.getBoundingClientRect();
      basket.target = clamp(e.clientX - r.left, basket.w / 2, W - basket.w / 2);
    };
    canvas.addEventListener("pointerdown", (e) => {
      follow(e);
      if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", follow);

    const setKey = (e, down) => {
      if (state !== "playing") return;
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") { keys.left = down; e.preventDefault(); }
      if (k === "arrowright" || k === "d") { keys.right = down; e.preventDefault(); }
    };
    window.addEventListener("keydown", (e) => setKey(e, true));
    window.addEventListener("keyup", (e) => setKey(e, false));

    showIntro();
    resize();

    return { onShow: resize, stop };
  };


  /* =========================================================
     GAME 3 — Road to Love
     Mobil kecil berisi kepala Khansa & Rifki, naik turun bukit
     menuju love di ujung jalan. Gas memakai "bensin cinta".
     ========================================================= */
  const LoveRide = (data = {}) => {
    const stage = $("#ride-stage");
    const canvas = $("#ride-canvas");
    const overlay = $("#ride-overlay");
    const heartsEl = $("#ride-hearts");
    const fuelEl = $("#ride-fuel");
    const progressEl = $("#ride-progress");
    const ctx = canvas.getContext("2d");
    const heartPath = new Path2D("M12 21s-7.5-4.6-9.6-9.3C.9 8.3 2.9 4.5 6.6 4.5c2.1 0 3.5 1.2 4.4 2.5.9-1.3 2.3-2.5 4.4-2.5 3.7 0 5.7 3.8 4.2 7.2C19.5 16.4 12 21 12 21z");

    /* ---- Pengaturan (satuan: piksel dunia game) ---- */
    const LENGTH = clamp(Number(data.length) || 7500, 2500, 12000);
    const START_X = 140;
    const FINISH_X = LENGTH;
    const G = 900;          // gravitasi
    const ACC = 540;        // tenaga gas
    const BRAKE = 760;      // tenaga rem
    const REVERSE = 220;    // mundur pelan
    const DRAG = 0.35;
    const MAX_V = 520;
    const FUEL_USE = 9;     // bensin berkurang per detik saat gas ditekan
    const FUEL_GAIN = 4;    // bensin bertambah per hati

    /* ---- Jalan berbukit ---- */
    const heightAt = (x) => {
      if (x < 320) return 0;
      const t = x - 320;
      const grow = Math.min(1, t / 900);                      // bukit makin tinggi pelan-pelan
      const calm = clamp((FINISH_X - 120 - x) / 520, 0, 1);   // rata lagi dekat love
      return grow * calm * (60 * Math.sin(t * 0.0035) + 26 * Math.sin(t * 0.009 + 1.3) + 8 * Math.sin(t * 0.02 + 0.4));
    };
    const slopeAt = (x) => (heightAt(x + 1) - heightAt(x - 1)) / 2;

    let W = 0;
    let H = 0;
    let k = 1;
    let state = "idle";
    let raf = 0;
    let last = 0;
    let car = null;
    let pickups = [];
    let pops = [];
    let fuel = 100;
    let collected = 0;
    let elapsed = 0;
    let stillFor = 0;
    let pulse = 0;
    const keys = { gas: false, brake: false };

    /* ---- Foto kepala (dipotong bulat dari foto) ---- */
    const heads = ["khansa", "rifki"].map((key) => {
      const cfg = (data.heads || {})[key] || {};
      const head = { cfg, img: new Image(), ready: false, name: cfg.name || key };
      if (cfg.src) {
        head.img.onload = () => {
          head.ready = true;
          if (state !== "playing") draw();
          drawAvatars();
        };
        head.img.src = cfg.src;
      }
      return head;
    });

    const paintHead = (g, head, cx, cy, r) => {
      g.save();
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fillStyle = "#FCE7EF";
      g.fill();
      if (head.ready) {
        g.clip();
        const c = head.cfg;
        const size = c.size || Math.min(head.img.naturalWidth, head.img.naturalHeight);
        g.drawImage(head.img, c.x || 0, c.y || 0, size, size, cx - r, cy - r, r * 2, r * 2);
      } else {
        g.fillStyle = "#6B1839";
        g.font = `600 ${r}px "Playfair Display", serif`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(head.name.charAt(0).toUpperCase(), cx, cy + 1);
      }
      g.restore();
      g.lineWidth = Math.max(2, r * 0.13);
      g.strokeStyle = "#FFFFFF";
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
    };

    const reset = () => {
      car = { x: START_X, v: 0, y: 0, vy: 0, air: false, angle: 0, bob: [{ p: 0, v: 0 }, { p: 0, v: 0 }] };
      pickups = [];
      for (let x = 520, i = 0; x < FINISH_X - 420; x += 180, i++) {
        const bonus = i % 5 === 4; // hati emas melayang lebih tinggi
        pickups.push({ x, off: bonus ? 100 : 44 + (i % 2) * 22, bonus, got: false, seed: rand(0, 6) });
      }
      pops = [];
      fuel = 100;
      collected = 0;
      elapsed = 0;
      stillFor = 0;
      keys.gas = keys.brake = false;
      updateHud();
    };

    const progress = () => clamp((car.x - START_X) / (FINISH_X - 60 - START_X), 0, 1);

    const updateHud = () => {
      heartsEl.textContent = collected;
      fuelEl.style.width = `${fuel}%`;
      fuelEl.classList.toggle("is-low", fuel < 25);
      progressEl.textContent = Math.round(progress() * 100);
    };

    /* ---- Ukuran canvas ---- */
    const resize = () => {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      k = clamp(H / 440, 0.72, 1.15);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (state !== "playing") draw();
    };
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener("resize", resize);

    /* ---- Fisika ---- */
    const bump = (amount) => car.bob.forEach((b, i) => { b.v += amount * (i ? 0.8 : 1); });

    const step = (dt) => {
      const slope = slopeAt(car.x);
      let acc = 0;
      if (keys.gas && fuel > 0) {
        acc += ACC;
        fuel = Math.max(0, fuel - FUEL_USE * dt);
      }
      if (keys.brake) acc -= car.v > 20 ? BRAKE : REVERSE;
      if (car.air) acc *= 0.25;
      else acc -= G * (slope / Math.sqrt(1 + slope * slope));
      acc -= DRAG * car.v;

      car.v = clamp(car.v + acc * dt, -160, MAX_V);
      car.x += car.v * dt;
      if (car.x < 60) { car.x = 60; car.v = Math.max(0, car.v); }

      const ground = heightAt(car.x);
      if (car.air) {
        car.vy -= G * dt;
        car.y += car.vy * dt;
        if (car.y <= ground) {
          bump(-car.vy * 0.9);
          car.y = ground;
          car.vy = slopeAt(car.x) * car.v;
          car.air = false;
        }
      } else {
        const groundVy = slopeAt(car.x) * car.v;
        // Lompat kecil kalau melewati puncak bukit dengan kencang
        if ((groundVy - car.vy) / dt < -G * 1.05 && car.v > 160) {
          car.air = true;
          car.y += car.vy * dt;
        } else {
          car.vy = groundVy;
          car.y = ground;
        }
      }

      // Sudut mobil mengikuti kemiringan jalan
      const target = car.air ? car.angle * 0.98 : Math.atan(slopeAt(car.x));
      car.angle += (target - car.angle) * Math.min(1, dt * 12);

      // Kepala bergoyang (seperti pegas)
      car.bob.forEach((b) => {
        b.v += (-90 * b.p - 7 * b.v) * dt;
        b.p += b.v * dt;
      });
      if (keys.gas && fuel > 0 && Math.random() < dt * 3) bump(rand(-8, 8));
    };

    const collect = () => {
      pickups.forEach((p) => {
        if (p.got) return;
        const hy = heightAt(p.x) + p.off;
        if (Math.abs(p.x - car.x) < 44 && hy > car.y + 4 && hy < car.y + 92) {
          p.got = true;
          collected += p.bonus ? 3 : 1;
          fuel = Math.min(100, fuel + FUEL_GAIN * (p.bonus ? 2 : 1));
          pops.push({ x: p.x, y: hy + 20, text: p.bonus ? "+3" : "+1", t: 0, bonus: p.bonus });
          bump(-30);
        }
      });
    };

    const update = (dt) => {
      elapsed += dt;
      pulse += dt;
      step(dt / 2);
      step(dt / 2);
      collect();
      pops = pops.filter((p) => { p.t += dt; p.y += 40 * dt; return p.t < 0.9; });
      updateHud();

      if (car.x >= FINISH_X - 60) { end(true); return; }

      // Kalah kalau bensin habis dan mobil sudah berhenti
      if (fuel <= 0 && !car.air && Math.abs(car.v) < 8) stillFor += dt;
      else stillFor = 0;
      if (stillFor > 1.2) end(false);
    };

    /* ---- Gambar ---- */
    const camX = () => clamp(car.x - (W / k) * 0.32, 0, Math.max(0, FINISH_X + 260 - W / k));
    const baseY = () => H * 0.72;
    const toScreen = (wx, wy, cam) => ({ x: (wx - cam) * k, y: baseY() - wy * k });

    const drawHeartShape = (x, y, size, color, glow) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 24, size / 24);
      ctx.translate(-12, -13);
      if (glow) { ctx.shadowColor = "rgba(232, 176, 75, 0.85)"; ctx.shadowBlur = 14; }
      ctx.fillStyle = color;
      ctx.fill(heartPath);
      ctx.restore();
    };

    const drawHills = (cam, parallax, color, amp, freq, yRatio) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let sx = 0; sx <= W + 8; sx += 8) {
        const wx = cam * parallax + sx / k;
        ctx.lineTo(sx, H * yRatio - amp * k * (Math.sin(wx * freq) + 0.5 * Math.sin(wx * freq * 2.3 + 1)));
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    };

    const roundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const drawCar = (cam) => {
      const p = toScreen(car.x, car.y, cam);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(-car.angle);
      ctx.scale(k, k);

      // kepala (di belakang badan mobil)
      paintHead(ctx, heads[1], -15, -66 - car.bob[1].p, 19); // Rifki di kursi belakang
      paintHead(ctx, heads[0], 19, -64 - car.bob[0].p, 19);  // Khansa di kursi depan

      // kaca depan
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(38, -40);
      ctx.lineTo(46, -60);
      ctx.stroke();

      // badan mobil
      const grad = ctx.createLinearGradient(0, -44, 0, -14);
      grad.addColorStop(0, "#F8BDD1");
      grad.addColorStop(1, "#E98CAD");
      ctx.fillStyle = grad;
      roundRect(-48, -44, 96, 28, 12);
      ctx.fill();
      ctx.fillStyle = "#6B1839";
      roundRect(-48, -22, 96, 7, 3.5);
      ctx.fill();
      ctx.fillStyle = "#FFF4D6";
      ctx.beginPath();
      ctx.ellipse(44, -34, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      drawHeartShape(-2, -31, 14, "#6B1839");

      // roda
      const spin = car.x / 13;
      [-29, 29].forEach((wx) => {
        ctx.save();
        ctx.translate(wx, -12);
        ctx.fillStyle = "#4A1029";
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#F4A7C1";
        ctx.beginPath();
        ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.rotate(spin);
        ctx.strokeStyle = "#FCE7EF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 8);
        ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
    };

    const draw = () => {
      if (!W || !car) return;
      const cam = camX();
      ctx.clearRect(0, 0, W, H);

      // awan
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      const span = W / k + 400;
      [[120, 0.16], [460, 0.22], [820, 0.12], [1180, 0.2]].forEach(([wx, yr]) => {
        const x = ((((wx - cam * 0.15) % span) + span) % span - 200) * k;
        const y = H * yr;
        ctx.beginPath();
        ctx.ellipse(x, y, 34 * k, 13 * k, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 22 * k, y - 8 * k, 22 * k, 13 * k, 0, 0, Math.PI * 2);
        ctx.ellipse(x - 20 * k, y - 4 * k, 18 * k, 10 * k, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // bukit di kejauhan (parallax)
      drawHills(cam, 0.25, "rgba(232, 207, 169, 0.35)", 34, 0.004, 0.5);
      drawHills(cam, 0.5, "rgba(244, 167, 193, 0.4)", 28, 0.006, 0.6);

      // jalan
      const groundGrad = ctx.createLinearGradient(0, baseY() - 80 * k, 0, H);
      groundGrad.addColorStop(0, "#F4A7C1");
      groundGrad.addColorStop(1, "#E98CAD");
      ctx.fillStyle = groundGrad;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let sx = 0; sx <= W + 6; sx += 6) ctx.lineTo(sx, toScreen(cam + sx / k, heightAt(cam + sx / k), cam).y);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#6B1839";
      ctx.lineWidth = 4 * k;
      ctx.beginPath();
      for (let sx = 0; sx <= W + 6; sx += 6) {
        const y = toScreen(cam + sx / k, heightAt(cam + sx / k), cam).y;
        if (sx === 0) ctx.moveTo(sx, y);
        else ctx.lineTo(sx, y);
      }
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      for (let wx = Math.floor(cam / 60) * 60; wx < cam + W / k + 60; wx += 60) {
        const s = toScreen(wx, heightAt(wx) - 12, cam);
        ctx.fillRect(s.x, s.y, 18 * k, 3 * k);
      }

      // love di garis finish
      const f = toScreen(FINISH_X, heightAt(FINISH_X), cam);
      if (f.x > -120 && f.x < W + 120) {
        const beat = 1 + Math.sin(pulse * 4) * 0.06;
        ctx.strokeStyle = "#6B1839";
        ctx.lineWidth = 3 * k;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x, f.y - 70 * k);
        ctx.stroke();
        drawHeartShape(f.x, f.y - 108 * k, 84 * k * beat, "#6B1839");
        drawHeartShape(f.x, f.y - 108 * k, 58 * k * beat, "#F4A7C1");
        ctx.fillStyle = "#6B1839";
        ctx.font = `italic 600 ${22 * k}px "Playfair Display", serif`;
        ctx.textAlign = "center";
        ctx.fillText("love", f.x, f.y - 158 * k);
      }

      // hati di sepanjang jalan
      pickups.forEach((p) => {
        if (p.got) return;
        const s = toScreen(p.x, heightAt(p.x) + p.off + Math.sin(pulse * 3 + p.seed) * 4, cam);
        if (s.x < -30 || s.x > W + 30) return;
        drawHeartShape(s.x, s.y, (p.bonus ? 30 : 24) * k, p.bonus ? "#E8B04B" : "#E98CAD", p.bonus);
      });

      drawCar(cam);

      pops.forEach((p) => {
        const s = toScreen(p.x, p.y, cam);
        ctx.globalAlpha = Math.max(0, 1 - p.t / 0.9);
        ctx.fillStyle = p.bonus ? "#B9822A" : "#6B1839";
        ctx.font = `600 ${20 * k}px "Playfair Display", serif`;
        ctx.textAlign = "center";
        ctx.fillText(p.text, s.x, s.y);
      });
      ctx.globalAlpha = 1;
    };

    const loop = (now) => {
      if (state !== "playing") return;
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
      last = now;
      update(dt);
      draw();
      if (state === "playing") raf = requestAnimationFrame(loop);
    };

    /* ---- Layar ---- */
    const drawAvatars = () => {
      const c = $(".ride__avatars", overlay);
      if (!c) return;
      const g = c.getContext("2d");
      g.clearRect(0, 0, c.width, c.height);
      paintHead(g, heads[0], 46, 45, 34);
      paintHead(g, heads[1], 114, 45, 34);
    };

    const showIntro = () => {
      overlay.innerHTML = `
        <div class="game-screen">
          <canvas class="ride__avatars" width="160" height="90" aria-hidden="true"></canvas>
          <h3 class="game-screen__title">${esc(data.title || "Road to Love")}</h3>
          <p class="game-screen__text">${esc(data.intro || "")}</p>
          <div class="game-screen__actions">
            <button class="btn btn--primary" type="button" data-act="play">Ayo jalan!</button>
          </div>
        </div>`;
      overlay.hidden = false;
      drawAvatars();
    };

    const start = () => {
      resize();
      reset();
      overlay.hidden = true;
      state = "playing";
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    const end = (won) => {
      state = "over";
      cancelAnimationFrame(raf);
      keys.gas = keys.brake = false;
      draw();
      const r = won ? resultFor(data.results, collected) : (data.lose || { title: "Yah...", text: "" });
      const ring = won ? 100 : Math.round(progress() * 100);
      overlay.innerHTML = `
        <div class="game-screen">
          <div class="score-ring" style="--p:${ring}"><span>${collected}<small>♡</small></span></div>
          <h3 class="game-screen__title">${esc(r.title)}</h3>
          <p class="game-screen__text">${esc(r.text)}${won ? `<br><small>waktu: ${elapsed.toFixed(1)} detik</small>` : ""}</p>
          <div class="game-screen__actions">
            <button class="btn btn--primary" type="button" data-act="play">Main lagi</button>
          </div>
        </div>`;
      overlay.hidden = false;
      if (won) {
        const c = centerOf(stage);
        FX.burst(c.x, c.y, { count: 90, hearts: 0.6 });
        FX.hearts(c.x, c.y, 16);
      }
    };

    const stop = () => {
      if (state !== "playing") return;
      state = "idle";
      cancelAnimationFrame(raf);
      reset();
      draw();
      showIntro();
    };

    /* ---- Kontrol ---- */
    overlay.addEventListener("click", (e) => {
      if (e.target.closest("[data-act='play']")) start();
    });

    // Tombol gas & rem ditahan (bisa pakai jari di HP)
    const hold = (btn, key) => {
      const on = (e) => { e.preventDefault(); keys[key] = true; btn.classList.add("is-down"); };
      const off = () => { keys[key] = false; btn.classList.remove("is-down"); };
      btn.addEventListener("pointerdown", on);
      ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, off));
      btn.addEventListener("contextmenu", (e) => e.preventDefault());
    };
    hold($("#ride-gas"), "gas");
    hold($("#ride-brake"), "brake");

    const setKey = (e, down) => {
      if (state !== "playing") return;
      const key = e.key.toLowerCase();
      if (key === "arrowright" || key === "d" || key === "arrowup" || key === "w") { keys.gas = down; e.preventDefault(); }
      if (key === "arrowleft" || key === "a" || key === "arrowdown" || key === "s") { keys.brake = down; e.preventDefault(); }
    };
    window.addEventListener("keydown", (e) => setKey(e, true));
    window.addEventListener("keyup", (e) => setKey(e, false));
    window.addEventListener("blur", () => { keys.gas = keys.brake = false; });

    reset();
    showIntro();
    resize();

    return { onShow: resize, stop };
  };

  /* =========================================================
     Tabs
     ========================================================= */
  const initTabs = (games) => {
    const tabs = $$(".game-tab");

    const activate = (tab, focus = false) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.classList.toggle("is-active", selected);
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
        $(`#${t.getAttribute("aria-controls")}`).hidden = !selected;
      });
      if (focus) tab.focus();
      // Canvas game diukur ulang saat tab-nya muncul, dan game dihentikan saat ditinggal
      Object.entries(games).forEach(([id, game]) => {
        if (id === tab.id) requestAnimationFrame(game.onShow);
        else game.stop();
      });
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
        activate(next, true);
      });
    });
  };

  try {
    LoveQuiz($("#game-quiz"), C.loveQuiz);
    initTabs({
      "tab-catch": CatchGame(C.catchGame),
      "tab-ride": LoveRide(C.loveRide)
    });
  } catch (err) {
    console.warn("[games]", err);
  }
})();
