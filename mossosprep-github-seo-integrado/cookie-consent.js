/* MossosPrep — Banner de consentiment de cookies
   Ja inclòs a totes les pàgines amb:
   <script src="/cookie-consent.js" defer></script>
*/
(function () {
  if (localStorage.getItem('mp_cookie_consent')) return;

  var style = document.createElement('style');
  style.textContent = `
    #mp-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;
      background:#003087;color:#fff;padding:16px 20px;font-family:'DM Sans',Arial,sans-serif;
      display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center;
      box-shadow:0 -2px 12px rgba(0,0,0,.2);font-size:14px;line-height:1.5;}
    #mp-cookie-banner p{margin:0;flex:1 1 280px;max-width:640px;}
    #mp-cookie-banner a{color:#f59e0b;text-decoration:underline;}
    #mp-cookie-banner .mp-btns{display:flex;gap:8px;flex:0 0 auto;}
    #mp-cookie-banner button{cursor:pointer;border:none;border-radius:6px;padding:10px 18px;
      font-weight:600;font-size:14px;font-family:inherit;}
    #mp-cookie-accept{background:#f59e0b;color:#1a1a1a;}
    #mp-cookie-reject{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5)!important;}
    @media (max-width:480px){#mp-cookie-banner{flex-direction:column;align-items:stretch;text-align:center;}
      #mp-cookie-banner .mp-btns{justify-content:center;}}
  `;
  document.head.appendChild(style);

  var banner = document.createElement('div');
  banner.id = 'mp-cookie-banner';
  banner.innerHTML =
    '<p>Utilitzem cookies pròpies i de tercers (com Google) per millorar l\'experiència i, si acceptes, mostrar publicitat personalitzada. Pots consultar més informació a la nostra <a href="/privacy.html">política de privacitat</a>.</p>' +
    '<div class="mp-btns">' +
      '<button id="mp-cookie-reject">Rebutjar</button>' +
      '<button id="mp-cookie-accept">Acceptar</button>' +
    '</div>';
  document.body.appendChild(banner);

  function setConsent(value) {
    localStorage.setItem('mp_cookie_consent', value);
    banner.remove();
    // Si en el futur s'integra Google Consent Mode, aquí es pot cridar
    // gtag('consent', 'update', { ad_storage: value === 'accepted' ? 'granted' : 'denied', ... });
  }

  document.getElementById('mp-cookie-accept').addEventListener('click', function () {
    setConsent('accepted');
  });
  document.getElementById('mp-cookie-reject').addEventListener('click', function () {
    setConsent('rejected');
  });
})();
