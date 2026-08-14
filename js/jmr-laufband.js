/* ------------------------------------------------------------------
   Laufband im Kopfbereich der Unterseiten
   ------------------------------------------------------------------
   Das Band mit den Schlagworten laeuft endlos nach links. Damit der
   Uebergang vom Ende zum Anfang unsichtbar bleibt, muessen zwei Dinge
   genau stimmen:

   1. Die Spur muss aus lauter gleichen Saetzen bestehen und breiter
      sein als das Fenster, auch dann noch, wenn sie schon um einen
      ganzen Satz nach links gewandert ist.
   2. Verschoben werden darf genau um die Breite eines Satzes, auf das
      Tausendstel Pixel. Nur dann sieht die Stellung am Ende des Laufs
      genauso aus wie die am Anfang, und der Sprung zurueck faellt
      niemandem auf.

   Frueher stand im Stilblatt "verschiebe um 50 Prozent der Spur".
   Das trifft nur, wenn beide Haelften auf den Bruchteil eines Pixels
   gleich breit sind. Bei umgebrochenen Wortabstaenden und den kleinen
   Punkten hinter jedem Eintrag ist das nicht der Fall, und die
   Abweichung sah man an einer bestimmten Stelle des Durchlaufs als
   Ruck. Deshalb wird der Satz hier gemessen und in --satz abgelegt.

   Die Geschwindigkeit ist mit TEMPO fest vorgegeben, in Pixeln je
   Sekunde. Dadurch laufen die Baender auf allen Unterseiten gleich
   schnell, obwohl ihre Texte unterschiedlich lang sind.

   Ohne JavaScript bleibt das Band stehen und zeigt die Begriffe, die
   ohnehin im Quelltext stehen. Wer "Bewegung reduzieren" eingestellt
   hat, bekommt es ebenfalls ruhig; das regelt das Stilblatt.
   ------------------------------------------------------------------ */
(function () {
  var TEMPO = 52;                      /* Pixel je Sekunde */

  var ruhigGestellt = !!(window.matchMedia &&
                         window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  Array.prototype.forEach.call(document.querySelectorAll('.marq .track'), function (spur) {
    var rahmen = spur.parentElement;
    if (!rahmen) return;

    /* Wie viele der vorhandenen Eintraege bilden einen Satz? Steht es
       nicht im Markup, ist die Spur im Quelltext doppelt angelegt. */
    var anzahl = parseInt(spur.getAttribute('data-satz'), 10);
    if (!anzahl || anzahl < 1) {
      anzahl = Math.round(spur.children.length / 2) || spur.children.length;
    }

    var grund = Array.prototype.slice.call(spur.children, 0, anzahl)
                     .map(function (e) { return e.cloneNode(true); });
    if (!grund.length) return;

    var sichtbar = true;
    var letzteBreite = -1;

    function spielstand() {
      spur.style.animationPlayState = sichtbar ? 'running' : 'paused';
    }

    function aufbauen() {
      spur.style.animation = 'none';            /* Lauf anhalten und zuruecksetzen */
      spur.style.removeProperty('--satz');

      while (spur.firstChild) spur.removeChild(spur.firstChild);
      grund.forEach(function (e) { spur.appendChild(e.cloneNode(true)); });

      var satz = spur.getBoundingClientRect().width;
      if (!satz) { spur.style.animation = ''; return; }   /* verborgen, spaeter erneut */

      var noetig = Math.max(2, Math.ceil((rahmen.offsetWidth + satz) / satz) + 1);
      for (var i = 1; i < noetig; i++) {
        grund.forEach(function (e) { spur.appendChild(e.cloneNode(true)); });
      }

      spur.style.setProperty('--satz', satz.toFixed(3) + 'px');
      spur.style.setProperty('--dauer', (satz / TEMPO).toFixed(2) + 's');
      void spur.offsetWidth;                    /* erzwingt den Neustart */
      spur.style.animation = '';
      spielstand();
    }

    aufbauen();
    letzteBreite = rahmen.offsetWidth;

    /* Schriften kommen spaeter an und aendern die Breite eines Satzes. */
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(function () {
        letzteBreite = rahmen.offsetWidth;
        aufbauen();
      }, function () {});
    }

    /* Nur neu aufbauen, wenn sich die Breite wirklich geaendert hat.
       Auf dem Handy aendert sich beim Scrollen staendig die Hoehe des
       Fensters, weil die Adresszeile ein- und ausfaehrt. Baute man
       darauf neu auf, sprang das Band bei jedem Scrollen. */
    function vielleichtNeu() {
      var b = rahmen.offsetWidth;
      if (b === letzteBreite) return;
      letzteBreite = b;
      aufbauen();
    }

    var t;
    addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(vielleichtNeu, 200);
    }, { passive: true });

    /* Ausserhalb des Bildausschnitts anhalten. Das Band sitzt im Kopf
       der Seite und ist die meiste Zeit nicht zu sehen; ein pausiertes
       Band kostet keine Rechenzeit und keinen Akku. */
    if (!ruhigGestellt && window.IntersectionObserver) {
      new IntersectionObserver(function (eintraege) {
        eintraege.forEach(function (e) {
          sichtbar = e.isIntersecting;
          spielstand();
        });
      }, { rootMargin: '150px' }).observe(rahmen);
    }
  });
})();
