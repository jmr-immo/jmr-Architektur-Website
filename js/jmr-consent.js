/*
 * jmr Architektur – Datenschutz-/Cookie-Einwilligung (eigene kleine CMP)
 * --------------------------------------------------------------------------
 * - Opt-in: Ohne Einwilligung wird nichts geladen, keine Cookies, keine Datenuebertragung.
 * - Ebene 1: vollbreite Leiste unten (nicht blockierend, Seite bleibt sichtbar).
 *   Ebene 2: zentriertes Fenster mit An-/Aus-Schaltern pro Kategorie.
 * - "Alle akzeptieren" und "Nur notwendige" sind gleichwertig (rechtlich wichtig).
 * - Auswahl wird lokal gespeichert (localStorage). Aenderung jederzeit ueber
 *   window.jmrConsent.open() (Link in der Datenschutzerklaerung).
 *
 * >>> GO-LIVE / SPAETER: In CONFIG die IDs eintragen (googleAdsId, conversionSendTo,
 *     ga4Id, clarityId). Solange ein Feld LEER ist, wird der jeweilige Dienst NICHT
 *     geladen – das Banner funktioniert trotzdem vollstaendig. <<<
 *
 * Conversion-Ausloeser fuers Kontaktformular: window.jmrTrackConversion()
 *
 * Meta-Pixel (Facebook/Instagram): liegt in CONFIG.metaPixelId, laeuft auf allen Seiten
 * dieser Website und erst nach Einwilligung in die Kategorie "Marketing". Einzelne
 * Seiten koennen ihn abschalten mit window.jmrMetaPixel = false im <head> vor diesem
 * Skript. Bewusst KEIN <noscript>-Zaehlpixel, denn das wuerde ohne Einwilligung feuern.
 */
