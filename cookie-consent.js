/* MossosPrep — Banner de consentiment de cookies
   Ja inclòs a totes les pàgines amb:
   <script src="/cookie-consent.js" defer></script>
*/
(function () {
  if (localStorage.getItem('mp_cookie_consent')) return;

  var style = document.createElement('style');
  style.textContent = `
    #mp-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;
      background:#071C45;color:#fff;border-top:4px solid #D3121C;padding:16px 20px;
      font-family:"Archivo",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
      display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:center;
      font-size:15px;line-height:1.5;}
    #mp-cookie-banner p{margin:0;flex:1 1 280px;max-width:680px;color:#D6E0F2;}
    #mp-cookie-banner a{color:#FFB71B;text-decoration:underline;}
    #mp-cookie-banner .mp-btns{display:flex;gap:8px;flex:0 0 auto;}
    #mp-cookie-banner button{cursor:pointer;border:2px solid transparent;border-radius:6px;padding:10px 18px;
      font-weight:700;font-size:15px;font-family:inherit;}
    #mp-cookie-accept{background:#FFB71B;color:#071C45;}
    #mp-cookie-reject{background:transparent;color:#fff;border-color:rgba(255,255,255,.6)!important;}
    #mp-cookie-banner button:focus-visible{outline:3px solid #FFB71B;outline-offset:2px;}
    @media (max-width:480px){#mp-cookie-banner{flex-direction:column;align-items:stretch;text-align:left;}
      #mp-cookie-banner .mp-btns{justify-content:stretch;}#mp-cookie-banner button{flex:1}}
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
