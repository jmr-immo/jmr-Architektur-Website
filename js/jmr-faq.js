/* ------------------------------------------------------------------
   Aufklapplisten
   ------------------------------------------------------------------
   Drei Sorten:

   1. Die Fragen im Abschnitt "Gut zu wissen" (.faq), aus <details>.
      Dort ist immer nur eine Frage offen.
   2. Die Zeilen in den Ergebnis-Abschnitten (.akk), aus <details>.
      Die gibt es nur bis 560 px Breite. Darueber stehen sie dauerhaft
      offen und sind gar kein Bedienelement mehr, dort sieht man wieder
      die gewohnten Karten. Mehrere duerfen offen sein.
   3. Die Aufklapp-Listen (.acc-liste) bei "Warum sich eine Aufteilung
      lohnt" und "Woran Umnutzungen scheitern". Aeltere Bauart ohne
      <details>: aufgeklappt wird ueber eine Klasse, den Uebergang macht
      das Stilblatt. Bis 700 px, immer nur ein Punkt offen.

   Browser klappen <details> hart auf und zu, eine reine CSS-Loesung
   gibt es dafuer nicht zuverlaessig. Wir steuern die Hoehe bei den
   ersten beiden Sorten deshalb selbst und verwenden ueberall dieselbe
   Dauer und dieselbe Kurve.

   Ohne JavaScript bleibt alles benutzbar: Die Fragen oeffnen sich
   weiterhin, nur eben ohne Uebergang, die Zeilen stehen offen da, und
   die Listen bleiben die Karten, die sie auf dem Schirm ohnehin sind.
   ------------------------------------------------------------------ */