(function () {
  'use strict';

  // ===== Konfiguration =====
  var CONFIG = {
    storageKey: 'jmr-arch-consent-v1',
    categories: [
      {
        id: 'necessary',
        name: 'Notwendig',
        required: true,
        desc: 'Für den Betrieb der Website erforderlich. Hierfür werden aktuell keine Cookies gesetzt. Diese Kategorie lässt sich nicht deaktivieren.'
      },
      {
        id: 'statistics',
        name: 'Statistik',
        required: false,
        desc: 'Anonyme Auswertung der Nutzung mit Google Analytics und Microsoft Clarity: Seitenaufrufe, Verweildauer und Klicks sowie pseudonyme Sitzungsaufzeichnungen und Heatmaps (Maus- und Scroll-Verhalten; Inhalte von Formulareingaben werden dabei ausgeblendet). Hilft uns, die Website zu verbessern. Die IP-Adresse wird anonymisiert. Dabei werden Cookies gesetzt.'
      },
      {
        id: 'marketing',
        name: 'Marketing',
        required: false,
        desc: 'Misst, wie gut unsere Werbeanzeigen funktionieren (z. B. Google Ads und der Meta-Pixel für Anzeigen auf Facebook und Instagram), und ermöglicht es, Ihnen passende Anzeigen auszuspielen. Dabei werden Cookies gesetzt und Daten an die jeweiligen Anbieter übertragen, auch in die USA.'
      }
    ],
    // === Beim Go-live eintragen (solange leer, wird nichts geladen) ===
    googleAdsId: '',        // z. B. 'AW-XXXXXXXXXX'
    conversionSendTo: '',   // z. B. 'AW-XXXXXXXXXX/xxxxxxxxxxxxxxxx'
    ga4Id: 'G-QBT976RCEC',  // GA4 jmr Architektur
    clarityId: 'xke0kr03ej', // Clarity jmr Architektur
    // Meta-Pixel (Facebook/Instagram), ein Dataset fuer die gesamte Website. Die
    // Trennung einzelner Kampagnen passiert nicht hier, sondern im Werbekonto ueber
    // URL-Regeln (Custom Audience / Custom Conversion). Eine einzelne Seite kann den
    // Pixel abschalten mit <script>window.jmrMetaPixel = false;</script> im <head>.
    metaPixelId: '1080170527794612'
  };

  // ===== gtag-Grundgerüst + Consent Mode v2 (Standard: alles abgelehnt) =====
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (!window.gtag) { window.gtag = gtag; }

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  // ===== Tags laden (pro Kategorie) =====
  var gtagLibLoaded = false, adsConfigured = false, ga4Configured = false;
  function ensureGtagLib(seedId) {
    if (gtagLibLoaded || !seedId) { return; }
    gtagLibLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + seedId;
    document.head.appendChild(s);
    window.gtag('js', new Date());
  }
  function loadGoogleAds() {            // Kategorie "marketing"
    if (!CONFIG.googleAdsId) { return; }
    ensureGtagLib(CONFIG.googleAdsId);
    if (adsConfigured) { return; }
    adsConfigured = true;
    window.gtag('config', CONFIG.googleAdsId);
  }
  function loadGA4() {                  // Kategorie "statistics"
    if (!CONFIG.ga4Id) { return; }
    ensureGtagLib(CONFIG.ga4Id);
    if (ga4Configured) { return; }
    ga4Configured = true;
    window.gtag('config', CONFIG.ga4Id, { anonymize_ip: true });
  }
  var clarityLoaded = false;
  function loadClarity() {              // Kategorie "statistics"
    if (clarityLoaded || !CONFIG.clarityId) { return; }
    clarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CONFIG.clarityId);
  }

  // ===== Meta-Pixel (Facebook/Instagram) – Kategorie "marketing" =====
  // Laeuft auf allen Seiten, aber erst nach ausdruecklicher Einwilligung in die
  // Kategorie "marketing". window.jmrMetaPixel === false schaltet ihn seitenweise ab.
  var metaLoaded = false;
  function metaAktiv() {
    return !!CONFIG.metaPixelId && window.jmrMetaPixel !== false;
  }
  function loadMetaPixel() {
    if (metaLoaded || !metaAktiv()) { return; }
    metaLoaded = true;
    /* Original-Ladecode von Meta, unveraendert bis auf die Formatierung. */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) { return; }
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) { f._fbq = n; }
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('consent', 'grant');
    window.fbq('init', CONFIG.metaPixelId);
    window.fbq('track', 'PageView');
  }
  function stopMetaPixel() {
    /* Widerruf: Meta darf ab sofort nichts mehr senden, gesetzte Pixel-Cookies loeschen. */
    if (typeof window.fbq === 'function') {
      try { window.fbq('consent', 'revoke'); } catch (e) {}
    }
    ['_fbp', '_fbc'].forEach(function (name) {
      document.cookie = name + '=; Max-Age=0; path=/';
      document.cookie = name + '=; Max-Age=0; path=/; domain=.' + location.hostname;
    });
  }

  // ===== Einwilligung anwenden =====
  function applyConsent(state) {
    var marketing = !!state.marketing;
    var statistics = !!state.statistics;
    window.gtag('consent', 'update', {
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
      analytics_storage: statistics ? 'granted' : 'denied'
    });
    if (statistics) { loadGA4(); loadClarity(); }
    if (marketing) { loadGoogleAds(); loadMetaPixel(); }
    else { stopMetaPixel(); }
  }

  // ===== Auswahl lesen/speichern =====
  function readState() {
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function saveState(state) {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch (e) {}
  }
  function defaultState() { return { necessary: true, statistics: false, marketing: false }; }
  function currentState() { return readState() || defaultState(); }

  function commit(state) {
    state.necessary = true;
    saveState(state);
    applyConsent(state);
    hideAll();
  }
  function acceptAll() {
    var state = { necessary: true };
    CONFIG.categories.forEach(function (c) { state[c.id] = true; });
    commit(state);
  }
  function denyAll() {
    var state = { necessary: true };
    CONFIG.categories.forEach(function (c) { if (!c.required) { state[c.id] = false; } });
    commit(state);
  }
  function saveSelection() {
    var state = { necessary: true };
    var boxes = document.querySelectorAll('#jmr-consent-modal input[data-cat]');
    for (var i = 0; i < boxes.length; i++) {
      state[boxes[i].getAttribute('data-cat')] = boxes[i].checked;
    }
    commit(state);
  }

  // ===== Conversion-/Event-Auslöser =====
  window.jmrTrackConversion = function () {
    var st = readState();
    if (st && st.marketing && CONFIG.conversionSendTo && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { 'send_to': CONFIG.conversionSendTo });
    }
  };
  window.jmrTrackEvent = function (name, params) {
    var st = readState();
    if (st && st.statistics && typeof window.gtag === 'function') {
      window.gtag('event', name, params || {});
    }
  };
  /* Meta-Pixel: "Lead" bei erfolgreich abgeschicktem Kontaktformular.
     Es werden keine Formularinhalte uebergeben, nur die Tatsache der Anfrage. */
  window.jmrTrackLead = function () {
    var st = readState();
    if (st && st.marketing && metaAktiv() && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead');
    }
  };
  document.addEventListener('jmr:gesendet', function () { window.jmrTrackLead(); });

  // ===== UI: Ebene 1 – vollbreite Leiste unten =====
  var bannerEl = null;
  function buildBanner() {
    if (bannerEl) { return; }
    var bar = document.createElement('div');
    bar.id = 'jmr-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Datenschutz-Einstellungen');
    bar.innerHTML =
      '<div class="jmrc-bar">' +
        '<div class="jmrc-bar-text">' +
          '<span class="jmrc-lead">Datenschutz-Einstellungen</span>' +
          '<p class="jmrc-text">Wir verwenden Cookies und ähnliche Technologien. Einige sind für den Betrieb der Website nötig, andere nutzen wir nur mit Ihrer Einwilligung, etwa um die Wirksamkeit unserer Werbung zu messen. Mehr dazu in der <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a>.</p>' +
        '</div>' +
        '<div class="jmrc-actions">' +
          '<button type="button" id="jmrc-settings" class="jmrc-link">Einstellungen anpassen</button>' +
          '<button type="button" id="jmrc-deny" class="jmrc-btn jmrc-ghost">Nur notwendige</button>' +
          '<button type="button" id="jmrc-accept" class="jmrc-btn jmrc-accent">Alle akzeptieren</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);
    bannerEl = bar;
    bar.querySelector('#jmrc-accept').addEventListener('click', acceptAll);
    bar.querySelector('#jmrc-deny').addEventListener('click', denyAll);
    bar.querySelector('#jmrc-settings').addEventListener('click', openSettings);
  }
  function showBanner() { buildBanner(); bannerEl.style.display = 'block'; }
  function hideBanner() { if (bannerEl) { bannerEl.style.display = 'none'; } }

  // ===== UI: Ebene 2 – Einstellungs-Fenster =====
  var modalEl = null;
  function catRowsHtml() {
    var st = currentState();
    return CONFIG.categories.map(function (cat) {
      var attrs = 'data-cat="' + cat.id + '"';
      if (cat.required) { attrs += ' checked disabled'; }
      else if (st[cat.id]) { attrs += ' checked'; }
      return '' +
        '<div class="jmrc-cat">' +
          '<div class="jmrc-cat-head">' +
            '<span class="jmrc-cat-name">' + cat.name + '</span>' +
            '<label class="jmrc-switch"><input type="checkbox" ' + attrs + '><span class="jmrc-slider"></span></label>' +
          '</div>' +
          '<p class="jmrc-cat-desc">' + cat.desc + '</p>' +
        '</div>';
    }).join('');
  }
  function buildModal() {
    if (modalEl) {
      modalEl.querySelector('.jmrc-cats').innerHTML = catRowsHtml();
      return;
    }
    var ov = document.createElement('div');
    ov.id = 'jmr-consent-modal';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Datenschutz-Einstellungen verwalten');
    ov.innerHTML =
      '<div class="jmrc-modal">' +
        '<div class="jmrc-title">Datenschutz-Einstellungen</div>' +
        '<p class="jmrc-text">Entscheiden Sie, welche Kategorien Sie zulassen möchten. Sie können Ihre Auswahl jederzeit ändern. Details in der <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a>.</p>' +
        '<div class="jmrc-cats">' + catRowsHtml() + '</div>' +
        '<div class="jmrc-btns jmrc-btns-modal">' +
          '<button type="button" id="jmrc-m-deny" class="jmrc-btn jmrc-ghost">Nur notwendige</button>' +
          '<button type="button" id="jmrc-m-save" class="jmrc-btn jmrc-ghost">Auswahl speichern</button>' +
          '<button type="button" id="jmrc-m-accept" class="jmrc-btn jmrc-accent">Alle akzeptieren</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    modalEl = ov;
    ov.querySelector('#jmrc-m-accept').addEventListener('click', acceptAll);
    ov.querySelector('#jmrc-m-deny').addEventListener('click', denyAll);
    ov.querySelector('#jmrc-m-save').addEventListener('click', saveSelection);
  }
  function openSettings() { hideBanner(); buildModal(); modalEl.style.display = 'flex'; }
  function hideModal() { if (modalEl) { modalEl.style.display = 'none'; } }
  function hideAll() { hideBanner(); hideModal(); }

  window.jmrConsent = { open: openSettings, acceptAll: acceptAll, denyAll: denyAll };

  // ===== Styles (Terracotta-Akzent) =====
  function injectStyles() {
    if (document.getElementById('jmr-consent-css')) { return; }
    var css = '' +
      '#jmr-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:none;background:#F4F2EC;border-top:1px solid #e2ded2;box-shadow:0 -12px 40px -18px rgba(11,28,43,.35);font-family:"Inter",-apple-system,BlinkMacSystemFont,sans-serif}' +
      '#jmr-consent .jmrc-bar{max-width:1120px;margin:0 auto;padding:1rem 1.25rem;display:flex;align-items:center;gap:1.3rem;flex-wrap:wrap}' +
      '#jmr-consent .jmrc-bar-text{flex:1 1 340px;min-width:240px}' +
      '#jmr-consent .jmrc-lead{display:block;font-family:"Switzer","Space Grotesk",-apple-system,sans-serif;font-weight:600;letter-spacing:-.025em;font-size:.98rem;color:#0B1C2B;margin-bottom:.15rem}' +
      '#jmr-consent .jmrc-text{font-size:.82rem;line-height:1.5;color:#33424e;margin:0}' +
      '#jmr-consent .jmrc-text a{color:#16527c;text-decoration:underline}' +
      '#jmr-consent .jmrc-actions{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}' +
      '#jmr-consent-modal{position:fixed;inset:0;z-index:10000;display:none;background:rgba(11,28,43,.55);padding:1rem;overflow:auto;font-family:"Inter",-apple-system,BlinkMacSystemFont,sans-serif}' +
      '#jmr-consent-modal .jmrc-modal{max-width:540px;width:100%;margin:6vh auto;background:#F4F2EC;color:#0B1C2B;border:1px solid #e2ded2;border-radius:18px;padding:1.5rem;box-shadow:0 24px 70px -20px rgba(11,28,43,.6)}' +
      '#jmr-consent-modal .jmrc-title{font-family:"Switzer","Space Grotesk",-apple-system,sans-serif;font-weight:600;letter-spacing:-.025em;font-size:1.12rem;margin-bottom:.55rem}' +
      '#jmr-consent-modal .jmrc-text{font-size:.86rem;line-height:1.55;color:#33424e;margin:0 0 1.15rem}' +
      '#jmr-consent-modal .jmrc-text a{color:#16527c;text-decoration:underline}' +
      '#jmr-consent-modal .jmrc-cat{padding:.85rem 0;border-top:1px solid #e2ded2}' +
      '#jmr-consent-modal .jmrc-cat:last-of-type{border-bottom:1px solid #e2ded2;margin-bottom:1.1rem}' +
      '#jmr-consent-modal .jmrc-cat-head{display:flex;align-items:center;justify-content:space-between;gap:1rem}' +
      '#jmr-consent-modal .jmrc-cat-name{font-weight:600;font-size:.95rem;color:#0B1C2B}' +
      '#jmr-consent-modal .jmrc-cat-desc{font-size:.8rem;line-height:1.5;color:#5b6b78;margin:.35rem 0 0}' +
      '.jmrc-switch{position:relative;display:inline-block;width:44px;height:24px;flex:none}' +
      '.jmrc-switch input{opacity:0;width:0;height:0;position:absolute}' +
      '.jmrc-slider{position:absolute;cursor:pointer;inset:0;background:#cfcabb;border-radius:999px;transition:.2s}' +
      '.jmrc-slider::before{content:"";position:absolute;height:18px;width:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s}' +
      '.jmrc-switch input:checked + .jmrc-slider{background:#E1623D}' +
      '.jmrc-switch input:checked + .jmrc-slider::before{transform:translateX(20px)}' +
      '.jmrc-switch input:disabled + .jmrc-slider{opacity:.55;cursor:not-allowed}' +
      '.jmrc-btns{display:flex;gap:.6rem;flex-wrap:wrap}' +
      '#jmr-consent-modal .jmrc-btns-modal{justify-content:flex-end}' +
      '.jmrc-btn{cursor:pointer;border-radius:8px;padding:.62rem 1.25rem;font-family:inherit;font-size:.85rem;font-weight:600;border:1px solid transparent;transition:.18s;white-space:nowrap}' +
      '.jmrc-accent{background:#E1623D;color:#fff;box-shadow:0 10px 26px -12px rgba(225,98,61,.6)}' +
      '.jmrc-accent:hover{background:#BE4A2A}' +
      '.jmrc-ghost{background:transparent;color:#0B1C2B;border-color:#cfcabb}' +
      '.jmrc-ghost:hover{border-color:#1F6FA5;color:#16527c}' +
      '.jmrc-link{background:none;border:none;cursor:pointer;font-family:inherit;font-size:.82rem;color:#5b6b78;text-decoration:underline;padding:.62rem .3rem}' +
      '.jmrc-link:hover{color:#16527c}' +
      '@media(max-width:760px){#jmr-consent .jmrc-bar{gap:.9rem}#jmr-consent .jmrc-actions{width:100%}#jmr-consent .jmrc-btn{flex:1 1 auto}#jmr-consent .jmrc-link{order:3;width:100%;text-align:center}}' +
      '@media(max-width:520px){#jmr-consent-modal .jmrc-btns-modal .jmrc-btn{flex:1 1 auto}}';
    var st = document.createElement('style');
    st.id = 'jmr-consent-css';
    st.appendChild(document.createTextNode(css));
    document.head.appendChild(st);
  }

  // ===== Init =====
  function init() {
    injectStyles();
    var st = readState();
    if (st) { applyConsent(st); }
    else { showBanner(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
