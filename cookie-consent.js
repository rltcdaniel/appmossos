/* MossosPrep — consentiment de cookies
   El consentiment principal el recull el missatge de privacitat de Google (CMP certificat
   per a l'IAB TCF), que es carrega amb adsbygoogle.js. Aquest fitxer:
   1) connecta els enllaços «Preferències de cookies» [data-cookie-prefs];
   2) només mostra un bàner propi si el CMP de Google no s'ha carregat (per exemple,
      si un bloquejador l'impedeix), i en aquest cas actualitza el Consent Mode de Google.
   Inclòs a totes les pàgines amb: <script src="/cookie-consent.js" defer></script>
*/
(function () {
  var KEY = 'mp_cookie_consent';
  var banner = null;

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function hasCMP() { return typeof window.__tcfapi === 'function' || !!(window.googlefc && window.googlefc.callbackQueue); }

  function applyConsent(value) {
    if (typeof window.gtag !== 'function') return;
    var g = value === 'accepted' ? 'granted' : 'denied';
    window.gtag('consent', 'update', { ad_storage: g, ad_user_data: g, ad_personalization: g, analytics_storage: g });
  }

  function showBanner() {
    if (banner) return;
    var style = document.createElement('style');
    style.textContent =
      '#mp-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#071C45;color:#fff;border-top:4px solid #D3121C;padding:16px 20px;' +
      'font-family:"Archivo",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:center;font-size:15px;line-height:1.5}' +
      '#mp-cookie-banner p{margin:0;flex:1 1 280px;max-width:680px;color:#D6E0F2}' +
      '#mp-cookie-banner a{color:#FFB71B;text-decoration:underline}' +
      '#mp-cookie-banner .mp-btns{display:flex;gap:8px;flex:0 0 auto}' +
      '#mp-cookie-banner button{cursor:pointer;border:2px solid transparent;border-radius:6px;padding:10px 18px;font-weight:700;font-size:15px;font-family:inherit}' +
      '#mp-cookie-accept{background:#FFB71B;color:#071C45}' +
      '#mp-cookie-reject{background:transparent;color:#fff;border-color:rgba(255,255,255,.6)!important}' +
      '#mp-cookie-banner button:focus-visible{outline:3px solid #FFB71B;outline-offset:2px}' +
      '@media (max-width:480px){#mp-cookie-banner{flex-direction:column;align-items:stretch;text-align:left}#mp-cookie-banner .mp-btns{justify-content:stretch}#mp-cookie-banner button{flex:1}}';
    document.head.appendChild(style);
    banner = document.createElement('div');
    banner.id = 'mp-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Preferències de cookies');
    banner.innerHTML =
      '<p>Utilitzem cookies pròpies i de tercers (com Google) per mesurar l\'ús del lloc i, si acceptes, mostrar publicitat personalitzada. Més informació a la <a href="/privacy.html#cookies">política de privacitat</a>.</p>' +
      '<div class="mp-btns"><button type="button" id="mp-cookie-reject">Rebutjar</button><button type="button" id="mp-cookie-accept">Acceptar</button></div>';
    document.body.appendChild(banner);
    function choose(v) { set(v); applyConsent(v); banner.remove(); banner = null; }
    document.getElementById('mp-cookie-accept').addEventListener('click', function () { choose('accepted'); });
    document.getElementById('mp-cookie-reject').addEventListener('click', function () { choose('rejected'); });
  }

  // Enllaços «Preferències de cookies»
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-cookie-prefs]');
    if (!a) return;
    e.preventDefault();
    if (window.googlefc && window.googlefc.callbackQueue) {
      window.googlefc.callbackQueue.push(function () { window.googlefc.showRevocationMessage(); });
    } else {
      showBanner();
    }
  });

  // Bàner propi només si el CMP de Google no apareix
  function check() {
    if (hasCMP()) return;
    var stored = get();
    if (stored) applyConsent(stored); else showBanner();
  }
  if (document.readyState === 'complete') setTimeout(check, 2500);
  else window.addEventListener('load', function () { setTimeout(check, 2500); });
})();