(function () {
  var TEMPO_AUF = 380;
  var TEMPO_ZU  = 300;
  var KURVE     = 'cubic-bezier(.16,1,.3,1)';

  var kannBewegen = !!(window.Element && Element.prototype.animate);
  var ruhigGestellt = !!(window.matchMedia &&
                         window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var sanft = kannBewegen && !ruhigGestellt;

  /* Haengt an ein <details> das weiche Auf- und Zuklappen und gibt den
     Kopf zurueck. "koerper" ist das Element mit dem Text darunter. */
  function beweglich(d, koerper) {
    var kopf = d.querySelector('summary');
    if (!kopf || !koerper) return null;

    var lauf = null, laufText = null;

    function anhalten() {
      if (lauf)     { lauf.onfinish = null; lauf.cancel(); lauf = null; }
      if (laufText) { laufText.cancel(); laufText = null; }
    }

    function fertig(offen) {
      lauf = null; laufText = null;
      d.open = offen;
      d.style.height = '';
      d.style.overflow = '';
    }

    d.jmrZuklappen = function () {
      if (!sanft) { d.open = false; return; }
      if (!d.open) return;
      var jetzt = d.offsetHeight;
      anhalten();
      d.style.overflow = 'hidden';
      d.style.height = jetzt + 'px';
      lauf = d.animate({ height: [jetzt + 'px', kopf.offsetHeight + 'px'] },
                       { duration: TEMPO_ZU, easing: KURVE });
      laufText = koerper.animate({ opacity: [1, 0] },
                                 { duration: TEMPO_ZU, easing: 'ease-out' });
      lauf.onfinish = function () { fertig(false); };
    };

    d.jmrAufklappen = function () {
      if (!sanft) { d.open = true; return; }
      var jetzt = d.offsetHeight;
      anhalten();
      d.style.overflow = 'hidden';
      d.style.height = jetzt + 'px';
      d.open = true;
      var ziel = kopf.offsetHeight + koerper.offsetHeight;
      lauf = d.animate({ height: [jetzt + 'px', ziel + 'px'] },
                       { duration: TEMPO_AUF, easing: KURVE });
      laufText = koerper.animate({ opacity: [0, 1] },
                                 { duration: TEMPO_AUF, easing: 'ease-out' });
      lauf.onfinish = function () { fertig(true); };
    };

    /* Beim Wechsel der Schirmbreite muss ein halber Lauf weg, sonst
       bliebe eine feste Hoehe am Element haengen. */
    d.jmrRuecksetzen = function () {
      anhalten();
      d.style.height = '';
      d.style.overflow = '';
    };

    return kopf;
  }

  /* --- 1  Fragen: immer nur eine offen ---------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.faq-wrap'), function (gruppe) {
    var alle = Array.prototype.slice.call(gruppe.querySelectorAll('details.faq'));
    if (!alle.length) return;

    // Das name-Attribut laesst den Browser die Geschwister sofort zuklappen,
    // ohne Uebergang. Wir uebernehmen das Nacheinander deshalb selbst.
    if (sanft) alle.forEach(function (d) { d.removeAttribute('name'); });

    alle.forEach(function (d) {
      var kopf = beweglich(d, d.querySelector('.fq-a'));
      if (!kopf) return;
      kopf.addEventListener('click', function (e) {
        if (!sanft) return;               // ohne Bewegung macht der Browser das selbst
        e.preventDefault();
        if (d.open) { d.jmrZuklappen(); return; }
        alle.forEach(function (a) {
          if (a !== d && a.open && a.jmrZuklappen) a.jmrZuklappen();
        });
        d.jmrAufklappen();
      });
    });
  });

  /* --- 2  Zeilen: nur bis 560 px ein Bedienelement ---------------- */
  (function () {
    var zeilen = Array.prototype.slice.call(document.querySelectorAll('details.akk'));
    if (!zeilen.length || !window.matchMedia) return;
    var eng = window.matchMedia('(max-width:560px)');

    zeilen.forEach(function (d) {
      var kopf = beweglich(d, d.querySelector('.akk-b'));
      if (!kopf) return;
      kopf.addEventListener('click', function (e) {
        if (!eng.matches) { e.preventDefault(); return; }   // breit: bleibt offen
        if (!sanft) return;
        e.preventDefault();
        if (d.open) d.jmrZuklappen(); else d.jmrAufklappen();
      });
    });

    function stellen() {
      zeilen.forEach(function (d) {
        var kopf = d.querySelector('summary');
        if (d.jmrRuecksetzen) d.jmrRuecksetzen();
        if (eng.matches) {
          d.open = false;
          if (kopf) kopf.removeAttribute('tabindex');
        } else {
          d.open = true;
          if (kopf) kopf.setAttribute('tabindex', '-1');   // kein Halt im Tabulator-Lauf
        }
      });
    }

    if (eng.addEventListener) eng.addEventListener('change', stellen);
    else if (eng.addListener) eng.addListener(stellen);
    stellen();
  })();

  /* --- 3  Aufklapp-Liste (.acc-liste) ----------------------------
     Aeltere Bauart ohne <details>: der Kopf ist ein Knopf, der Text
     faehrt ueber Rasterzeilen aus. Bis 700 px ist immer nur ein Punkt
     offen, darueber sind es wieder ganz normale Karten. */
  Array.prototype.forEach.call(document.querySelectorAll('.acc-liste'), function (liste) {
    var karten = Array.prototype.slice.call(liste.querySelectorAll('.prob'));
    if (!karten.length) return;
    var eng = window.matchMedia('(max-width:700px)');

    function zu() { karten.forEach(function (k) { k.classList.remove('auf'); }); }
    function melden() {
      karten.forEach(function (k) {
        k.querySelector('.acc-head')
         .setAttribute('aria-expanded', k.classList.contains('auf') ? 'true' : 'false');
      });
    }

    karten.forEach(function (k) {
      var kopf = k.querySelector('.acc-head');
      if (!kopf) return;
      kopf.setAttribute('role', 'button');
      kopf.setAttribute('tabindex', '0');
      function um() {
        if (!eng.matches) return;
        var war = k.classList.contains('auf');
        zu();
        if (!war) k.classList.add('auf');
        melden();
      }
      kopf.addEventListener('click', um);
      kopf.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); um(); }
      });
    });

    function stellen() {
      if (!eng.matches) {
        zu();
        karten.forEach(function (k) { k.querySelector('.acc-head').removeAttribute('aria-expanded'); });
      } else melden();
    }
    if (eng.addEventListener) eng.addEventListener('change', stellen);
    else if (eng.addListener) eng.addListener(stellen);
    stellen();
  });
})();
