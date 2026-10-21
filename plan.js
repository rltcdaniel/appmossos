/* MossosPrep — guies de pagament (contingut servit pel Worker de Cloudflare) */
(function () {
  // Guies de pagament de MossosPrep: el contingut el serveix el Worker només a qui ha pagat.
  var CFG = (document.currentScript && document.currentScript.dataset) || {};
  var API = 'https://mossosprep-worker.rltc-daniel.workers.dev/guide';
  var PRODUCT = CFG.product || 'competencies';
  var P = 'mp_plan_' + (PRODUCT === 'competencies' ? 'comp' : PRODUCT);
  var K = { access: P, cache: P + '_cache', quiz: P + '_quiz', fitxa: P + '_fitxa' };
  var $ = function (id) { return document.getElementById(id); };
  var get = function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  var put = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); };
  var track = function (n, p) { if (typeof gtag === 'function') gtag('event', n, p || {}); };

  function status(text, ko) {
    var el = $('plan-status');
    el.hidden = !text; el.textContent = text || ''; el.className = 'plan-status' + (ko ? ' is-ko' : '');
  }

  function call(payload) {
    payload.product = PRODUCT;
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); });
  }

  // ── Render de la guia ──
  function render(g) {
    $('guide-root').innerHTML = g.html;
    $('plan-locked').hidden = true;
    $('plan-unlocked').hidden = false;
    var toc = document.querySelector('#plan-unlocked .toc-box ol') || document.querySelector('.toc-box ol');
    if (toc && g.toc) toc.innerHTML = g.toc.map(function (t) { return '<li><a href="#' + t[0] + '">' + esc(t[1]) + '</a></li>'; }).join('');
    var card = CFG.asideCard ? document.querySelector('.aside-card') : null;
    if (card) card.innerHTML = '<strong>Pla desbloquejat</strong><p>El qüestionari i la fitxa es desen en aquest navegador. Imprimeix la fitxa abans de l\'entrevista.</p><a class="btn" href="#g-fitxa">Anar a la fitxa</a>';
    quiz(g); fitxa(g);
  }

  // ── Qüestionari de pràctica ──
  function quiz(g) {
    var box = $('g-quiz'); if (!box) return;
    var items = g.items, n = items.length;
    var order = items.map(function (_, i) { return i; });
    var seed = 7; // ordre barrejat però sempre el mateix
    for (var i = n - 1; i > 0; i--) { seed = (seed * 9301 + 49297) % 233280; var j = Math.floor(seed / 233280 * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
    var ans = get(K.quiz) || {};
    var html = '<div class="q-head"><span class="q-count" id="q-count"></span><span class="q-legend">1 = gens d\'acord · 5 = totalment d\'acord</span></div>';
    order.forEach(function (idx, k) {
      html += '<div class="q-item"><p>' + (k + 1) + '. ' + esc(items[idx][1]) + '</p><div class="q-scale" role="radiogroup" aria-label="Afirmació ' + (k + 1) + '">';
      for (var v = 1; v <= 5; v++) {
        var id = 'q' + idx + '-' + v;
        html += '<input type="radio" name="q' + idx + '" id="' + id + '" value="' + v + '"' + (ans[idx] == v ? ' checked' : '') + '/><label for="' + id + '">' + v + '</label>';
      }
      html += '</div></div>';
    });
    html += '<div class="q-actions"><button class="btn" type="button" id="q-go">Veure el meu perfil</button><button class="btn secondary" type="button" id="q-reset">Tornar a començar</button></div><div id="q-out"></div>';
    box.innerHTML = html;
    function count() { var c = Object.keys(ans).length; $('q-count').textContent = c + ' de ' + n + ' respostes'; return c; }
    box.addEventListener('change', function (e) {
      if (e.target.type !== 'radio') return;
      ans[e.target.name.slice(1)] = +e.target.value; put(K.quiz, ans); count();
    });
    $('q-go').addEventListener('click', function () {
      if (count() < n) { $('q-out').innerHTML = '<p class="plan-msg is-ko">Et falten ' + (n - count()) + ' afirmacions per respondre.</p>'; return; }
      result(g, ans); track('plan_quiz', { product: PRODUCT });
    });
    $('q-reset').addEventListener('click', function () {
      ans = {}; put(K.quiz, ans);
      box.querySelectorAll('input').forEach(function (r) { r.checked = false; });
      $('q-out').innerHTML = ''; count();
    });
    count();
    if (count() === n) result(g, ans);
  }

  function result(g, ans) {
    var items = g.items, val = function (i) { var v = ans[i]; return items[i][2] ? 6 - v : v; };
    var score = {}, total = 0;
    g.comps.forEach(function (c) {
      var vs = []; items.forEach(function (it, i) { if (it[0] === c.id) vs.push(val(i)); });
      var m = vs.reduce(function (a, b) { return a + b; }, 0) / vs.length;
      score[c.id] = 1 + (m - 1) * 9 / 4; total += score[c.id];
    });
    var ctrl = []; items.forEach(function (it, i) { if (it[0] === '_s') ctrl.push(ans[i]); });
    var desir = ctrl.reduce(function (a, b) { return a + b; }, 0) / ctrl.length;
    var incoh = g.pairs.filter(function (p) { return Math.abs(ans[p[0]] - (6 - ans[p[1]])) >= 3; }).length;
    var threes = Object.keys(ans).filter(function (k) { return ans[k] === 3; }).length / items.length;
    var f = function (x) { return x.toLocaleString('ca-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); };

    var bars = g.comps.map(function (c) {
      var s = score[c.id], cls = s <= 4 ? ' is-low' : s < 6 ? ' is-mid' : '';
      return '<div class="q-bar' + cls + '"><span>' + esc(c.name) + (c.key ? ' · clau' : '') + '</span><b>' + f(s) + '</b><i style="--w:' + (s * 10) + '%"></i></div>';
    }).join('');

    var flags = [];
    flags.push(desir >= 4 ? ['is-ko', 'Respostes massa favorables', 'Has estat molt d\'acord amb afirmacions que gairebé ningú no pot dir de veritat ("no he dit mai cap mentida"). En un test real, això fa sospitar que respons per imatge. Respon com ets.']
      : desir >= 3.3 ? ['is-mid', 'Una mica massa favorable', 'Algunes respostes sonen a perfecció. Revisa les afirmacions absolutes ("mai", "sempre") i respon pensant en fets concrets.']
      : ['is-ok', 'Sinceritat', 'No hi ha senyals de respostes massa favorables.']);
    flags.push(incoh >= 2 ? ['is-ko', 'Respostes incoherents', 'En ' + incoh + ' parelles d\'afirmacions que diuen el mateix amb paraules diferents has respost coses contràries. És el que més es nota en un test real.']
      : incoh === 1 ? ['is-mid', 'Una incoherència', 'En una parella d\'afirmacions equivalents has respost de manera contradictòria. Llegeix amb calma les negacions.']
      : ['is-ok', 'Coherència', 'Les afirmacions equivalents tenen respostes coherents.']);
    flags.push(threes >= 0.4 ? ['is-mid', 'Massa respostes neutres', 'Has respost "3" en el ' + Math.round(threes * 100) + ' % de les afirmacions. Un perfil massa neutre no mostra cap competència: fes servir els extrems quan siguin veritat.']
      : ['is-ok', 'Respostes definides', 'Fas servir tota l\'escala de resposta.']);

    var keyLow = g.comps.filter(function (c) { return c.key && score[c.id] <= 3; });
    var low = g.comps.slice().sort(function (a, b) { return score[a.id] - score[b.id]; }).slice(0, 3);
    var out = '<div class="q-result"><h3>El teu perfil orientatiu: ' + f(total) + ' de 100</h3>' +
      '<p>No és la nota oficial. Mostra com et descrius i on et convé preparar millor els exemples.' + (keyLow.length ? ' <strong>Compte: surts per sota de 4 a ' + keyLow.map(function (c) { return esc(c.name.toLowerCase()); }).join(' i ') + ', una competència clau.</strong>' : '') + '</p>' +
      '<div class="q-bars">' + bars + '</div><div class="q-flags">' +
      flags.map(function (x) { return '<div class="q-flag ' + x[0] + '"><strong>' + x[1] + '</strong>' + x[2] + '</div>'; }).join('') +
      '<div class="q-flag"><strong>Prepara primer</strong>' + low.map(function (c) { return '<a href="#c-' + c.id + '">' + esc(c.name) + '</a>'; }).join(' · ') + '. Repassa aquestes fitxes i busca-hi exemples concrets. Si en alguna et veus fluix de veritat, no ho maquillis al test: treballa-ho i prepara com explicar-ho a l\'entrevista.</div></div></div>';
    $('q-out').innerHTML = out;
  }

  // ── Fitxa d'exemples ──
  function fitxa(g) {
    var box = $('g-fitxa-box'); if (!box) return;
    var slots = [];
    g.comps.forEach(function (c) { slots.push([c, 0]); if (c.key) slots.push([c, 1]); });
    var data = get(K.fitxa) || {};
    box.innerHTML = '<div class="fitxa-head"><span class="fitxa-progress" id="fx-count"></span><p>Es desa només en aquest navegador.</p></div><div class="fitxa-bar"><span id="fx-bar"></span></div><div id="fx-list"></div>' +
      '<div class="fitxa-actions"><button class="btn" type="button" id="fx-print">Imprimir la fitxa</button><button class="btn secondary" type="button" id="fx-copy">Copiar</button></div><p class="fitxa-note" id="fx-msg" aria-live="polite"></p>';
    var list = $('fx-list');
    slots.forEach(function (s, i) {
      var c = s[0], k = c.id + '-' + s[1];
      var d = document.createElement('details'); if (i === 0) d.open = true;
      d.innerHTML = '<summary>' + esc(c.name) + (c.key ? ' <span class="key-badge">Clau · exemple ' + (s[1] + 1) + '</span>' : '') + '</summary><p>' + esc(c.prep) + '</p>';
      var t = document.createElement('textarea'); t.value = data[k] || ''; t.setAttribute('aria-label', 'Exemple de ' + c.name);
      t.placeholder = 'Situació: …\nTasca: …\nAcció (què vaig fer jo): …\nResultat i aprenentatge: …';
      t.style.minHeight = '130px';
      t.addEventListener('input', function () { data[k] = t.value; put(K.fitxa, data); refresh(); });
      d.appendChild(t); list.appendChild(d); s.push(d, k);
    });
    function refresh() {
      var done = 0;
      slots.forEach(function (s) { var ok = (data[s[3]] || '').trim().length >= 40; s[2].classList.toggle('is-done', ok); if (ok) done++; });
      $('fx-count').textContent = done + ' de ' + slots.length + ' exemples';
      $('fx-bar').style.width = (done / slots.length * 100) + '%';
    }
    function text() {
      return 'Fitxa d\'exemples · MossosPrep\n\n' + slots.map(function (s) { return s[0].name + (s[0].key ? ' (clau, exemple ' + (s[1] + 1) + ')' : '') + '\n' + ((data[s[3]] || '').trim() || '—'); }).join('\n\n');
    }
    $('fx-copy').addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text()).then(function () { $('fx-msg').textContent = 'Fitxa copiada.'; }, function () { $('fx-msg').textContent = 'No s\'ha pogut copiar.'; });
    });
    $('fx-print').addEventListener('click', function () {
      var w = window.open('', '_blank'); if (!w) { $('fx-msg').textContent = 'El navegador ha bloquejat la finestra d\'impressió.'; return; }
      w.document.write('<!doctype html><meta charset="utf-8"><title>Fitxa d\'exemples</title><style>body{font:15px/1.5 Arial,sans-serif;max-width:720px;margin:28px auto;padding:0 16px;color:#17202E}h1{font-size:21px}h2{font-size:15px;margin:18px 0 4px}p{white-space:pre-wrap;margin:0}</style><h1>Fitxa d\'exemples · MossosPrep</h1>' +
        slots.map(function (s) { return '<h2>' + esc(s[0].name) + (s[0].key ? ' (clau, exemple ' + (s[1] + 1) + ')' : '') + '</h2><p>' + esc((data[s[3]] || '').trim() || '—') + '</p>'; }).join(''));
      w.document.close(); w.focus(); w.print(); track('plan_print', { product: PRODUCT });
    });
    refresh();
  }

  // ── Accés ──
  function unlock(payload, fromCache) {
    return call(payload).then(function (r) {
      if (r && r.ok && r.guide) {
        put(K.access, payload.session_id ? { session_id: payload.session_id } : { email: payload.email });
        put(K.cache, r.guide);
        if (!fromCache) render(r.guide);
        else if (r.guide.v !== fromCache.v) render(r.guide);
        return 'ok';
      }
      return (r && (r.reason || r.error)) || 'error';
    }, function () { return 'network'; });
  }

  var params = new URLSearchParams(location.search);
  var sid = params.get('session_id');
  var cached = get(K.cache), access = get(K.access);

  if (sid) {
    status('Comprovant el pagament…');
    history.replaceState({}, '', location.pathname + location.hash);
    unlock({ session_id: sid }).then(function (res) {
      if (res === 'ok') { status(''); track('plan_unlock', { product: PRODUCT, via: 'session' }); window.scrollTo(0, 0); }
      else if (res === 'pending') status('El pagament encara s\'està processant. Torna a carregar la pàgina en uns minuts o recupera l\'accés amb el teu correu.', true);
      else if (res === 'network') status('No hem pogut comprovar el pagament ara mateix. Torna a carregar la pàgina o recupera l\'accés amb el teu correu.', true);
      else status('No hem trobat aquest pagament. Si has pagat, recupera l\'accés amb el correu de la compra o escriu-nos a rltc.daniel@gmail.com.', true);
    });
  } else if (access && cached) {
    render(cached);
    unlock(access, cached).then(function (res) {
      if (res !== 'ok' && res !== 'network') { try { localStorage.removeItem(K.cache); localStorage.removeItem(K.access); } catch (e) {} location.reload(); }
    });
  } else if (access) {
    unlock(access);
  } else {
    // Compres de la guia aptitudinal fetes abans de passar al Worker: cal recuperar-la amb el correu
    var legacy = false;
    try { legacy = PRODUCT === 'aptitudinal' && localStorage.getItem('mp_aptitudinal_unlocked') === 'true'; } catch (e) {}
    if (legacy) status('Hem renovat l\'accés a la guia. Escriu el correu amb què la vas comprar a «Ja l\'has comprat?» i s\'obrirà de nou.');
  }

  $('recover-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('recover-email').value.trim(), msg = $('recover-msg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.className = 'plan-msg is-ko'; msg.textContent = 'Escriu un correu vàlid.'; return; }
    msg.className = 'plan-msg is-wait'; msg.textContent = 'Comprovant…';
    unlock({ email: email }).then(function (res) {
      if (res === 'ok') { msg.textContent = ''; track('plan_unlock', { product: PRODUCT, via: 'email' }); window.scrollTo(0, 0); return; }
      msg.className = 'plan-msg is-ko';
      msg.textContent = res === 'network' ? 'No hem pogut connectar. Torna-ho a provar en uns minuts.'
        : 'No trobem cap compra del pla amb aquest correu. Comprova que és el mateix amb què vas pagar o escriu-nos a rltc.daniel@gmail.com.';
    });
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-cta]'); if (a) track('plan_cta_click', { cta: a.getAttribute('data-cta') });
  });
})();
