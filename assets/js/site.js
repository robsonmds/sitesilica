/* ============================================================================
   Silica site — script único (self-contained).
   Injeta header/footer compartilhados e liga tema, idioma, menu, FAQ, scroll-spy.
   ========================================================================== */
(function () {
  "use strict";

  var STORE_URL = "https://play.google.com/store/apps/details?id=com.nosbor.silica&hl=pt_BR";
  var SUPPORT_EMAIL = "ro_bs_on@outlook.com";

  // ---- ícones (SVG inline) --------------------------------------------------
  var IC = {
    logo: '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 2 3 9v14l13 7 13-7V9L16 2Z" fill="url(#lg)"/><path d="M16 9.5 9 13v6l7 3.5 7-3.5v-6L16 9.5Z" fill="#fff" fill-opacity=".22"/><path d="M13 12.5c-1.6 0-2.6 1-2.6 2.2 0 2.6 5 1.6 5 3.2 0 .6-.6 1-1.5 1-1 0-1.6-.5-1.7-1.2H10c.1 1.9 1.6 3 3.9 3 2.1 0 3.6-1.1 3.6-2.9 0-2.8-5-1.8-5-3.3 0-.5.5-.8 1.3-.8.8 0 1.4.4 1.5 1.1h2.2c-.1-1.7-1.5-2.8-3.5-2.8Z" fill="#fff"/><defs><linearGradient id="lg" x1="3" y1="2" x2="29" y2="30" gradientUnits="userSpaceOnUse"><stop stop-color="#16a34a"/><stop offset="1" stop-color="#0891b2"/></linearGradient></defs></svg>',
    sun: '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    chevDown: '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="#00C3FF" d="M3.4 2.3c-.25.26-.4.66-.4 1.17v17.06c0 .5.15.9.4 1.17l.06.05L13 12.06v-.11L3.46 2.25l-.06.05z"/><path fill="#00E676" d="M16.2 15.28 13 12.06v-.11l3.2-3.22.07.04 3.79 2.15c1.08.61 1.08 1.62 0 2.24l-3.79 2.15-.07.04z"/><path fill="#FF3D57" d="m16.27 15.24-3.27-3.24-9.6 9.6c.36.37.94.42 1.6.05l11.27-6.41"/><path fill="#FFC400" d="M16.27 8.76 5 2.35C4.34 1.98 3.76 2.03 3.4 2.4l9.6 9.6 3.27-3.24z"/></svg>'
  };

  var NAV = [
    { href: "index.html", pt: "Início", en: "Home" },
    { href: "comecar.html", pt: "Começar", en: "Get started" },
    { href: "perfis.html", pt: "Perfis", en: "Profiles" },
    { drop: true, pt: "Recursos", en: "Features", items: [
      { href: "financas.html", ic: "💰", pt: "Finanças (Pessoal & Negócios)", en: "Finances (Personal & Business)" },
      { href: "vendas.html", ic: "📦", pt: "Silica Vendas", en: "Silica Sales" },
      { href: "servicos.html", ic: "🔧", pt: "Silica Serviços", en: "Silica Services" },
      { href: "raiox.html", ic: "📊", pt: "Raio-X", en: "X-Ray" },
      { href: "notificacoes.html", ic: "🔔", pt: "Notificações (Sentinela)", en: "Notifications (Sentinel)" },
      { href: "seguranca-backup.html", ic: "🔒", pt: "Segurança & Backup", en: "Security & Backup" },
      { href: "temas.html", ic: "🎨", pt: "Temas & Modo Zen", en: "Themes & Zen Mode" }
    ]},
    { href: "regras-de-negocio.html", pt: "Regras", en: "Business rules" },
    { href: "planos.html", pt: "Planos", en: "Plans" },
    { href: "faq.html", pt: "FAQ", en: "FAQ" },
    { href: "contato.html", pt: "Contato", en: "Contact" }
  ];

  function t(pt, en) { return '<span data-lang="pt">' + pt + '</span><span data-lang="en">' + en + '</span>'; }
  var current = (location.pathname.split("/").pop() || "index.html") || "index.html";

  // ---- Header ---------------------------------------------------------------
  function buildHeader() {
    var links = "";
    NAV.forEach(function (n) {
      if (n.drop) {
        var items = n.items.map(function (it) {
          return '<a href="' + it.href + '"><span class="ic">' + it.ic + '</span>' + t(it.pt, it.en) + "</a>";
        }).join("");
        var activeChild = n.items.some(function (it) { return it.href === current; });
        links += '<div class="nav-drop' + (activeChild ? " has-active" : "") + '">' +
          '<button type="button" aria-haspopup="true" aria-expanded="false">' + t(n.pt, n.en) + IC.chevDown + "</button>" +
          '<div class="nav-drop-menu">' + items + "</div></div>";
      } else {
        var active = n.href === current ? " active" : "";
        links += '<a class="' + active.trim() + '" href="' + n.href + '">' + t(n.pt, n.en) + "</a>";
      }
    });

    var header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML =
      '<div class="container"><div class="nav">' +
        '<a class="nav-logo" href="index.html">' + IC.logo + '<span class="brand-word">Silica</span></a>' +
        '<button class="icon-btn nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false">' + IC.menu + "</button>" +
        '<nav class="nav-links">' + links + "</nav>" +
        '<div class="nav-actions">' +
          '<button class="icon-btn lang-btn" id="langBtn" aria-label="Trocar idioma">' + IC.globe +
            '<span data-lang="pt">EN</span><span data-lang="en">PT</span></button>' +
          '<button class="icon-btn theme-btn" id="themeBtn" aria-label="Tema claro/escuro">' + IC.sun + IC.moon + "</button>" +
        "</div>" +
      "</div></div>";
    document.body.prepend(header);
  }

  // ---- Footer ---------------------------------------------------------------
  function buildFooter() {
    var year = new Date().getFullYear();
    var footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML =
      '<div class="container"><div class="footer-grid">' +
        '<div class="footer-brand">' +
          '<a class="nav-logo" href="index.html">' + IC.logo + '<span class="brand-word">Silica</span></a>' +
          "<p>" + t(
            "Gestão financeira inteligente para sua vida pessoal, seu negócio, suas vendas e seus serviços — tudo em espaços isolados, no seu Android.",
            "Smart money management for your personal life, business, sales and services — all in isolated spaces, on your Android."
          ) + "</p>" +
          '<div style="margin-top:16px">' + storeButton() + "</div>" +
        "</div>" +
        '<div class="footer-col"><h4>' + t("Produto", "Product") + "</h4>" +
          '<a href="index.html">' + t("Início", "Home") + "</a>" +
          '<a href="comecar.html">' + t("Começar", "Get started") + "</a>" +
          '<a href="perfis.html">' + t("Perfis", "Profiles") + "</a>" +
          '<a href="planos.html">' + t("Planos", "Plans") + "</a></div>" +
        '<div class="footer-col"><h4>' + t("Recursos", "Features") + "</h4>" +
          '<a href="financas.html">' + t("Finanças", "Finances") + "</a>" +
          '<a href="vendas.html">' + t("Vendas", "Sales") + "</a>" +
          '<a href="servicos.html">' + t("Serviços", "Services") + "</a>" +
          '<a href="raiox.html">' + t("Raio-X", "X-Ray") + "</a>" +
          '<a href="notificacoes.html">' + t("Notificações", "Notifications") + "</a>" +
          '<a href="seguranca-backup.html">' + t("Segurança & Backup", "Security & Backup") + "</a>" +
          '<a href="temas.html">' + t("Temas", "Themes") + "</a></div>" +
        '<div class="footer-col"><h4>' + t("Ajuda & Legal", "Help & Legal") + "</h4>" +
          '<a href="regras-de-negocio.html">' + t("Regras de negócio", "Business rules") + "</a>" +
          '<a href="faq.html">FAQ</a>' +
          '<a href="contato.html">' + t("Contato", "Contact") + "</a>" +
          '<a href="privacidade.html">' + t("Privacidade", "Privacy") + "</a>" +
          '<a href="termos.html">' + t("Termos de Uso", "Terms of Use") + "</a></div>" +
      "</div>" +
      '<div class="footer-bottom">' +
        "<span>© " + year + ' Silica · ' + t("Feito com foco e simplicidade.", "Built with focus and simplicity.") + "</span>" +
        "<span>" + t("Disponível para Android.", "Available for Android.") + "</span>" +
      "</div></div>";
    document.body.appendChild(footer);
  }

  function storeButton() {
    return '<a class="btn-store" href="' + STORE_URL + '" target="_blank" rel="noopener">' + IC.play +
      "<span><small>" + t("Baixar na", "Get it on") + '</small><b>Google Play</b></span></a>';
  }

  // ---- Interações -----------------------------------------------------------
  function wire() {
    var root = document.documentElement;

    // Tema
    var themeBtn = document.getElementById("themeBtn");
    if (themeBtn) themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("silica-theme", next); } catch (e) {}
    });

    // Idioma
    var langBtn = document.getElementById("langBtn");
    if (langBtn) langBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-lang") === "en" ? "pt" : "en";
      setLang(next);
      try { localStorage.setItem("silica-lang", next); } catch (e) {}
    });

    // Menu mobile
    var navToggle = document.getElementById("navToggle");
    if (navToggle) navToggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Dropdown (clique — importante no mobile e para acessibilidade)
    document.querySelectorAll(".nav-drop > button").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var drop = btn.parentElement;
        var willOpen = !drop.classList.contains("open");
        document.querySelectorAll(".nav-drop.open").forEach(function (d) { d.classList.remove("open"); });
        drop.classList.toggle("open", willOpen);
        btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    });
    document.addEventListener("click", function () {
      document.querySelectorAll(".nav-drop.open").forEach(function (d) { d.classList.remove("open"); });
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
  }

  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    var targets = Array.prototype.slice.call(
      document.querySelectorAll(".card, .split, figure.shot, .section-head, .example, .plan, .cta-band")
    );
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
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

  function setLang(lang) {
    var root = document.documentElement;
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "en" ? "en" : "pt-BR");
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
    buildHeader();
    buildFooter();
    // Insere botão da loja em quaisquer slots [data-store]
    document.querySelectorAll("[data-store]").forEach(function (el) { el.innerHTML = storeButton(); });
    document.querySelectorAll("[data-email]").forEach(function (el) { el.textContent = SUPPORT_EMAIL; el.setAttribute("href", "mailto:" + SUPPORT_EMAIL); });
    wire();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
