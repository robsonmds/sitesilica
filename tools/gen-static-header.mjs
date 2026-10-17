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
const STORE_URL = "https://play.google.com/store/apps/details?id=com.nosbor.silica&hl=pt_BR&referrer=utm_source%3Dsilica.app.br%26utm_medium%3Dsite%26utm_campaign%3Dbotao_loja";
// Silica para iPhone publicado em 06/10/2026 (id conferido em itunes.apple.com/lookup?bundleId=br.app.silica).
// Os botões fora do header/rodapé (hero, CTA) repetem este mesmo HTML: grep btn-appstore.
const APP_STORE_URL = "https://apps.apple.com/br/app/silica/id6817602266?pt=129536197&amp;ct=site_botao&amp;mt=8";
// pt = provider token da conta Apple (gerado em App Store Connect > Analytics > Campanhas); ct = campanha.
// Cada pagina tambem tem, antes de </body>, o beacon do Cloudflare Web Analytics, e a CSP libera
// static.cloudflareinsights.com (script) e cloudflareinsights.com (connect). Pagina nova: copiar os dois.
const SUPPORT_EMAIL = "ro_bs_on@outlook.com";
const MAILTO = "mailto:" + SUPPORT_EMAIL + "?subject=" + encodeURIComponent("Silica — Suporte");

const IC = {
  menu: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  chevDown: '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  globe: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>',
  // Botão de tema: o sol aparece no Glass (leva ao claro); a lua aparece no claro (leva ao Glass).
  sun: '<svg class="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>',
  moon: '<svg class="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="#00C3FF" d="M3.4 2.3c-.25.26-.4.66-.4 1.17v17.06c0 .5.15.9.4 1.17l.06.05L13 12.06v-.11L3.46 2.25l-.06.05z"/><path fill="#00E676" d="M16.2 15.28 13 12.06v-.11l3.2-3.22.07.04 3.79 2.15c1.08.61 1.08 1.62 0 2.24l-3.79 2.15-.07.04z"/><path fill="#FF3D57" d="m16.27 15.24-3.27-3.24-9.6 9.6c.36.37.94.42 1.6.05l11.27-6.41"/><path fill="#FFC400" d="M16.27 8.76 5 2.35C4.34 1.98 3.76 2.03 3.4 2.4l9.6 9.6 3.27-3.24z"/></svg>'
};

const NAV = [
  { href: "index.html", pt: "Início", en: "Home" },
  { href: "comecar.html", pt: "Começar", en: "Get started" },
  { href: "perfis.html", pt: "Perfis", en: "Profiles" },
  { drop: true, pt: "Recursos", en: "Features", items: [
    { href: "financas.html", pt: "Finanças (Pessoal & Negócios)", en: "Finances (Personal & Business)" },
    { href: "vendas.html", pt: "Silica Vendas", en: "Silica Sales" },
    { href: "servicos.html", pt: "Silica Serviços", en: "Silica Services" },
    { href: "raiox.html", pt: "Raio-X", en: "X-Ray" },
    { href: "notificacoes.html", pt: "Notificações (Sentinela)", en: "Notifications (Sentinel)" },
    { href: "seguranca-backup.html", pt: "Segurança & Backup", en: "Security & Backup" },
    { href: "temas.html", pt: "Temas & Modo Zen", en: "Themes & Zen Mode" }
  ]},
  { href: "regras-de-negocio.html", pt: "Regras", en: "Business rules" },
  { href: "planos.html", pt: "Planos", en: "Plans" },
  { href: "faq.html", pt: "FAQ", en: "FAQ" },
  { href: "contato.html", pt: "Contato", en: "Contact" }
];

// Tema do site: "Silica Glass" (escuro, padrão) e claro. O menu de 6 temas (v5) virou um botão;
// valores antigos salvos no navegador (grafite, dark, zen, ouro, rosa) caem no Glass pelo CSS.

function t(pt, en) { return '<span data-lang="pt" lang="pt-BR">' + pt + '</span><span data-lang="en" lang="en">' + en + '</span>'; }

