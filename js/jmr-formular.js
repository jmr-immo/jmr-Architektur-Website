/* ------------------------------------------------------------------
   Kontaktformular: Absenden und die Bestaetigung danach
   ------------------------------------------------------------------
   Auf allen fuenf Seiten steht dasselbe Formular (#kform) mit
   demselben Empfaenger. Bisher stand der Code fuenfmal im Quelltext
   der jeweiligen Seite. Jetzt steht er einmal hier.

   Was sich fuer den Besucher aendert:

   ERFOLG  Frueher erschien ein schmaler gruener Streifen unten im
           Formularkasten - dort, wo man nach dem Absenden gar nicht
           mehr hinschaut. Jetzt oeffnet sich ein Fenster ueber der
           Seite, mit einem Rahmen in den Farben der Startseiten-
           Ueberschrift "einer Hand". Es schliesst sich nicht von
           selbst: erst ein Klick oder Tipp daneben, die Esc-Taste
           oder die Schaltflaeche beenden es. Eine Bestaetigung, die
           nach drei Sekunden verschwindet, ist keine.

   FEHLER  bleibt bewusst im Kasten stehen. Wer einen Fehler bekommt,
           muss das Formular sehen, um Telefonnummer oder E-Mail
           nachzutragen. Ein Fenster darueber wuerde genau das
           verdecken.

   Zum Leuchten: Es sind zwei Bewegungen uebereinander. Der Schatten
   atmet (jmrf-atem, 4,2 s), und ein Farbverlauf dreht sich als
   Rahmen einmal in 6 s herum (jmrf-dreh). Dasselbe Prinzip wie beim
   KFW-Kasten auf der Startseite, aber ruhiger eingestellt - der
   KFW-Kasten soll Aufmerksamkeit ziehen, eine Bestaetigung nicht.

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

  var STIL = [
    '@property --jmrf-a{syntax:"<angle>";inherits:false;initial-value:0deg}',
    '@keyframes jmrf-dreh{to{--jmrf-a:360deg}}',
    '@keyframes jmrf-atem{',
    '  0%,100%{box-shadow:0 30px 70px -30px rgba(11,28,43,.34),0 0 0 1px rgba(46,134,199,.20),0 0 26px 0 rgba(91,208,224,.18)}',
    '  50%{box-shadow:0 30px 70px -30px rgba(11,28,43,.34),0 0 0 1px rgba(91,208,224,.42),0 0 54px 5px rgba(46,134,199,.26),0 0 88px 13px rgba(225,98,61,.13)}}',
    '@keyframes jmrf-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}',
    '@keyframes jmrf-auf{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}',
    '@keyframes jmrf-haken{to{stroke-dashoffset:0}}',
    '.jmrf-dlg{position:fixed;inset:0;margin:0;width:100%;height:100%;max-width:100%;max-height:100%;',
    '  border:0;padding:0;background:transparent;overflow:auto;overscroll-behavior:contain}',
    '.jmrf-dlg[open]{display:grid;place-items:center;padding:1.25rem}',
    '.jmrf-dlg::backdrop{background:rgba(11,28,43,.55);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}',
    '.jmrf-box{position:relative;isolation:isolate;width:100%;max-width:430px;text-align:center;outline:none;',
    '  background:#FFFFFF;border-radius:20px;padding:clamp(1.9rem,5vw,2.6rem) clamp(1.4rem,4.4vw,2.4rem);',
    '  animation:jmrf-atem 4.2s ease-in-out infinite,jmrf-auf .4s cubic-bezier(.16,1,.3,1) both}',
    '.jmrf-box::after{content:"";position:absolute;inset:0;border-radius:inherit;padding:2px;--jmrf-a:0deg;',
    '  background:conic-gradient(from var(--jmrf-a),transparent 0 8%,#2E86C7 24%,#5BD0E0 40%,#E1623D 56%,#5BD0E0 72%,transparent 88% 100%);',
    '  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;',
    '  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;',
    '  animation:jmrf-dreh 6s linear infinite;pointer-events:none;z-index:2}',
    '.jmrf-ring{width:58px;height:58px;margin:0 auto .95rem;border-radius:50%;display:grid;place-items:center;',
    '  background:linear-gradient(135deg,#2E86C7 0%,#5BD0E0 48%,#E1623D 100%)}',
    '.jmrf-ring svg{width:28px;height:28px;display:block}',
    '.jmrf-ring path{stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;fill:none;',
    '  stroke-dasharray:26;stroke-dashoffset:26;animation:jmrf-haken .5s .18s cubic-bezier(.16,1,.3,1) forwards}',
    '.jmrf-box h3{font-family:var(--disp,inherit);font-weight:600;letter-spacing:-.03em;line-height:1.1;',
    '  font-size:clamp(1.5rem,4.6vw,1.95rem);margin:0 0 .55rem;',
    '  background:linear-gradient(96deg,#2E86C7 0%,#5BD0E0 30%,#E1623D 55%,#5BD0E0 78%,#2E86C7 100%);',
    '  background-size:220% auto;-webkit-background-clip:text;background-clip:text;',
    '  -webkit-text-fill-color:transparent;color:transparent;animation:jmrf-flow 8s ease-in-out infinite}',
    '.jmrf-box p{margin:0;font-size:.98rem;line-height:1.6;color:var(--ink-soft,#5b6b78)}',
    '.jmrf-zu{margin-top:1.5rem;display:inline-flex;align-items:center;justify-content:center;min-height:44px;',
    '  padding:.6rem 1.7rem;border:0;border-radius:999px;cursor:pointer;font:inherit;font-weight:600;font-size:.94rem;',
    '  color:#fff;background:linear-gradient(96deg,#2E86C7 0%,#1F6FA5 100%);',
    '  box-shadow:0 10px 26px -12px rgba(46,134,199,.75);transition:transform .2s,box-shadow .2s}',
    '.jmrf-zu:hover{transform:translateY(-1px);box-shadow:0 16px 34px -12px rgba(46,134,199,.85)}',
    '.jmrf-zu:focus-visible{outline:2px solid #E1623D;outline-offset:3px}',
    '@media(prefers-reduced-motion:reduce){',
    '  .jmrf-box,.jmrf-box::after,.jmrf-box h3,.jmrf-ring path{animation:none}',
    '  .jmrf-ring path{stroke-dashoffset:0}',
    '  .jmrf-box{box-shadow:0 30px 70px -30px rgba(11,28,43,.34),0 0 0 1px rgba(91,208,224,.42)}',
    '  .jmrf-box h3{-webkit-text-fill-color:currentColor;color:var(--white,#0B1C2B);background:none}',
    '  .jmrf-zu{transition:none}}'
  ].join('\n');

  var dlg = null;

  function bauen() {
    if (dlg) return dlg;
    var s = document.createElement('style');
    s.id = 'jmrf-stil';
    s.textContent = STIL;
    document.head.appendChild(s);

    dlg = document.createElement('dialog');
    dlg.className = 'jmrf-dlg';
    dlg.setAttribute('aria-labelledby', 'jmrf-t');
    dlg.setAttribute('aria-describedby', 'jmrf-p');
    dlg.innerHTML =
      '<div class="jmrf-box" tabindex="-1">' +
        '<div class="jmrf-ring" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24"><path d="M4.5 12.6l4.6 4.6L19.5 6.8"/></svg>' +
        '</div>' +
        '<h3 id="jmrf-t"></h3>' +
        '<p id="jmrf-p"></p>' +
        '<button type="button" class="jmrf-zu"></button>' +
      '</div>';
    dlg.querySelector('#jmrf-t').textContent = DANK_T;
    dlg.querySelector('#jmrf-p').textContent = DANK_P;
    dlg.querySelector('.jmrf-zu').textContent = 'Schließen';

    /* Daneben tippen schliesst. Der Kasten ist ein Kind des Fensters,
       ein Klick darauf hat also ein anderes Ziel als das Fenster
       selbst - nur Klicks auf den Rand ringsum kommen hier an. */
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('.jmrf-zu').addEventListener('click', function () { dlg.close(); });

    document.body.appendChild(dlg);
    return dlg;
  }

  function danken() {
    var d;
    try { d = bauen(); } catch (e) { return false; }
    if (!d || typeof d.showModal !== 'function') return false;
    try {
      if (!d.open) d.showModal();
      /* Den Fokus auf den Kasten setzen, nicht auf die Schaltflaeche:
         Sonst zeichnet der Browser dort sofort einen Fokusrahmen, obwohl
         niemand die Tastatur benutzt hat. Vorlesen und Tabulator gehen
         genauso, showModal haelt den Fokus ohnehin im Fenster. */
      var k = d.querySelector('.jmrf-box');
      if (k) k.focus({ preventScroll: true });
      return true;
    } catch (e) { return false; }
  }

  function melden(art, text) {
    if (!st) return;
    st.style.display = 'block';
    st.className = art ? 'kf-status ' + art : 'kf-status';
    st.textContent = text;
  }

  f.addEventListener('submit', async function (e) {
    e.preventDefault();
    melden('', 'Wird gesendet …');
    try {
      var r = await fetch(f.action, {
        method: 'POST',
        body: new FormData(f),
        headers: { 'Accept': 'application/json' }
      });
      if (r.ok) {
        f.reset();
        document.dispatchEvent(new Event('jmr:gesendet'));
        if (danken()) {
          /* Das Fenster hat den Streifen im Kasten abgeloest. */
          if (st) { st.style.display = 'none'; st.textContent = ''; st.className = 'kf-status'; }
        } else {
          /* Kein <dialog> im Browser: dann eben wie frueher im Kasten. */
          melden('ok', DANK_T + ' ' + DANK_P);
        }
      } else {
        melden('err', FEHLER);
      }
    } catch (err) {
      melden('err', FEHLER);
    }
  });
})();
