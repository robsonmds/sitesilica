/*
 * Gera o header e o rodapé estáticos de todas as páginas HTML do site a
 * partir dos dados abaixo (NAV/THEMES) e grava direto no HTML-fonte.
 *
 * Por quê: o header/rodapé não são mais montados em runtime por JS (isso
 * deixava menu, rodapé, botão da loja e e-mail invisíveis para crawlers
 * que não executam JavaScript, incluindo boa parte dos crawlers de IA).
 * Agora existem como HTML de verdade em cada página; este script existe
 * só para não precisar editar as 17 páginas à mão sempre que o menu,
 * os temas ou o rodapé mudarem.
 *
 * Uso: node tools/gen-static-header.mjs
 * É idempotente — pode rodar de novo a qualquer momento; ele substitui o
 * <header class="site-header">...</header> e o <footer class="site-footer">...</footer>
 * existentes em vez de duplicá-los.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = path.dirname(path.dirname(fileURLToPath(import.meta.url))); // raiz do site (pai de /tools)
const STORE_URL = "https://play.google.com/store/apps/details?id=com.nosbor.silica&hl=pt_BR";
const SUPPORT_EMAIL = "ro_bs_on@outlook.com";
const MAILTO = "mailto:" + SUPPORT_EMAIL + "?subject=" + encodeURIComponent("Silica — Suporte");

const IC = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  chevDown: '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9c0-1.1-.9-1.7-2-1.7h-1.8a2.5 2.5 0 0 1 0-5H18a1.8 1.8 0 0 0 1.6-2.7A9 9 0 0 0 12 3Z"/><circle cx="7.3" cy="10.2" r="1.15" fill="currentColor" stroke="none"/><circle cx="9.3" cy="15.3" r="1.15" fill="currentColor" stroke="none"/><circle cx="14.5" cy="16.4" r="1.15" fill="currentColor" stroke="none"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="#00C3FF" d="M3.4 2.3c-.25.26-.4.66-.4 1.17v17.06c0 .5.15.9.4 1.17l.06.05L13 12.06v-.11L3.46 2.25l-.06.05z"/><path fill="#00E676" d="M16.2 15.28 13 12.06v-.11l3.2-3.22.07.04 3.79 2.15c1.08.61 1.08 1.62 0 2.24l-3.79 2.15-.07.04z"/><path fill="#FF3D57" d="m16.27 15.24-3.27-3.24-9.6 9.6c.36.37.94.42 1.6.05l11.27-6.41"/><path fill="#FFC400" d="M16.27 8.76 5 2.35C4.34 1.98 3.76 2.03 3.4 2.4l9.6 9.6 3.27-3.24z"/></svg>'
};

const NAV = [
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

const THEMES = [
  { id: "light", color: "#16a34a", pt: "Claro", en: "Light" },
  { id: "dark", color: "#34d399", pt: "Escuro", en: "Dark" },
  { id: "zen", color: "#5C7A63", pt: "Zen", en: "Zen" },
  { id: "ouro", color: "#D6A94A", pt: "Ouro", en: "Gold" },
  { id: "rosa", color: "#C6685C", pt: "Rosa", en: "Pink" },
  { id: "grafite", color: "#2FBF8F", pt: "Grafite & Esmeralda", en: "Graphite & Emerald", defaultActive: true }
];

function t(pt, en) { return '<span data-lang="pt" lang="pt-BR">' + pt + '</span><span data-lang="en" lang="en">' + en + '</span>'; }

function themeMenuHTML() {
  return THEMES.map(function (th) {
    var cls = th.defaultActive ? ' class="active"' : "";
    var current = th.defaultActive ? ' aria-current="true"' : "";
    return '<button type="button" data-theme-choice="' + th.id + '"' + cls + current + '>' +
      '<span class="theme-dot" style="background:' + th.color + '"></span>' + t(th.pt, th.en) + "</button>";
  }).join("");
}

function buildHeader(current) {
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

  return '<header class="site-header"><div class="container"><div class="nav">' +
      '<a class="nav-logo" href="index.html"><img src="assets/img/logo-mark.png" alt="" width="256" height="256"><span class="brand-word">Silica</span></a>' +
      '<button class="icon-btn nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false">' + IC.menu + "</button>" +
      '<nav class="nav-links">' + links + "</nav>" +
      '<div class="nav-actions">' +
        '<button class="icon-btn lang-btn" id="langBtn" aria-label="Trocar idioma">' + IC.globe +
          '<span data-lang="pt" lang="pt-BR">EN</span><span data-lang="en" lang="en">PT</span></button>' +
        '<div class="nav-drop theme-drop">' +
          '<button class="icon-btn theme-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Tema">' + IC.palette + "</button>" +
          '<div class="nav-drop-menu theme-menu">' + themeMenuHTML() + "</div>" +
        "</div>" +
      "</div>" +
    "</div></div></header>";
}

function storeButtonHTML() {
  return '<a class="btn-store" href="' + STORE_URL + '" target="_blank" rel="noopener">' + IC.play +
    "<span><small>" + t("Baixar na", "Get it on") + '</small><b>Google Play</b></span></a>';
}

function buildFooter() {
  return '<footer class="site-footer"><div class="container"><div class="footer-grid">' +
      '<div class="footer-brand">' +
        '<a class="nav-logo" href="index.html"><img src="assets/img/logo-mark.png" alt="" width="256" height="256"><span class="brand-word">Silica</span></a>' +
        "<p>" + t(
          "Gestão financeira inteligente para sua vida pessoal, seu negócio, suas vendas e seus serviços: tudo em espaços isolados, no seu Android.",
          "Smart money management for your personal life, business, sales and services: all in isolated spaces, on your Android."
        ) + "</p>" +
        '<div style="margin-top:16px">' + storeButtonHTML() + "</div>" +
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
      '<span>© <span id="footYear">2026</span> Silica · ' + t("Feito com foco e simplicidade.", "Built with focus and simplicity.") + "</span>" +
      "<span>" + t("Disponível para Android.", "Available for Android.") + "</span>" +
    "</div></div></footer>";
}

const HEADER_RE = /<header class="site-header">[\s\S]*?<\/header>/;
const FOOTER_RE = /<footer class="site-footer">[\s\S]*?<\/footer>/;
const SKIP_LINK_RE = /(<a class="skip-link"[^>]*>[\s\S]*?<\/a>)/;

const files = fs.readdirSync(SITE).filter((f) => f.endsWith(".html"));
let report = [];

for (const file of files) {
  const full = path.join(SITE, file);
  let html = fs.readFileSync(full, "utf8");

  const headerHTML = buildHeader(file);
  const footerHTML = buildFooter();

  if (HEADER_RE.test(html)) {
    html = html.replace(HEADER_RE, headerHTML);
  } else if (SKIP_LINK_RE.test(html)) {
    html = html.replace(SKIP_LINK_RE, "$1\n" + headerHTML);
  } else {
    throw new Error("Não achei onde inserir o header em " + file);
  }

  if (FOOTER_RE.test(html)) {
    html = html.replace(FOOTER_RE, footerHTML);
  } else {
    html = html.replace("</body>", footerHTML + "\n</body>");
  }

  fs.writeFileSync(full, html, "utf8");
  report.push(file + ": OK");
}

console.log(report.join("\n"));
