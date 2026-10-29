// Obscura — modelo cinematográfico. JS sem dependências.
// Sem JS o site continua legível: a intro é só CSS e o conteúdo fica visível.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- Intro: saltar com clique/tecla, e não repetir na mesma visita ---------- */
  const INTRO_MS = 2900;
  let introDone = reduced;
  const skipIntro = () => { if (!introDone) { root.classList.add("skip-intro"); introDone = true; } };
  try { if (sessionStorage.getItem("obscura-intro")) skipIntro(); sessionStorage.setItem("obscura-intro", "1"); } catch {}
  setTimeout(() => { introDone = true; }, INTRO_MS);
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach((t) => addEventListener(t, skipIntro, { once: true, passive: true }));

  /* ---------- Menu ---------- */
  const menu = $("#menu"), toggle = $(".nav__toggle"), closeBtn = $(".menu__close");
  $$("li", menu).forEach((li, i) => li.style.setProperty("--i", i));
  const openMenu = () => { menu.hidden = false; requestAnimationFrame(() => menu.classList.add("is-open")); toggle.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; $("a", menu).focus(); };
  const closeMenu = (back = true) => { menu.classList.remove("is-open"); menu.hidden = true; toggle.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; if (back) toggle.focus(); };
  toggle.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", () => closeMenu());
  $$("a", menu).forEach((a) => a.addEventListener("click", () => closeMenu(false)));
  menu.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
    if (e.key === "Tab") {
      const f = $$("a, button", menu), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Manifesto: dividir em palavras ---------- */
  const mText = $("[data-words]");
  const HOT = ["guião:", "máquina."];
  const words = mText.textContent.trim().split(/\s+/);
  mText.innerHTML = "";
  const wordEls = words.map((w, i) => {
    const s = document.createElement("span");
    s.className = "w" + (HOT.includes(w) ? " is-hot" : "");
    s.textContent = w;
    mText.append(s, i < words.length - 1 ? " " : "");
    return s;
  });
  if (reduced) wordEls.forEach((w) => w.classList.add("on"));
  const manifesto = $(".manifesto");

  /* ---------- Bobina presa (desktop) ---------- */
  const reel = $(".reel"), track = $(".reel__track"), pin = $(".reel__pin");
  const deskMQ = matchMedia("(min-width: 900px)");
  let reelDist = 0;
  const setupReel = () => {
    const on = deskMQ.matches && !reduced;
    reel.classList.toggle("is-pinned", on);
    if (!on) { reel.style.height = ""; track.style.transform = ""; reelDist = 0; return; }
    reelDist = Math.max(0, track.scrollWidth - innerWidth);
    reel.style.height = `${innerHeight + reelDist}px`;
    onScroll();
  };
  deskMQ.addEventListener("change", setupReel);
  addEventListener("resize", setupReel);
  $$("img", track).forEach((img) => img.complete || img.addEventListener("load", setupReel, { once: true }));
  // Teclado: ao focar uma imagem fora do ecrã, levar o scroll até ela
  track.addEventListener("focusin", (e) => {
    if (!reel.classList.contains("is-pinned")) return;
    const li = e.target.closest(".frame");
    const x = li.offsetLeft + li.offsetWidth / 2 - innerWidth / 2;
    const p = clamp(x / reelDist);
    scrollTo({ top: reel.offsetTop + p * reelDist, behavior: "instant" });
  });

  /* ---------- Projetor (lightbox) ---------- */
  const proj = $("#projector"), projImg = $("img", proj), projCap = $(".projector__cap", proj);
  const frames = $$(".frame__btn");
  let cur = 0, opener = null;
  const show = (i) => {
    cur = (i + frames.length) % frames.length;
    const f = frames[cur];
    projImg.src = f.dataset.full;
    projImg.alt = $("img", f).alt;
    const cap = $(".frame__cap", f);
    projCap.innerHTML = "";
    const b = document.createElement("b"); b.textContent = $("b", cap).textContent;
    projCap.append(b, cap.lastChild.textContent.trim());
  };
  if (typeof proj.showModal === "function") {
    frames.forEach((f, i) => f.addEventListener("click", () => { opener = f; show(i); proj.showModal(); }));
    proj.addEventListener("click", (e) => {
      const a = e.target.closest("[data-p]")?.dataset.p;
      if (a === "prev") show(cur - 1);
      if (a === "next") show(cur + 1);
      if (a === "close" || e.target === proj) proj.close();
    });
    proj.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
    proj.addEventListener("close", () => opener?.focus());
  }

  /* ---------- Estilos: imagem que segue o rato ---------- */
  const float = $(".styles__float"), floatImg = $("img", float);
  const canHover = matchMedia("(hover: hover) and (min-width: 900px)").matches && !reduced;
  if (canHover) {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * .14; y += (ty - y) * .14;
      float.style.transform = `translate(${x + 40}px, ${y - 190}px) rotate(${(tx - x) * .02}deg)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .5 ? requestAnimationFrame(loop) : 0;
    };
    $(".styles").addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    $$(".styles__list a").forEach((a) => {
      a.addEventListener("pointerenter", () => { floatImg.src = a.dataset.img; float.classList.add("is-on"); });
      a.addEventListener("pointerleave", () => float.classList.remove("is-on"));
    });
  }

  /* ---------- Focus pull nas imagens ---------- */
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-sharp"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
    $$(".focus").forEach((el) => io.observe(el));
    const credits = $(".credits");
    new IntersectionObserver(([e]) => { if (e.isIntersecting) credits.classList.add("is-rolling"); }, { threshold: .15 }).observe(credits);
  } else {
    $$(".focus").forEach((el) => el.classList.add("is-sharp"));
    $(".credits").classList.add("is-rolling");
  }

  /* ---------- Painel de projeção: timecode + cena ---------- */
  const RUNTIME = 204, FPS = 24;               // o "filme" dura 3:24
  const tcEls = [$("#tc"), $("#tc-m")];
  const sceneN = $("#scene-n"), sceneName = $("#scene-name");
  const scenes = $$("[data-scene]");
  const pad = (n) => String(n).padStart(2, "0");
  const header = $(".site-header"), hero = $(".hero"), bar = $("#mobile-bar"), booking = $("#marcar");
  const parallax = $(".parallax");
  let lastScene = -1;

  function onScroll() {
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const p = max > 0 ? clamp(y / max) : 0;

    // timecode
    const total = Math.round(p * RUNTIME * FPS);
    const tc = `00:${pad(Math.floor(total / FPS / 60))}:${pad(Math.floor(total / FPS) % 60)}:${pad(total % FPS)}`;
    tcEls.forEach((el) => el && (el.textContent = tc));

    // cena atual
    let idx = 0;
    scenes.forEach((s, i) => { if (s.getBoundingClientRect().top <= vh * .5) idx = i; });
    if (idx !== lastScene) { lastScene = idx; sceneN.textContent = idx + 1; sceneName.textContent = scenes[idx].dataset.scene; }

    // header e barra mobile
    const heroBottom = hero.getBoundingClientRect().bottom;
    header.classList.toggle("is-solid", heroBottom < 80);
    const b = booking.getBoundingClientRect();
    bar.classList.toggle("is-on", heroBottom < vh * .4 && !(b.top < vh && b.bottom > 0));

    if (reduced) return;

    // manifesto
    const m = manifesto.getBoundingClientRect();
    const mp = clamp(-m.top / (m.height - vh) * 1.15);
    const lit = Math.floor(mp * wordEls.length);
    wordEls.forEach((w, i) => { w.classList.toggle("on", i < lit); w.classList.toggle("hot", i < lit && w.classList.contains("is-hot")); });

    // bobina
    if (reelDist) {
      const r = reel.getBoundingClientRect();
      track.style.transform = `translate3d(${-clamp(-r.top / reelDist) * reelDist}px,0,0)`;
    }

    // parallax do estúdio
    if (parallax) {
      const r = parallax.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) parallax.style.setProperty("--py", `${((r.top + r.height / 2 - vh / 2) * -.12 - r.height * .09).toFixed(1)}px`);
    }
  }
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  setupReel();
  onScroll();

  /* ---------- Rebobinar: volta ao início e repete a abertura ---------- */
  $("#rebobinar").addEventListener("click", () => {
    const replay = () => {
      root.classList.remove("skip-intro");
      introDone = reduced;
      $$(".bar, .intro-card, .line > span, .hero__lead, .hero__actions, .hero__media img, .site-header, .hud").forEach((el) => {
        el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
      });
      setTimeout(() => { introDone = true; }, INTRO_MS);
      $("#hero-titulo").setAttribute("tabindex", "-1");
      $("#hero-titulo").focus({ preventScroll: true });
    };
    if (reduced) { scrollTo(0, 0); return; }
    scrollTo({ top: 0, behavior: "smooth" });
    const wait = () => (scrollY < 2 ? replay() : requestAnimationFrame(wait));
    requestAnimationFrame(wait);
  });

  /* ---------- Formulário ---------- */
  const form = $("#form"), errBox = $("#form-erros"), done = $("#form-ok");
  const artistSel = $("#artista");
  $$("[data-artist]").forEach((a) => a.addEventListener("click", () => { artistSel.value = a.dataset.artist; }));
  $$(".styles__list a").forEach((a) => a.addEventListener("click", () => {
    const idea = $("#ideia"); if (!idea.value) idea.placeholder = `Estilo: ${a.dataset.style}. Descreve a tua ideia…`;
  }));

  // referências
  const fileIn = $("#ref"), thumbs = $("#thumbs"), drop = $("#drop"), refErr = $("#ref-erro");
  let files = [];
  const render = () => {
    thumbs.innerHTML = "";
    files.forEach((f, i) => {
      const li = document.createElement("li"), img = document.createElement("img"), rm = document.createElement("button");
      img.alt = `Referência: ${f.name}`;
      img.src = /^image\/(jpeg|png|webp)$/.test(f.type) ? URL.createObjectURL(f) : "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
      rm.type = "button"; rm.textContent = "×"; rm.setAttribute("aria-label", `Remover ${f.name}`);
      rm.addEventListener("click", () => { files.splice(i, 1); render(); fileIn.focus(); });
      li.append(img, rm); thumbs.append(li);
    });
  };
  const add = (list) => {
    const msg = [];
    for (const f of list) {
      if (files.length >= 5) { msg.push("Máximo de 5 imagens."); break; }
      if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type) && !/\.heic$/i.test(f.name)) { msg.push(`${f.name}: usa JPG, PNG, WEBP ou HEIC.`); continue; }
      if (f.size > 10 * 1024 * 1024) { msg.push(`${f.name}: tem mais de 10 MB.`); continue; }
      files.push(f);
    }
    refErr.textContent = msg.join(" "); render();
  };
  fileIn.addEventListener("change", () => { add(fileIn.files); fileIn.value = ""; });
  ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove("is-over"); }));
  drop.addEventListener("drop", (e) => add(e.dataTransfer.files));

  const rules = [
    { id: "nome", ok: (el) => el.value.trim().length >= 2, msg: "Escreve o teu nome." },
    { id: "email", ok: (el) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()), msg: "Escreve um email válido, por exemplo nome@exemplo.com." },
    { id: "artista", ok: (el) => el.value !== "", msg: "Escolhe um artista ou \"Sem preferência\"." },
    { id: "ideia", ok: (el) => el.value.trim().length >= 20, msg: "Descreve a ideia em pelo menos 20 caracteres." },
    { id: "zona", ok: (el) => el.value !== "", msg: "Escolhe a zona do corpo." },
    { id: "tamanho", ok: (el) => el.value !== "", msg: "Escolhe um tamanho aproximado." },
    { id: "idade", ok: (el) => el.checked, msg: "Confirma que tens 18 anos ou mais." },
    { id: "priv", ok: (el) => el.checked, msg: "Precisamos da tua autorização para guardar os dados do pedido." },
  ];
  const check = (r) => {
    const el = $(`#${r.id}`), good = r.ok(el);
    el.setAttribute("aria-invalid", String(!good));
    el.setAttribute("aria-describedby", [el.getAttribute("aria-describedby")?.replace(`${r.id}-erro`, "").trim(), `${r.id}-erro`].filter(Boolean).join(" "));
    $(`#${r.id}-erro`).textContent = good ? "" : r.msg;
    return { good, el, msg: r.msg };
  };
  // mostrar erros só depois do clique terminar (evita que o layout salte debaixo do dedo)
  let down = false, pending = [];
  addEventListener("pointerdown", () => { down = true; }, true);
  addEventListener("pointerup", () => { down = false; setTimeout(() => { pending.forEach((f) => f()); pending = []; }, 0); }, true);
  rules.forEach((r) => {
    const el = $(`#${r.id}`);
    if (el.tagName === "SELECT" || el.type === "checkbox") { el.addEventListener("change", () => check(r)); return; }
    el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") check(r); });
    el.addEventListener("blur", () => { if (el.value) (down ? pending.push(() => check(r)) : check(r)); });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if ($("#site").value) return;
    const bad = rules.map(check).filter((r) => !r.good);
    const list = $("ul", errBox); list.innerHTML = "";
    if (bad.length) {
      bad.forEach((b) => {
        const li = document.createElement("li"), a = document.createElement("a");
        a.href = `#${b.el.id}`; a.textContent = b.msg;
        a.addEventListener("click", (ev) => { ev.preventDefault(); b.el.focus(); });
        li.append(a); list.append(li);
      });
      errBox.hidden = false; errBox.focus(); return;
    }
    errBox.hidden = true;
    const btn = $("button[type=submit]", form);
    btn.disabled = true; btn.textContent = "A enviar…";
    const data = new FormData(form); data.delete("referencias"); files.forEach((f) => data.append("referencias", f));
    let ok = true, demo = !form.dataset.endpoint;
    try {
      if (demo) await new Promise((r) => setTimeout(r, 700));
      else ok = (await fetch(form.dataset.endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })).ok;
    } catch { ok = false; }
    btn.disabled = false; btn.textContent = "Enviar pedido";
    done.innerHTML = "";
    const h = document.createElement("h3"), p = document.createElement("p");
    if (!ok) {
      h.textContent = "O pedido não foi enviado";
      p.textContent = "Verifica a ligação e tenta outra vez, ou liga para 0161 496 0732.";
      done.append(h, p); done.hidden = false; done.focus(); return;
    }
    if (demo) { const f = document.createElement("span"); f.className = "flag"; f.textContent = "Modo demonstração"; done.append(f); }
    h.textContent = demo ? "Pedido validado" : "Pedido enviado";
    p.textContent = demo
      ? `Num site real este pedido seguia para o estúdio e ${data.get("nome").split(" ")[0]} recebia resposta em 2 dias úteis em ${data.get("email")}. Este modelo ainda não está ligado a nenhum serviço de email, por isso nada foi enviado.`
      : `Obrigado. Respondemos em 2 dias úteis para ${data.get("email")}.`;
    done.append(h, p);
    form.hidden = true; done.hidden = false; done.focus();
  });
})();
