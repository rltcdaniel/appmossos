/* MossosPrep — comportament comú de les pàgines de contingut */
(function () {
  var toc = document.querySelector('.toc-box');
  if (!toc) return;

  // L'índex obert a escriptori i plegat al mòbil
  var desktop = window.matchMedia('(min-width: 1021px)');
  function syncOpen() { if (desktop.matches) toc.setAttribute('open', ''); }
  syncOpen();
  if (desktop.addEventListener) desktop.addEventListener('change', syncOpen);

  // Al mòbil, en triar una secció es plega l'índex
  toc.addEventListener('click', function (e) {
    if (e.target.closest('a') && !desktop.matches) toc.removeAttribute('open');
  });

  // Marca la secció que s'està llegint
  if (!('IntersectionObserver' in window)) return;
  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  var byId = {};
  links.forEach(function (a) {
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    var el = document.getElementById(id);
    if (el) byId[id] = a;
  });
  var current = null;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        if (current) current.classList.remove('is-active');
        current = byId[en.target.id];
        if (current) current.classList.add('is-active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  Object.keys(byId).forEach(function (id) { obs.observe(document.getElementById(id)); });
})();
