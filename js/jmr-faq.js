/* ------------------------------------------------------------------
   FAQ: sanftes Auf- und Zuklappen
   ------------------------------------------------------------------
   Die Fragen sind <details>-Elemente. Browser klappen die hart auf und
   zu, eine reine CSS-Loesung gibt es dafuer nicht zuverlaessig. Wir
   steuern die Hoehe deshalb selbst und verwenden dieselbe Dauer und
   dieselbe Kurve wie die Aufklappliste im Abschnitt "Ausgangslagen".

   Ohne JavaScript bleibt das normale Verhalten erhalten: Die Fragen
   lassen sich weiterhin oeffnen, nur eben ohne Uebergang.
   ------------------------------------------------------------------ */
(function () {
  var gruppen = document.querySelectorAll('.faq-wrap');
  if (!gruppen.length) return;

  var TEMPO_AUF = 380;
  var TEMPO_ZU  = 300;
  var KURVE     = 'cubic-bezier(.16,1,.3,1)';

  var kannBewegen = !!(window.Element && Element.prototype.animate);
  var ruhigGestellt = !!(window.matchMedia &&
                         window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var sanft = kannBewegen && !ruhigGestellt;

  Array.prototype.forEach.call(gruppen, function (gruppe) {
    var alle = Array.prototype.slice.call(gruppe.querySelectorAll('details.faq'));
    if (!alle.length) return;

    // Das name-Attribut laesst den Browser die Geschwister sofort zuklappen,
    // ohne Uebergang. Wir uebernehmen das Nacheinander deshalb selbst.
    if (sanft) alle.forEach(function (d) { d.removeAttribute('name'); });

    alle.forEach(function (d) {
      var kopf = d.querySelector('summary');
      var text = d.querySelector('.fq-a');
      if (!kopf || !text) return;

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

      function zuklappen() {
        if (!sanft) { d.open = false; return; }
        if (!d.open) return;
        var jetzt = d.offsetHeight;
        anhalten();
        d.style.overflow = 'hidden';
        d.style.height = jetzt + 'px';
        lauf = d.animate({ height: [jetzt + 'px', kopf.offsetHeight + 'px'] },
                         { duration: TEMPO_ZU, easing: KURVE });
        laufText = text.animate({ opacity: [1, 0] },
                                { duration: TEMPO_ZU, easing: 'ease-out' });
        lauf.onfinish = function () { fertig(false); };
      }

      function aufklappen() {
        if (!sanft) { d.open = true; return; }
        var jetzt = d.offsetHeight;
        anhalten();
        d.style.overflow = 'hidden';
        d.style.height = jetzt + 'px';
        d.open = true;
        var ziel = kopf.offsetHeight + text.offsetHeight;
        lauf = d.animate({ height: [jetzt + 'px', ziel + 'px'] },
                         { duration: TEMPO_AUF, easing: KURVE });
        laufText = text.animate({ opacity: [0, 1] },
                                { duration: TEMPO_AUF, easing: 'ease-out' });
        lauf.onfinish = function () { fertig(true); };
      }

      d.jmrZuklappen = zuklappen;

      kopf.addEventListener('click', function (e) {
        if (!sanft) return;               // ohne Bewegung macht der Browser das selbst
        e.preventDefault();
        if (d.open) { zuklappen(); return; }
        alle.forEach(function (a) {
          if (a !== d && a.open && a.jmrZuklappen) a.jmrZuklappen();
        });
        aufklappen();
      });
    });
  });
})();
