/* ============================================================================
   Silica site — script único (self-contained).
   Header/rodapé já vêm prontos no HTML (ver tools/gen-static-header.mjs);
   este script só liga a interatividade: tema, idioma, menu, FAQ, scroll-spy.
   ========================================================================== */
(function () {
  "use strict";

  function t(pt, en) { return '<span data-lang="pt">' + pt + '</span><span data-lang="en">' + en + '</span>'; }

  // ---- Interações -----------------------------------------------------------
  function wire() {
    var root = document.documentElement;

    // Tema — "Silica Glass" (escuro, padrão) × claro. Valores antigos (grafite, dark, zen,
    // ouro, rosa) contam como Glass: o CSS só distingue data-theme="light".
    var themeBtn = document.getElementById("themeBtn");
    if (themeBtn) themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "glass" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("silica-theme", next); } catch (e) {}
      syncThemeBtn();
    });
    function syncThemeBtn() {
      if (themeBtn) themeBtn.setAttribute("aria-pressed", root.getAttribute("data-theme") === "light" ? "true" : "false");
    }
    syncThemeBtn();

    // Idioma
    var langBtn = document.getElementById("langBtn");
    if (langBtn) langBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-lang") === "en" ? "pt" : "en";
      setLang(next);
      try { localStorage.setItem("silica-lang", next); } catch (e) {}
      pauseAllVideos();
    });

    // Menu mobile
    var navToggle = document.getElementById("navToggle");
    function closeMobileNav(returnFocus) {
      if (!document.body.classList.contains("nav-open")) return;
      document.body.classList.remove("nav-open");
      if (navToggle) {
        navToggle.setAttribute("aria-expanded", "false");
        if (returnFocus) navToggle.focus();
      }
    }
    if (navToggle) navToggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // O menu aberto cobre a página: fecha quando o foco sai do cabeçalho (WCAG 2.4.11)
    var nav = document.querySelector(".site-header .nav");
    if (nav) nav.addEventListener("focusout", function (e) {
      if (!nav.contains(e.relatedTarget)) closeMobileNav(false);
    });

    // Dropdown (clique — importante no mobile e para acessibilidade)
    function closeDrops(except) {
      document.querySelectorAll(".nav-drop.open").forEach(function (d) {
        if (d === except) return;
        d.classList.remove("open");
        var b = d.querySelector(":scope > button");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    }
    document.querySelectorAll(".nav-drop > button").forEach(function (btn) {
      var drop = btn.parentElement;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var willOpen = !drop.classList.contains("open");
        closeDrops(drop);
        drop.classList.toggle("open", willOpen);
        btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
      drop.addEventListener("focusout", function (e) {
        if (!drop.contains(e.relatedTarget)) {
          drop.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
        }
      });
      drop.addEventListener("mouseleave", function () { drop.classList.remove("dismissed"); });
    });
    document.addEventListener("click", function () { closeDrops(null); });

    // Escape fecha menus abertos (inclusive o aberto pelo mouse) e devolve o foco ao botão
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var opened = document.querySelector(".nav-drop.open");
      document.querySelectorAll(".nav-drop").forEach(function (d) {
        if (d.matches(":hover")) d.classList.add("dismissed");
      });
      if (opened) {
        closeDrops(null);
        var b = opened.querySelector(":scope > button");
        if (b) b.focus();
        return;
      }
      closeMobileNav(true);
    });

    // Fecha o menu ao clicar num link
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      });
    });

    // FAQ accordion
    document.querySelectorAll(".faq-q").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.closest(".faq-item");
        var a = item.querySelector(".faq-a");
        var open = item.classList.toggle("open");
        q.setAttribute("aria-expanded", open ? "true" : "false");
        a.style.maxHeight = open ? a.scrollHeight + "px" : null;
      });
    });

    // Scroll-spy da sidebar de docs
    initScrollSpy();

    // Reveal suave ao rolar (respeita prefers-reduced-motion via CSS)
    initReveal();
    initMobileToc();
    initBackToTop();
    initLightbox();
    initFaqSearch();
    initHeaderScroll();
    initReadProgress();
    initVideos();
  }

  // Vídeos: só um toca por vez (os outros pausam) e todos pausam ao trocar de idioma,
  // porque a versão do outro idioma fica escondida.
  function pauseAllVideos(except) {
    document.querySelectorAll("video").forEach(function (v) { if (v !== except && !v.paused) v.pause(); });
  }
  function initVideos() {
    document.querySelectorAll("video").forEach(function (v) {
      v.addEventListener("play", function () { pauseAllVideos(v); });
    });
  }

  // Cabeçalho condensa (sombra + altura menor) depois de rolar um pouco
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Barra fina de progresso de leitura — só nas páginas longas (doc/prose)
  function initReadProgress() {
    if (!document.querySelector(".doc-main, .prose")) return;
    var bar = document.createElement("div");
    bar.className = "read-progress";
    document.body.appendChild(bar);
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }

  // Índice colapsável no mobile (a sidebar de docs some abaixo de 960px)
  function initMobileToc() {
    var side = document.querySelector(".doc-side nav");
    var main = document.querySelector(".doc-main");
    if (!side || !main) return;
    var det = document.createElement("details");
    det.className = "toc-mobile";
    var links = "";
    side.querySelectorAll("a").forEach(function (a) {
      links += '<a href="' + a.getAttribute("href") + '"' +
        (a.hasAttribute("data-lang") ? ' data-lang="' + a.getAttribute("data-lang") + '"' : "") +
        ">" + a.innerHTML + "</a>";
    });
    det.innerHTML = "<summary>" + t("Nesta página", "On this page") + "</summary><nav>" + links + "</nav>";
    main.prepend(det);
    det.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { det.removeAttribute("open"); });
    });
  }

  // Voltar ao topo
  function initBackToTop() {
    var btn = document.createElement("button");
    btn.className = "to-top";
    btn.type = "button";
    btn.setAttribute("aria-label", "Voltar ao topo");
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    btn.addEventListener("click", function () {
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    document.body.appendChild(btn);
    var onScroll = function () { btn.classList.toggle("show", window.scrollY > 600); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Lightbox: as telas são densas; clicar amplia
  function initLightbox() {
    var imgs = document.querySelectorAll(".device img");
    if (!imgs.length) return;
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML = '<button class="lightbox-close" type="button">×</button><img alt="">';
    document.body.appendChild(box);
    var big = box.querySelector("img");
    var closeBtn = box.querySelector(".lightbox-close");
    var opener = null;
    var close = function () {
      if (!box.classList.contains("open")) return;
      box.classList.remove("open");
      document.body.style.overflow = "";
      if (opener) opener.focus();
    };
    var open = function (im) {
      opener = im;
      big.src = im.currentSrc || im.src;
      big.alt = im.alt || "";
      box.setAttribute("aria-label", im.alt || "");
      box.classList.add("open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    };
    imgs.forEach(function (im) {
      // Telas dentro de um link (cards dos espaços) seguem o link; não abrem o lightbox
      if (im.closest("a")) return;
      // Ampliável também pelo teclado (WCAG 2.1.1)
      im.setAttribute("tabindex", "0");
      im.setAttribute("role", "button");
      im.addEventListener("click", function () { open(im); });
      im.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(im); }
      });
    });
    box.addEventListener("click", close);
    box.addEventListener("keydown", function (e) { if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); } });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  // Busca da FAQ (30 perguntas): filtra em tempo real, nos dois idiomas
  function initFaqSearch() {
    var list = document.querySelector(".faq-list");
    if (!list || !document.body.contains(list)) return;
    var container = list.parentElement;
    var wrap = document.createElement("div");
    wrap.className = "faq-search";
    wrap.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
      '<input type="search" id="faqSearch" autocomplete="off">';
    container.prepend(wrap);
    var input = wrap.querySelector("input");
    var setPh = function () {
      input.placeholder = document.documentElement.getAttribute("data-lang") === "en"
        ? "Search the FAQ…" : "Buscar na FAQ…";
    };
    setPh();
    document.getElementById("langBtn").addEventListener("click", function () { setTimeout(setPh, 0); });

    var empty = document.createElement("p");
    empty.className = "faq-empty";
    empty.innerHTML = t("Nenhuma pergunta encontrada.", "No questions found.");
    container.appendChild(empty);

    var items = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
    var cats = Array.prototype.slice.call(document.querySelectorAll(".faq-cat"));
    var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); };

    input.addEventListener("input", function () {
      var q = norm(input.value.trim());
      var hits = 0;
      items.forEach(function (it) {
        var show = !q || norm(it.textContent).indexOf(q) !== -1;
        it.style.display = show ? "" : "none";
        if (show) hits++;
      });
      // Esconde os títulos de categoria e as listas que ficaram sem resultado
      cats.forEach(function (c) { c.style.display = q ? "none" : ""; });
      document.querySelectorAll(".faq-list").forEach(function (l) {
        var vis = Array.prototype.slice.call(l.querySelectorAll(".faq-item"))
          .some(function (i) { return i.style.display !== "none"; });
        l.style.display = vis ? "" : "none";
      });
      empty.classList.toggle("show", hits === 0);
    });
  }

  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    // Grupos cujos filhos revelam em cascata (stagger por índice)
    var STAGGER = ["grid", "shot-row", "plans", "origin-steps", "hp-spaces", "bento", "hp-plans", "hp-videos"];
    function staggerDelay(el) {
      var p = el.parentElement;
      if (!p) return 0;
      for (var i = 0; i < STAGGER.length; i++) {
        if (p.classList.contains(STAGGER[i])) {
          return Array.prototype.indexOf.call(p.children, el) * 70;
        }
      }
      return 0;
    }
    var targets = Array.prototype.slice.call(
      document.querySelectorAll(".card, .split, figure.shot, .section-head, .example, .plan, .cta-band, .origin, .origin-step, .origin-arrow, .hp-reveal")
    );
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target, d = staggerDelay(el);
          if (d) setTimeout(function () { el.classList.add("in"); }, d);
          else el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) {
      t.classList.add("reveal");
      // Já visível no primeiro paint? Revela sem esperar o observer.
      if (t.getBoundingClientRect().top < window.innerHeight) t.classList.add("in");
      else io.observe(t);
    });
    // Rede de segurança: nada fica invisível se o observer não disparar (browsers embutidos etc.).
    setTimeout(function () {
      targets.forEach(function (t) { t.classList.add("in"); });
    }, 3000);
  }

  // Textos alternativos e rótulos que não têm versão duplicada por idioma no HTML:
  // o PT fica no atributo e o EN em data-alt-en / data-label-en (WCAG 3.1.2).
  function localizeLabels(lang) {
    var en = lang === "en";
    document.querySelectorAll("img[data-alt-en]").forEach(function (im) {
      if (!im.hasAttribute("data-alt-pt")) im.setAttribute("data-alt-pt", im.getAttribute("alt") || "");
      im.setAttribute("alt", en ? im.getAttribute("data-alt-en") : im.getAttribute("data-alt-pt"));
    });
    document.querySelectorAll("[data-label-en]").forEach(function (el) {
      if (!el.hasAttribute("data-label-pt")) el.setAttribute("data-label-pt", el.getAttribute("aria-label") || "");
      el.setAttribute("aria-label", en ? el.getAttribute("data-label-en") : el.getAttribute("data-label-pt"));
    });
    var top = document.querySelector(".to-top");
    if (top) top.setAttribute("aria-label", en ? "Back to top" : "Voltar ao topo");
    var lbClose = document.querySelector(".lightbox-close");
    if (lbClose) lbClose.setAttribute("aria-label", en ? "Close" : "Fechar");
  }

  function setLang(lang) {
    var root = document.documentElement;
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "en" ? "en" : "pt-BR");
    localizeLabels(lang);
    // Reajusta a altura das FAQs abertas (texto mudou de tamanho)
    document.querySelectorAll(".faq-item.open .faq-a").forEach(function (a) { a.style.maxHeight = a.scrollHeight + "px"; });
  }

  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".doc-side a[href^='#']"));
    if (!links.length) return;
    var targets = links.map(function (l) { return document.getElementById(l.getAttribute("href").slice(1)); }).filter(Boolean);
    function onScroll() {
      var pos = window.scrollY + 120;
      var currentId = null;
      targets.forEach(function (sec) { if (sec.offsetTop <= pos) currentId = sec.id; });
      links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + currentId); });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---- Boot -----------------------------------------------------------------
  function boot() {
    // Ano do rodapé (o HTML já traz um valor estático correto; isto só mantém
    // em dia quando o JS roda, sem precisar reconstruir o rodapé inteiro).
    var footYear = document.getElementById("footYear");
    if (footYear) footYear.textContent = new Date().getFullYear();
    wire();
    localizeLabels(document.documentElement.getAttribute("data-lang") || "pt");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
