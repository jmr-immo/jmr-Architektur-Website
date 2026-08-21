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
           gilt nur fuer diese Seitenansicht und wird nirgends
           gespeichert: Weiterblaettern, neu laden oder die Seite
           verlassen laesst sie verschwinden.

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

   Zum Glas: eine mattierte Scheibe. Dahinter wird die Seite stark
   weich gezeichnet (60 px), farbkraeftiger und etwas heller
   gerechnet. 60 px sind der Punkt, an dem hinter der Scheibe noch
   Licht und Farbe durchkommen, aber nichts mehr zu lesen ist - genau
   das macht mattiertes Glas aus. Dazu eine helle Kante oben und ein
   Schimmer, der von links oben einfaellt.

   Vier Abstufungen wurden gebaut und am Bild verglichen. Von .66 auf
   .78 Deckung und von 38 auf 60 px sank die Streuung im Glas von
   19,4 auf 12,4 - so viel weniger kommt jetzt durch. Der Text steht
   dabei mit 10,8:1 (noetig waeren 4,5:1).

   Kennt ein Browser backdrop-filter nicht, wuerde man durch die
   milchige Flaeche die Seite lesen. Dafuer steht unten ein @supports,
   das die Flaeche dann fast deckend macht.

   Zum Leuchten: Ein Schein hinter der Scheibe blendet auf und ab
   (jmrf-atem, 4,6 s) und ein Farbverlauf dreht sich als schmaler
   Rahmen einmal in 7 s herum (jmrf-dreh).

   WARUM ES JETZT FLUESSIG LAEUFT
   Die erste Fassung stockte. Gemessen wurde jedes Bild einzeln, und
   die Ursache war eindeutig: der Weichzeichner auf ::backdrop, also
   ueber das ganze Fenster. Mit ihm 55 ms je Bild, ohne ihn 17 - und
   das bei jeder der fuenf Seiten. Weggelassen. Das Glas ist die
   Scheibe selbst; die zeichnet weich, was hinter IHR liegt, und das
   kostet fast nichts. Der Rest wird nur abgedunkelt.

   Ausserdem bewegen sich jetzt nur noch Eigenschaften, die der
   Browser auf der Grafikkarte rechnen kann:
   - Der Schein aendert seine Deckung (opacity), nicht seinen
     Schatten. box-shadow zu bewegen heisst neu malen, jedes Bild.
   - Der Rahmen dreht eine Scheibe (transform:rotate) hinter einer
     festen Maske, statt einen Kegelverlauf Bild fuer Bild neu
     aufzubauen. Damit faellt auch @property weg, und der Rahmen
     dreht sich jetzt ueberall - auch in Safari vor 16.4.
   - Der Schein ist ein eigenes Geschwister HINTER der Scheibe. Auf
     der Scheibe selbst wuerde sein Schatten ueber deren Rand malen.

   Zu den Farben: --cyan und --green sind nur auf der Startseite
   erklaert, die vier Unterseiten kennen sie nicht. Die Werte stehen
   hier deshalb ausgeschrieben, sonst saehe das Fenster auf den
   Unterseiten anders aus als auf der Startseite.

   Fuer "Bewegung reduzieren" ist alles abgeschaltet.
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

  var STIL = [
    '@keyframes jmrf-dreh{to{transform:translate(-50%,-50%) rotate(360deg)}}',
    '@keyframes jmrf-atem{0%,100%{opacity:.40}50%{opacity:1}}',
    '@keyframes jmrf-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}',
    '@keyframes jmrf-auf{from{opacity:0;transform:translateY(18px) scale(.955)}to{opacity:1;transform:none}}',
    '@keyframes jmrf-kapsel{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}',

    /* --- Fenster ---------------------------------------------------- */
    '.jmrf-dlg{position:fixed;inset:0;margin:0;width:100%;height:100%;max-width:100%;max-height:100%;',
    '  border:0;padding:0;background:transparent;overflow:auto;overscroll-behavior:contain}',
    '.jmrf-dlg[open]{display:grid;place-items:center;padding:1.25rem;cursor:pointer}',
    /* Bewusst OHNE backdrop-filter: Ein Weichzeichner ueber das ganze
       Fenster kostete gemessen 55 ms je Bild statt 17. Das Glas ist die
       Scheibe selbst - die zeichnet weich, was hinter IHR liegt. Der
       Rest wird nur abgedunkelt. */
    '.jmrf-dlg::backdrop{background:rgba(11,28,43,.46)}',

    /* --- Huelle: traegt das Einblenden und das Leuchten -------------- */
    '.jmrf-huelle{position:relative;width:100%;max-width:430px;',
    '  animation:jmrf-auf .42s cubic-bezier(.16,1,.3,1) both}',
    /* Der Schein ist ein eigenes Geschwister ueber dem Glas. Sein
       Schatten faellt nur nach aussen, im Kasten ist er unsichtbar. */
    '.jmrf-schein{position:absolute;inset:0;border-radius:28px;pointer-events:none;z-index:2;',
    '  box-shadow:0 34px 78px -26px rgba(11,28,43,.50),0 0 0 1px rgba(91,208,224,.50),',
    '  0 0 58px 6px rgba(46,134,199,.34),0 0 104px 18px rgba(225,98,61,.16);',
    '  animation:jmrf-atem 4.6s ease-in-out infinite;will-change:opacity}',

    /* --- Die Scheibe -------------------------------------------------- */
    '.jmrf-box{position:relative;isolation:isolate;overflow:hidden;text-align:center;outline:none;',
    '  background:rgba(255,255,255,.78);',
    /* brightness hebt an, was hinter der Scheibe liegt - erst dadurch
       bleibt der Text auch ueber dem dunklen Kontaktbereich lesbar,
       ohne dass die Scheibe deckender werden muss. */
    /* 44 px und nicht mehr: Gemessen kostete 60 px auf allen fuenf
       Seiten wieder einzelne lange Bilder, weil der Weichzeichner neu
       gerechnet wird, sobald sich im Glas etwas bewegt. Bei 78 Prozent
       Deckung kommen ohnehin nur 22 Prozent von hinten durch - der
       Unterschied zwischen 44 und 60 px ist am Bild nicht zu sehen
       (Streuung 12,3 gegen 12,4), der im Bildtakt sehr wohl. */
    '  backdrop-filter:blur(44px) saturate(180%) brightness(1.08);',
    '  -webkit-backdrop-filter:blur(44px) saturate(180%) brightness(1.08);',
    '  border:1px solid rgba(255,255,255,.52);border-radius:28px;',
    '  padding:clamp(2rem,5.4vw,2.7rem) clamp(1.5rem,4.6vw,2.5rem);',
    '  box-shadow:inset 0 1px 0 rgba(255,255,255,.85),inset 0 -1px 0 rgba(255,255,255,.22)}',
    '@supports not ((backdrop-filter:blur(2px)) or (-webkit-backdrop-filter:blur(2px))){',
    '  .jmrf-box{background:rgba(255,255,255,.94)}}',
    /* Schimmer von links oben - macht aus milchig erst Glas */
    '.jmrf-box::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;',
    '  background:radial-gradient(120% 92% at 12% -14%,rgba(255,255,255,.9) 0%,rgba(255,255,255,.3) 34%,rgba(255,255,255,0) 68%),',
    '  linear-gradient(180deg,rgba(255,255,255,.26) 0%,rgba(255,255,255,0) 44%)}',

    /* --- Leuchtrahmen: eine Scheibe, die sich dreht ------------------- */
    '.jmrf-rand{position:absolute;inset:0;border-radius:28px;pointer-events:none;z-index:3;',
    '  padding:1.5px;overflow:hidden;opacity:.88;',
    '  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;',
    '  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude}',
    '.jmrf-rand i{position:absolute;left:50%;top:50%;width:170%;aspect-ratio:1;',
    '  transform:translate(-50%,-50%);will-change:transform;',
    '  background:conic-gradient(transparent 0 8%,#2E86C7 24%,#5BD0E0 40%,#E1623D 56%,#5BD0E0 72%,transparent 88% 100%);',
    '  animation:jmrf-dreh 7s linear infinite}',

    /* --- Inhalt ------------------------------------------------------ */
    '.jmrf-box h3{position:relative;z-index:1;font-family:var(--disp,inherit);font-weight:600;',
    '  letter-spacing:-.03em;line-height:1.08;font-size:clamp(1.85rem,6vw,2.45rem);margin:0 0 .6rem;',
    '  background:linear-gradient(96deg,#2E86C7 0%,#5BD0E0 30%,#E1623D 55%,#5BD0E0 78%,#2E86C7 100%);',
    '  background-size:220% auto;-webkit-background-clip:text;background-clip:text;',
    '  -webkit-text-fill-color:transparent;color:transparent;animation:jmrf-flow 8s ease-in-out infinite}',
    '.jmrf-box p{position:relative;z-index:1;margin:0;font-size:.97rem;line-height:1.6;',
    '  color:#26313b;text-shadow:0 1px 0 rgba(255,255,255,.7)}',

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
    '  .jmrf-huelle,.jmrf-schein,.jmrf-rand i,.jmrf-box h3,.jmrf-marke{animation:none}',
    '  .jmrf-schein{opacity:1}',
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

  /* Die Kapsel wird nirgends gespeichert. Sie gilt fuer diese eine
     Seitenansicht: Wer weiterblaettert, neu laedt oder die Seite
     verlaesst, sieht sie nicht mehr. Das war Max' ausdruecklicher
     Wunsch - eine Meldung, die nach Tagen noch dasteht, ist keine
     Bestaetigung mehr, sondern ein Ueberbleibsel. Nebenbei kommt die
     Seite damit ganz ohne Browserspeicher aus. */

  /* --- Bestaetigungsfenster ------------------------------------------ */
  function bauen() {
    if (dlg) return dlg;
    stil();
    dlg = document.createElement('dialog');
    dlg.className = 'jmrf-dlg';
    dlg.setAttribute('aria-labelledby', 'jmrf-t');
    dlg.setAttribute('aria-describedby', 'jmrf-p');
    /* Rahmen und Schein liegen UEBER dem Glas, nicht darin und nicht
       dahinter. Alles, was sich im Glas oder hinter ihm bewegt, zwingt
       den Browser, die Weichzeichnung neu zu rechnen - gemessen waren
       das je nach Tagesform bis zu 13 lange Bilder von 120. So bleibt
       im Glas nur unbewegter Text, und die Weichzeichnung wird einmal
       gerechnet. Der Schein malt ohnehin nur ausserhalb des Kastens
       (ein aeusserer Schatten wird am Rand abgeschnitten), er sieht
       oben drueber also genauso aus wie darunter. */
    dlg.innerHTML =
      '<div class="jmrf-huelle">' +
        '<div class="jmrf-box" tabindex="-1">' +
          '<h3 id="jmrf-t"></h3><p id="jmrf-p"></p>' +
        '</div>' +
        '<span class="jmrf-rand" aria-hidden="true"><i></i></span>' +
        '<span class="jmrf-schein" aria-hidden="true"></span>' +
      '</div>';
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