function buildHeader(current) {
  var links = "";
  NAV.forEach(function (n) {
    if (n.drop) {
      var items = n.items.map(function (it) {
        return '<a href="' + it.href + '">' + t(it.pt, it.en) + "</a>";
      }).join("");
      var activeChild = n.items.some(function (it) { return it.href === current; });
      links += '<div class="nav-drop' + (activeChild ? " has-active" : "") + '">' +
        '<button type="button" aria-expanded="false" aria-controls="menu-recursos">' + t(n.pt, n.en) + IC.chevDown + "</button>" +
        '<div class="nav-drop-menu" id="menu-recursos">' + items + "</div></div>";
    } else {
      var active = n.href === current ? " active" : "";
      links += '<a class="' + active.trim() + '" href="' + n.href + '">' + t(n.pt, n.en) + "</a>";
    }
  });

  return '<header class="site-header"><div class="container"><div class="nav">' +
      '<a class="nav-logo" href="index.html"><img src="assets/img/logo-mark.png" alt="" width="256" height="256"><span class="brand-word">Silica</span></a>' +
      '<button class="icon-btn nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false" aria-controls="site-nav">' + IC.menu + "</button>" +
      '<nav class="nav-links" id="site-nav">' + links + "</nav>" +
      '<div class="nav-actions">' +
        '<button class="icon-btn lang-btn" id="langBtn" type="button">' + IC.globe +
          '<span data-lang="pt" lang="pt-BR"><span class="sr-only">Mudar idioma para </span>EN</span>' +
          '<span data-lang="en" lang="en"><span class="sr-only">Switch language to </span>PT</span></button>' +
        '<button class="icon-btn theme-toggle" id="themeBtn" type="button" aria-pressed="false">' + IC.sun + IC.moon +
          '<span class="sr-only">' + t("Tema claro", "Light theme") + "</span></button>" +
      "</div>" +
    "</div></div></header>";
}

// Selo oficial da Apple, arte sem alteração, baixada de toolbox.marketingtools.apple.com.
// Regras da Apple: com selos de outras lojas ao lado, usar o selo preto e colocar a App Store primeiro.
function appStoreBadgeHTML() {
  return '<a class="btn-appstore" href="' + APP_STORE_URL + '" target="_blank" rel="noopener">' +
      '<img data-lang="pt" lang="pt-BR" src="assets/img/badges/app-store-pt-br.svg" alt="Baixar na App Store" width="120" height="40">' +
      '<img data-lang="en" lang="en" src="assets/img/badges/app-store-en-us.svg" alt="Download on the App Store" width="120" height="40">' +
    "</a>";
}

function storeButtonHTML() {
  return '<div class="store-row">' + appStoreBadgeHTML() +
    '<a class="btn-store" href="' + STORE_URL + '" target="_blank" rel="noopener">' + IC.play +
      "<span><small>" + t("Baixar na", "Get it on") + '</small><b>Google Play</b></span></a>' +
    "</div>";
}

function buildFooter() {
  return '<footer class="site-footer"><div class="container"><div class="footer-grid">' +
      '<div class="footer-brand">' +
        '<a class="nav-logo" href="index.html"><img src="assets/img/logo-mark.png" alt="" width="256" height="256"><span class="brand-word">Silica</span></a>' +
        "<p>" + t(
          "Gestão financeira inteligente para sua vida pessoal, seu negócio, suas vendas e seus serviços: tudo em espaços isolados, no seu Android ou iPhone.",
          "Smart money management for your personal life, business, sales and services: all in isolated spaces, on your Android or iPhone."
        ) + "</p>" +
        '<div style="margin-top:16px">' + storeButtonHTML() + "</div>" +
      "</div>" +
      '<div class="footer-col"><h2 class="footer-h">' + t("Produto", "Product") + "</h2>" +
        '<a href="index.html">' + t("Início", "Home") + "</a>" +
        '<a href="comecar.html">' + t("Começar", "Get started") + "</a>" +
        '<a href="perfis.html">' + t("Perfis", "Profiles") + "</a>" +
        '<a href="planos.html">' + t("Planos", "Plans") + "</a></div>" +
      '<div class="footer-col"><h2 class="footer-h">' + t("Recursos", "Features") + "</h2>" +
        '<a href="financas.html">' + t("Finanças", "Finances") + "</a>" +
        '<a href="vendas.html">' + t("Vendas", "Sales") + "</a>" +
        '<a href="servicos.html">' + t("Serviços", "Services") + "</a>" +
        '<a href="raiox.html">' + t("Raio-X", "X-Ray") + "</a>" +
        '<a href="notificacoes.html">' + t("Notificações", "Notifications") + "</a>" +
        '<a href="seguranca-backup.html">' + t("Segurança & Backup", "Security & Backup") + "</a>" +
        '<a href="temas.html">' + t("Temas", "Themes") + "</a></div>" +
      '<div class="footer-col"><h2 class="footer-h">' + t("Ajuda & Legal", "Help & Legal") + "</h2>" +
        '<a href="regras-de-negocio.html">' + t("Regras de negócio", "Business rules") + "</a>" +
        '<a href="faq.html">FAQ</a>' +
        '<a href="contato.html">' + t("Contato", "Contact") + "</a>" +
        '<a href="privacidade.html">' + t("Privacidade", "Privacy") + "</a>" +
        '<a href="termos.html">' + t("Termos de Uso", "Terms of Use") + "</a></div>" +
    "</div>" +
    '<div class="footer-bottom">' +
      '<span>© <span id="footYear">2026</span> Silica · ' + t("Feito com foco e simplicidade.", "Built with focus and simplicity.") + "</span>" +
      "<span>" + t("Disponível para Android e iPhone.", "Available for Android and iPhone.") + "</span>" +
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
