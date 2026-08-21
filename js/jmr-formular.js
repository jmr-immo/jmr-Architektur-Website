/* ------------------------------------------------------------------
   Kontaktformular: Absenden, Bestaetigungsfenster, Merkkapsel
   ------------------------------------------------------------------
   Auf allen fuenf Seiten steht dasselbe Formular (#kform) mit
   demselben Empfaenger. Bisher stand der Code fuenfmal im Quelltext
   der jeweiligen Seite. Jetzt steht er einmal hier - und damit sieht
   die Bestaetigung ueberall gleich aus.

   ERFOLG  Ein Fenster ueber der Seite: "Vielen Dank." im Farbverlauf
           der Startseiten-Ueberschrift "einer Hand", darunter der
           kurze Satz. Kein Haken, keine Schaltflaeche - ein Druck
           irgendwo auf den Schirm schliesst, Esc genauso.

   DANACH  Im Formularkasten erscheint oben rechts neben "Anfrage
           senden" eine kleine gruene Kapsel "Anfrage gesendet". Sie
           bleibt fuer den Besuch erhalten, auch beim Wechsel auf eine
           andere Unterseite (sessionStorage, rein funktional, kein
           Wiedererkennen ueber den Besuch hinaus).

   FEHLER  bleibt bewusst im Kasten stehen. Wer einen Fehler bekommt,
           muss das Formular sehen, um Telefonnummer oder E-Mail
           nachzutragen. Ein Fenster darueber wuerde genau das
           verdecken.

   NICHTS RUCKT
           "Wird gesendet ..." stand frueher als eigene Zeile unter
           dem Formular. Die machte den Kasten hoeher, und weil das
           Foto links in derselben Rasterzeile haengt (.cgrid, zweite
           Zeile 1fr), wuchs es mit - und sprang danach zurueck.
           Jetzt steht der Zwischenstand in der Schaltflaeche selbst,
           deren Hoehe fest ist. Auf dem Weg zum Erfolg aendert sich
           damit an der Seite kein einziges Pixel.

   Zum Glas: milchige Flaeche statt weisser Kasten, dahinter wird die
   Seite unscharf und farbkraeftiger gerechnet (backdrop-filter mit
   blur und saturate). Dazu eine helle Kante oben und ein schwacher
   Schimmer, der von links oben einfaellt - das ist es, was den
   Eindruck von Glas macht, nicht die Durchsichtigkeit allein.

   Kennt ein Browser backdrop-filter nicht, wuerde man durch die
   milchige Flaeche die Seite lesen. Dafuer steht unten ein @supports,
   das die Flaeche dann fast deckend macht.

   Zum Leuchten: Der Schatten atmet (jmrf-atem, 4,2 s) und ein
   Farbverlauf dreht sich als schmaler Rahmen einmal in 6 s herum
   (jmrf-dreh). Dasselbe Prinzip wie beim KFW-Kasten auf der
   Startseite, aber ruhiger eingestellt.

   Zu den Farben: --cyan und --green sind nur auf der Startseite
   erklaert, die vier Unterseiten kennen sie nicht. Die Werte stehen
   hier deshalb ausgeschrieben, sonst saehe das Fenster auf den
   Unterseiten anders aus als auf der Startseite.

   Zum Rahmen: Er braucht @property. Aeltere Safari-Versionen (vor
   16.4) kennen das nicht; dort steht der Verlauf still, statt sich
   zu drehen, und das Atmen bleibt. Fuer "Bewegung reduzieren" ist
   beides abgeschaltet.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var f = document.getElementById('kform');
  if (!f) return;
  var st = document.getElementById('kfStatus');

  var DANK_T = 'Vielen Dank.';
  var DANK_P = 'Ihre Anfrage ist eingegangen. Wir melden uns zeitnah bei Ihnen.';
  var FEHLER = 'Das hat nicht geklappt. Bitte schreiben Sie uns direkt an info@jmr-architektur.de.';
  var MARKE  = 'Anfrage gesendet';
  var SCHLUESSEL = 'jmr:anfrage-gesendet';

  var STIL = [
    '@property --jmrf-a{syntax:"<angle>";inherits:false;initial-value:0deg}',
    '@keyframes jmrf-dreh{to{--jmrf-a:360deg}}',
    '@keyframes jmrf-atem{',
    '  0%,100%{box-shadow:0 32px 74px -28px rgba(11,28,43,.42),0 0 0 1px rgba(46,134,199,.18),0 0 26px 0 rgba(91,208,224,.16),inset 0 1px 0 rgba(255,255,255,.85),inset 0 -1px 0 rgba(255,255,255,.28)}',
    '  50%{box-shadow:0 32px 74px -28px rgba(11,28,43,.42),0 0 0 1px rgba(91,208,224,.38),0 0 52px 5px rgba(46,134,199,.24),0 0 86px 13px rgba(225,98,61,.12),inset 0 1px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(255,255,255,.34)}}',
    '@keyframes jmrf-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}',
    '@keyframes jmrf-auf{from{opacity:0;transform:translateY(18px) scale(.955)}to{opacity:1;transform:none}}',
    '@keyframes jmrf-kapsel{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}',

    /* --- Fenster ---------------------------------------------------- */
    '.jmrf-dlg{position:fixed;inset:0;margin:0;width:100%;height:100%;max-width:100%;max-height:100%;',
    '  border:0;padding:0;background:transparent;overflow:auto;overscroll-behavior:contain}',
    '.jmrf-dlg[open]{display:grid;place-items:center;padding:1.25rem;cursor:pointer}',
    '.jmrf-dlg::backdrop{background:rgba(11,28,43,.44);backdrop-filter:blur(6px) saturate(120%);',
    '  -webkit-backdrop-filter:blur(6px) saturate(120%)}',

    /* --- Glaskasten -------------------------------------------------- */
    '.jmrf-box{position:relative;isolation:isolate;width:100%;max-width:430px;text-align:center;outline:none;',
    '  background:rgba(255,255,255,.80);',
    '  backdrop-filter:blur(34px) saturate(185%);-webkit-backdrop-filter:blur(34px) saturate(185%);',
    '  border:1px solid rgba(255,255,255,.58);border-radius:28px;',
    '  padding:clamp(2rem,5.4vw,2.7rem) clamp(1.5rem,4.6vw,2.5rem);',
    '  animation:jmrf-atem 4.2s ease-in-out infinite,jmrf-auf .42s cubic-bezier(.16,1,.3,1) both}',
    '@supports not ((backdrop-filter:blur(2px)) or (-webkit-backdrop-filter:blur(2px))){',
    '  .jmrf-box{background:rgba(255,255,255,.95)}}',
    /* Schimmer von links oben - macht aus milchig erst Glas */
    '.jmrf-box::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;',
    '  background:radial-gradient(120% 92% at 12% -14%,rgba(255,255,255,.92) 0%,rgba(255,255,255,.34) 34%,rgba(255,255,255,0) 68%),',
    '  linear-gradient(180deg,rgba(255,255,255,.30) 0%,rgba(255,255,255,0) 42%)}',
    /* Leuchtrahmen */
    '.jmrf-box::after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.6px;--jmrf-a:0deg;',
    '  background:conic-gradient(from var(--jmrf-a),transparent 0 8%,#2E86C7 24%,#5BD0E0 40%,#E1623D 56%,#5BD0E0 72%,transparent 88% 100%);',
    '  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;',
    '  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;',
    '  animation:jmrf-dreh 6s linear infinite;pointer-events:none;z-index:2;opacity:.85}',

    /* --- Inhalt ------------------------------------------------------ */
    '.jmrf-box h3{position:relative;z-index:1;font-family:var(--disp,inherit);font-weight:600;',
    '  letter-spacing:-.03em;line-height:1.08;font-size:clamp(1.85rem,6vw,2.45rem);margin:0 0 .6rem;',
    '  background:linear-gradient(96deg,#2E86C7 0%,#5BD0E0 30%,#E1623D 55%,#5BD0E0 78%,#2E86C7 100%);',
    '  background-size:220% auto;-webkit-background-clip:text;background-clip:text;',
    '  -webkit-text-fill-color:transparent;color:transparent;animation:jmrf-flow 8s ease-in-out infinite}',
    '.jmrf-box p{position:relative;z-index:1;margin:0;font-size:.97rem;line-height:1.6;',
    '  color:#2b3742;text-shadow:0 1px 0 rgba(255,255,255,.6)}',

    /* --- Kapsel im Formularkasten ------------------------------------ */
    '.ccard.jmrf-quittiert h3{display:flex;align-items:center;justify-content:space-between;',
    '  gap:.6rem .75rem;flex-wrap:wrap}',
    '.jmrf-marke{display:inline-flex;align-items:center;gap:.42rem;font-family:var(--mono,inherit);',
    '  font-size:.62rem;letter-spacing:.11em;text-transform:uppercase;font-weight:700;line-height:1;',
    '  white-space:nowrap;color:#158a5a;background:rgba(63,209,135,.15);',
    '  border:1px solid rgba(63,209,135,.42);border-radius:999px;padding:.34rem .72rem;',
    '  animation:jmrf-kapsel .4s cubic-bezier(.16,1,.3,1) both}',
    '.jmrf-marke::before{content:"";width:6px;height:6px;border-radius:50%;background:#3fd187;flex:0 0 auto}',
    '@media(max-width:400px){.jmrf-marke{font-size:.58rem;letter-spacing:.08em;padding:.3rem .6rem}}',

    /* --- Bewegung reduzieren ----------------------------------------- */
    '@media(prefers-reduced-motion:reduce){',
    '  .jmrf-box,.jmrf-box::after,.jmrf-box h3,.jmrf-marke{animation:none}',
    '  .jmrf-box{box-shadow:0 32px 74px -28px rgba(11,28,43,.42),0 0 0 1px rgba(91,208,224,.38),inset 0 1px 0 rgba(255,255,255,.9)}',
    '  .jmrf-box h3{-webkit-text-fill-color:currentColor;color:#0B1C2B;background:none}}'
  ].join('\n');

  var dlg = null, auf = 0;

  function stil() {
    if (document.getElementById('jmrf-stil')) return;
    var s = document.createElement('style');
    s.id = 'jmrf-stil';
    s.textContent = STIL;
    document.head.appendChild(s);
  }

  /* --- Kapsel oben rechts im Formularkasten -------------------------- */
  function kapsel() {
    var karte = f.closest('.ccard');
    var titel = karte && karte.querySelector('h3');
    if (!titel || titel.querySelector('.jmrf-marke')) return;
    stil();
    var m = document.createElement('span');
    m.className = 'jmrf-marke';
    m.textContent = MARKE;
    titel.appendChild(m);
    karte.classList.add('jmrf-quittiert');
  }

  function merken() {
    try { sessionStorage.setItem(SCHLUESSEL, '1'); } catch (e) { /* Privatmodus */ }
  }

  /* Wer schon abgesendet hat, sieht die Kapsel auch auf den anderen
     Unterseiten - sonst stuende dort "noch nichts geschickt". */
  try { if (sessionStorage.getItem(SCHLUESSEL) === '1') kapsel(); } catch (e) { /* egal */ }

  /* --- Bestaetigungsfenster ------------------------------------------ */
  function bauen() {
    if (dlg) return dlg;
    stil();
    dlg = document.createElement('dialog');
    dlg.className = 'jmrf-dlg';
    dlg.setAttribute('aria-labelledby', 'jmrf-t');
    dlg.setAttribute('aria-describedby', 'jmrf-p');
    dlg.innerHTML = '<div class="jmrf-box" tabindex="-1"><h3 id="jmrf-t"></h3><p id="jmrf-p"></p></div>';
    dlg.querySelector('#jmrf-t').textContent = DANK_T;
    dlg.querySelector('#jmrf-p').textContent = DANK_P;

    /* Ein Druck irgendwo schliesst, auch auf dem Kasten selbst. Die
       ersten 300 ms sind ausgenommen: Auf dem Handy loest ein Tipp,
       der beim Absenden begonnen hat, sonst gleich wieder aus. */
    dlg.addEventListener('click', function () {
      if (performance.now() - auf > 300) dlg.close();
    });
    /* close deckt alle Wege ab - Klick, Esc, Zuruecktaste. */
    dlg.addEventListener('close', kapsel);

    document.body.appendChild(dlg);
    return dlg;
  }

  function danken() {
    var d;
    try { d = bauen(); } catch (e) { return false; }
    if (!d || typeof d.showModal !== 'function') return false;
    try {
      if (!d.open) d.showModal();
      auf = performance.now();
      /* Fokus auf den Kasten, nicht auf ein Bedienelement: Es gibt
         keines mehr, und ein Fokusrahmen ohne Tastatur sieht falsch
         aus. showModal haelt den Fokus ohnehin im Fenster, Esc
         schliesst. */
      var k = d.querySelector('.jmrf-box');
      if (k) k.focus({ preventScroll: true });
      return true;
    } catch (e) { return false; }
  }

  /* Zwischenstand in der Schaltflaeche statt in einer eigenen Zeile:
     Ihre Hoehe steht fest, also ruckt nichts. */
  var knopf = document.getElementById('kfSubmit') || f.querySelector('[type=submit]');
  var knopfInhalt = knopf ? knopf.innerHTML : '';

  function knopfLaeuft(ja) {
    if (!knopf) return;
    if (ja) {
      /* Hoehe festnageln, nicht nur einen Mindestwert setzen: Gemessen
         wuchs die Schaltflaeche sonst um 2 bis 3 px, weil der
         Auslassungspunkt eine andere Zeilenhoehe hat als der Pfeil.
         Deshalb bleibt der Pfeil jetzt auch stehen - nur das Wort
         davor wechselt. */
      var h = knopf.getBoundingClientRect().height;
      knopf.style.height = h + 'px';
      knopf.style.minHeight = h + 'px';
      knopf.disabled = true;
      knopf.setAttribute('aria-busy', 'true');
      knopf.innerHTML = 'Wird gesendet <span class="ar">→</span>';
    } else {
      knopf.disabled = false;
      knopf.removeAttribute('aria-busy');
      knopf.innerHTML = knopfInhalt;
      knopf.style.height = '';
      knopf.style.minHeight = '';
    }
  }

  function melden(art, text) {
    if (!st) return;
    st.style.display = 'block';
    st.className = art ? 'kf-status ' + art : 'kf-status';
    st.textContent = text;
  }

  f.addEventListener('submit', async function (e) {
    e.preventDefault();
    knopfLaeuft(true);
    try {
      var r = await fetch(f.action, {
        method: 'POST',
        body: new FormData(f),
        headers: { 'Accept': 'application/json' }
      });
      if (r.ok) {
        f.reset();
        document.dispatchEvent(new Event('jmr:gesendet'));
        merken();
        if (danken()) {
          /* Das Fenster hat den Streifen im Kasten abgeloest. */
          if (st) { st.style.display = 'none'; st.textContent = ''; st.className = 'kf-status'; }
        } else {
          /* Kein <dialog> im Browser: dann eben wie frueher im Kasten. */
          melden('ok', DANK_T + ' ' + DANK_P);
          kapsel();
        }
      } else {
        melden('err', FEHLER);
      }
    } catch (err) {
      melden('err', FEHLER);
    }
    knopfLaeuft(false);
  });
})();
