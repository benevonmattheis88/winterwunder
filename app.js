(function () {
  'use strict';
  var YEAR = 2026, MONTH = 11; // Dezember
  var KIDS = { emma: { name: 'Emma', icon: '🎮' }, samu: { name: 'Samu', icon: '⚽' } };
  var app = document.getElementById('app');
  var REST_NOTE = '<div class="restnote">🧱 <b>Teil fehlt?</b> Es gibt eine Tüte mit der Aufschrift <b>„Rest“</b>. Darin sind alle Steine, die beim Aufteilen übrig geblieben sind. Wenn dir ein Teil fehlt, darfst du in der Restetüte nachschauen.</div>';

  // ---------- Speicher (darf fehlschlagen) ----------
  function sget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function sdel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  // ---------- Vorschau-Modus für Eltern: ?vorschau=winter ----------
  var preview = false;
  try {
    var q = new URLSearchParams(location.search).get('vorschau');
    if (q === 'winter') sessionStorage.setItem('ak-preview', '1');
    if (q === 'aus') sessionStorage.removeItem('ak-preview');
    preview = sessionStorage.getItem('ak-preview') === '1';
  } catch (e) {}

  // ---------- Entschlüsseln (identisch zu build.js) ----------
  function norm(s) {
    return String(s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
  }
  function hash32(str, seed) {
    var h = seed >>> 0 ^ 0x9e3779b9;
    for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 0x5bd1e995); h ^= h >>> 15; }
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function tryDecrypt(kid, day, key, encs) {
    for (var e = 0; e < encs.length; e++) {
      var bin = atob(encs[e]); var bytes = new Uint8Array(bin.length);
      var s = hash32(window.AK_SALT + '|' + kid + '|' + day + '|' + key, 1) || 1;
      for (var i = 0; i < bin.length; i++) {
        s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
        bytes[i] = bin.charCodeAt(i) ^ (s & 255);
      }
      try {
        var txt = new TextDecoder().decode(bytes);
        if (txt.indexOf('{"ok":1') === 0) return JSON.parse(txt);
      } catch (x) {}
    }
    return null;
  }

  // ---------- Hilfen ----------
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'class') n.className = attrs[k]; else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]); else n.setAttribute(k, attrs[k]); }
    if (html != null) n.innerHTML = html;
    return n;
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function seeded(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function today() { return new Date(); }
  function unlocked(day) {
    if (preview) return true;
    return today() >= new Date(YEAR, MONTH, day);
  }
  function isToday(day) { var d = today(); return d.getFullYear() === YEAR && d.getMonth() === MONTH && d.getDate() === day; }
  function solvedKey(kid, day) { return 'ak-' + kid + '-' + day; }
  function getSolved(kid, day) { var v = sget(solvedKey(kid, day)); try { return v ? JSON.parse(v) : null; } catch (e) { return null; } }

  // ---------- Schnee ----------
  (function snow() {
    var box = document.getElementById('snow'); var n = window.innerWidth < 500 ? 22 : 36;
    for (var i = 0; i < n; i++) {
      var f = el('span', { class: 'flake' }, Math.random() < .5 ? '❄' : '•');
      f.style.left = Math.random() * 100 + 'vw';
      f.style.fontSize = (8 + Math.random() * 14) + 'px';
      f.style.opacity = .5 + Math.random() * .5;
      f.style.animationDuration = (8 + Math.random() * 12) + 's';
      f.style.animationDelay = (-Math.random() * 20) + 's';
      box.appendChild(f);
    }
  })();

  var SNOWMAN = '<svg viewBox="0 0 150 170" aria-hidden="true">' +
    '<circle cx="75" cy="125" r="40" fill="#fff" stroke="#e6d3ad" stroke-width="2"/>' +
    '<circle cx="75" cy="72" r="30" fill="#fff" stroke="#e6d3ad" stroke-width="2"/>' +
    '<path d="M43 62 Q75 20 107 62 Z" fill="#e9c97f" stroke="#c9973f" stroke-width="2"/>' +
    '<rect x="40" y="56" width="70" height="12" rx="6" fill="#f6e6c0" stroke="#c9973f" stroke-width="2"/>' +
    '<circle cx="75" cy="24" r="11" fill="#f1d58f" stroke="#c9973f" stroke-width="2"/>' +
    '<circle cx="64" cy="76" r="4" fill="#3d2a1b"/><circle cx="86" cy="76" r="4" fill="#3d2a1b"/>' +
    '<circle cx="65.5" cy="74.5" r="1.3" fill="#fff"/><circle cx="87.5" cy="74.5" r="1.3" fill="#fff"/>' +
    '<circle cx="57" cy="85" r="5" fill="#f4b8b0" opacity=".7"/><circle cx="93" cy="85" r="5" fill="#f4b8b0" opacity=".7"/>' +
    '<path d="M75 81 L92 86 L75 87 Z" fill="#e8893a"/>' +
    '<path d="M68 92 Q75 97 82 92" stroke="#3d2a1b" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<path d="M47 98 Q75 112 103 98 L103 108 Q75 120 47 108 Z" fill="#ead19b" stroke="#c9973f" stroke-width="2"/>' +
    '<path d="M88 106 L96 140 L84 140 L80 110 Z" fill="#ead19b" stroke="#c9973f" stroke-width="2"/>' +
    '<circle cx="75" cy="125" r="3.5" fill="#9a6b22"/><circle cx="75" cy="140" r="3.5" fill="#9a6b22"/>' +
    '</svg>';

  // ---------- Router ----------
  function route() {
    var h = location.hash.replace('#', '').split('/');
    var kid = h[0]; var day = parseInt(h[1], 10);
    if (!KIDS[kid]) { kid = sget('ak-kid'); if (KIDS[kid] && !h[0]) { location.replace('#' + kid); return; } return home(); }
    sset('ak-kid', kid);
    if (day >= 1 && day <= 24) return dayView(kid, day);
    calendar(kid);
  }
  window.addEventListener('hashchange', function () { window.scrollTo(0, 0); route(); });

  function previewBar() { return preview ? el('div', { class: 'preview' }, '👀 Vorschau-Modus: alle Türchen sind offen. <a href="?vorschau=aus#">Beenden</a>') : null; }

  function home() {
    app.innerHTML = '';
    var pb = previewBar(); if (pb) app.appendChild(pb);
    app.appendChild(el('h1', { class: 'script' }, 'Winterwunder'));
    app.appendChild(el('p', { class: 'sub' }, 'Der Adventskalender für Emma &amp; Samu'));
    app.appendChild(el('div', { class: 'hero' }, SNOWMAN));
    app.appendChild(el('p', { class: 'sub' }, 'Wer bist du?'));
    var k = el('div', { class: 'kids' });
    Object.keys(KIDS).forEach(function (id) {
      k.appendChild(el('button', { class: 'kid', onclick: function () { location.hash = id; } }, '<div class="big">' + KIDS[id].icon + '</div><div class="nm">' + KIDS[id].name + '</div>'));
    });
    app.appendChild(k);
    app.appendChild(el('p', { class: 'foot' }, 'Jeden Tag ein Rätsel. Wer es löst, erfährt, welches Tütchen geöffnet werden darf.'));
  }

  function calendar(kid) {
    var tasks = window.AK_DATA[kid];
    app.innerHTML = '';
    var pb = previewBar(); if (pb) app.appendChild(pb);
    var top = el('div', { class: 'topbar' });
    top.appendChild(el('button', { class: 'link', onclick: function () { sdel('ak-kid'); location.hash = ''; home(); } }, '← Wechseln'));
    var done = 0; for (var d = 1; d <= 24; d++) if (getSolved(kid, d)) done++;
    top.appendChild(el('span', { class: 'pill' }, done + ' von 24 gelöst'));
    app.appendChild(top);
    app.appendChild(el('h1', { class: 'script' }, 'Hallo ' + KIDS[kid].name + '!'));
    var now = today(); var started = now >= new Date(YEAR, MONTH, 1) || preview;
    app.appendChild(el('p', { class: 'sub' }, started ? 'Tippe auf das leuchtende Türchen von heute.' : 'Ab dem 1. Dezember geht es los. Noch ein bisschen Geduld! ⛄'));
    var g = el('div', { class: 'grid' });
    tasks.forEach(function (t) {
      var day = t.day; var s = getSolved(kid, day); var open = unlocked(day);
      var cls = 'door' + (open ? '' : ' locked') + (s ? ' done' : '') + (open && !s && (isToday(day) || preview) ? ' today' : '');
      var inner = '<div class="n">' + day + '</div>' + (s ? '<div class="sym">' + s.sym + '</div>' : '<div class="s">' + (open ? 'offen' : '🔒 ' + day + '.12.') + '</div>');
      g.appendChild(el('button', { class: cls, 'aria-label': 'Türchen ' + day, onclick: function () {
        if (!unlocked(day)) { toast('Dieses Türchen öffnet sich erst am ' + day + '. Dezember.'); return; }
        location.hash = kid + '/' + day;
      } }, inner));
    });
    app.appendChild(g);
    if (kid === 'emma') app.appendChild(el('div', null, REST_NOTE));
    if (preview) app.appendChild(el('p', { class: 'foot' }, '<button class="link" id="reset">Gelöste Türchen auf diesem Gerät zurücksetzen</button>'));
    var r = document.getElementById('reset'); if (r) r.onclick = function () { for (var d = 1; d <= 24; d++) sdel(solvedKey(kid, d)); calendar(kid); };
  }

  function toast(text) {
    var t = el('div', { class: 'card', style: 'position:fixed;left:16px;right:16px;bottom:16px;z-index:9;text-align:center;max-width:520px;margin:0 auto;font-weight:700' }, text);
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2400);
  }

  // ---------- Tagesansicht ----------
  function dayView(kid, day) {
    if (!unlocked(day)) { location.hash = kid; return; }
    var t = window.AK_DATA[kid][day - 1];
    app.innerHTML = '';
    var pb = previewBar(); if (pb) app.appendChild(pb);
    var top = el('div', { class: 'topbar' });
    top.appendChild(el('button', { class: 'link', onclick: function () { location.hash = kid; } }, '← Kalender'));
    top.appendChild(el('span', { class: 'pill' }, KIDS[kid].name));
    app.appendChild(top);
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'day-label' }, day + '. Dezember'));
    card.appendChild(el('h2', null, t.title));
    app.appendChild(card);
    if (kid === 'emma') app.appendChild(el('div', null, REST_NOTE));

    var solved = getSolved(kid, day);
    if (solved) { showReveal(card, kid, day, solved, false); return; }

    card.appendChild(el('div', { class: 'task-text' }, t.text));
    var area = el('div'); card.appendChild(area);
    var msg = el('div', { class: 'msg', 'aria-live': 'polite' }); card.appendChild(msg);
    var hintBox = el('div'); card.appendChild(hintBox);
    var tries = 0;

    var ctx = {
      // key: Lösungsschlüssel. Gibt true zurück, wenn richtig.
      check: function (key) {
        var res = tryDecrypt(kid, day, norm(key), t.enc);
        if (res) { win(res); return true; }
        tries++;
        msg.className = 'msg bad'; msg.textContent = ['Leider nicht richtig. Versuch es nochmal!', 'Noch nicht ganz. Du schaffst das!', 'Fast! Probier es noch einmal.'][tries % 3];
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        if (t.hint && !hintBox.innerHTML) hintBox.innerHTML = '<div class="hint">💡 <b>Tipp:</b> ' + t.hint + '</div>';
        return false;
      },
      say: function (text, ok) { msg.className = 'msg ' + (ok ? 'ok' : 'bad'); msg.textContent = text; },
      won: function () { var r = tryDecrypt(kid, day, 'gewonnen', t.enc); if (r) win(r); },
      hint: function () { if (t.hint && !hintBox.innerHTML) hintBox.innerHTML = '<div class="hint">💡 <b>Tipp:</b> ' + t.hint + '</div>'; }
    };
    function win(res) {
      sset(solvedKey(kid, day), JSON.stringify(res));
      stopAll();
      card.innerHTML = '';
      card.appendChild(el('div', { class: 'day-label' }, day + '. Dezember'));
      card.appendChild(el('h2', null, t.title));
      showReveal(card, kid, day, res, true);
    }
    (GAMES[t.type] || GAMES.input)(area, t, ctx);
  }

  function showReveal(card, kid, day, res, fresh) {
    var r = el('div', { class: 'reveal' });
    r.innerHTML = (fresh ? '<p class="big">🎉 Richtig gelöst!</p>' : '<p class="big">Schon gelöst ✓</p>') +
      '<p>Heute darfst du dieses Tütchen öffnen:</p>' +
      '<div class="bag"><div class="ini">' + res.initial + '</div><div class="em">' + res.sym + '</div></div>' +
      '<p class="big">' + KIDS[kid].name + ' · ' + res.symName + '</p>' +
      '<p class="sub">Such das Tütchen mit dem <b>' + res.initial + '</b> und dem gemalten <b>' + res.symName + '</b>.</p>';
    card.appendChild(r);
    if (kid === 'emma') {
      var lg = el('div', { class: 'lego' });
      if (res.lego) {
        lg.innerHTML = '<h2 style="margin-top:16px">🧱 Heute baust du: Schritt ' + res.lego.steps + '</h2>' +
          '<p class="sub" style="text-align:left">Such auf ' + ((res.lego.imgs || []).length > 1 ? 'den Bildern' : 'dem Bild') + ' die Schritte mit diesen Nummern. Tippe ein Bild an, um es groß zu sehen.</p>';
        (res.lego.imgs || []).forEach(function (src) { var a = el('a', { href: src, target: '_blank', rel: 'noopener' }); var im = el('img', { src: src, alt: 'Bauanleitung Schritt ' + res.lego.steps, loading: 'lazy' }); im.onerror = function () { a.remove(); }; a.appendChild(im); lg.appendChild(a); });
      } else {
        lg.innerHTML = '<p class="sub" style="margin-top:14px">🧱 Die Bauanleitung für heute erscheint hier.</p>';
      }
      card.appendChild(lg);
    }
    card.appendChild(el('div', { class: 'row' }, '')).appendChild(el('button', { class: 'btn block', onclick: function () { location.hash = kid; } }, 'Zurück zum Kalender'));
    if (fresh) burst();
  }
  function burst() {
    var e = ['⭐', '❄️', '✨', '🎉', '🎄'];
    for (var i = 0; i < 26; i++) {
      var b = el('div', { class: 'burst' }, e[i % e.length]);
      b.style.left = '50%'; b.style.top = '40%';
      b.style.setProperty('--dx', (Math.random() * 300 - 150) + 'px');
      b.style.setProperty('--dy', (Math.random() * 360 - 200) + 'px');
      document.body.appendChild(b); (function (x) { setTimeout(function () { x.remove(); }, 1500); })(b);
    }
  }

  // ---------- Timer-Verwaltung ----------
  var timers = [];
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function every(fn, ms) { var id = setInterval(fn, ms); timers.push(id); return id; }
  function frame(fn) { var alive = true; timers.push({ stop: function () { alive = false; } }); (function loop(ts) { if (!alive) return; fn(ts); requestAnimationFrame(loop); })(performance.now()); }
  function stopAll() { timers.forEach(function (t) { if (t && t.stop) t.stop(); else { clearTimeout(t); clearInterval(t); } }); timers = []; }
  window.addEventListener('hashchange', stopAll);

  // ---------- Aufgabentypen ----------
  var GAMES = {};

  GAMES.input = function (area, t, ctx) {
    var row = el('form', { class: 'row' });
    var inp = el('input', { class: 'answer', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: 'Deine Antwort', 'aria-label': 'Antwort' });
    row.appendChild(inp);
    row.appendChild(el('button', { class: 'btn', type: 'submit' }, 'OK'));
    row.addEventListener('submit', function (e) { e.preventDefault(); if (!inp.value.trim()) return; if (!ctx.check(inp.value)) inp.select(); });
    area.appendChild(row);
  };

  GAMES.quiz = function (area, t, ctx) {
    var box = el('div', { class: 'opts' });
    t.options.forEach(function (o) {
      var b = el('button', { class: 'opt' }, o);
      b.onclick = function () { if (!ctx.check(o)) b.classList.add('wrong'); };
      box.appendChild(b);
    });
    area.appendChild(box);
  };

  GAMES.order = function (area, t, ctx) {
    var picked = [];
    var chosen = el('div', { class: 'chosen' });
    var box = el('div', { class: 'opts' });
    function draw() {
      chosen.innerHTML = picked.length ? picked.map(function (p, i) { return '<span>' + (i + 1) + '. ' + p + '</span>'; }).join('') : '<span style="background:none;color:#8a6f55">Tippe unten in der richtigen Reihenfolge …</span>';
      box.innerHTML = '';
      t.items.forEach(function (it) {
        if (picked.indexOf(it) >= 0) return;
        box.appendChild(el('button', { class: 'opt', onclick: function () {
          picked.push(it); draw();
          if (picked.length === t.items.length) {
            if (!ctx.check(picked.join('|'))) { setTimeout(function () { picked = []; draw(); }, 900); }
          }
        } }, it));
      });
    }
    area.appendChild(chosen); area.appendChild(box); draw();
  };

  function emojiGrid(cols, cells) {
    var g = el('div', { class: 'egrid' });
    g.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    cells.forEach(function (c) { g.appendChild(c); });
    return g;
  }

  GAMES.count = function (area, t, ctx) {
    var list = [];
    Object.keys(t.grid.items).forEach(function (k) { for (var i = 0; i < t.grid.items[k]; i++) list.push(k); });
    var r = seeded(t.seed || 3); for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var x = list[i]; list[i] = list[j]; list[j] = x; }
    area.appendChild(emojiGrid(t.grid.cols, list.map(function (e) { return el('span', null, e); })));
    GAMES.input(area, t, ctx);
  };

  GAMES.find = function (area, t, ctx) {
    var round = 0;
    var info = el('div', { class: 'sub', style: 'margin-top:8px' }); area.appendChild(info);
    var holder = el('div'); area.appendChild(holder);
    function play() {
      var R = t.rounds[round]; var n = R.cols * R.rows; var need = R.count || 1; var got = 0;
      info.textContent = 'Runde ' + (round + 1) + ' von ' + t.rounds.length + (need > 1 ? ' · gefunden: 0 von ' + need : '');
      var cells = []; for (var i = 0; i < n; i++) cells.push(R.fill);
      var idx = shuffle(Array.from({ length: n }, function (_, i) { return i; }));
      var targets = idx.slice(0, need); var p = need;
      (R.decoys || []).forEach(function (d) { for (var k = 0; k < 2; k++) cells[idx[p++]] = d; });
      targets.forEach(function (i) { cells[i] = R.target; });
      var btns = cells.map(function (c, i) {
        var b = el('button', { 'aria-label': 'Feld' }, c);
        b.onclick = function () {
          if (targets.indexOf(i) >= 0 && !b.classList.contains('found')) {
            b.classList.add('found'); got++;
            if (need > 1) info.textContent = 'Runde ' + (round + 1) + ' von ' + t.rounds.length + ' · gefunden: ' + got + ' von ' + need;
            if (got === need) {
              round++;
              if (round >= t.rounds.length) { later(ctx.won, 500); }
              else { ctx.say('Super! Weiter geht’s …', true); later(play, 800); }
            }
          } else if (!b.classList.contains('found')) { b.classList.add('nope'); later(function () { b.classList.remove('nope'); }, 400); ctx.say('Das ist es nicht. Schau genau hin!'); }
        };
        return b;
      });
      holder.innerHTML = ''; holder.appendChild(emojiGrid(R.cols, btns));
    }
    play();
  };

  GAMES.memory = function (area, t, ctx) {
    var cards = shuffle(t.pairs.concat(t.pairs)); var open = []; var lock = false; var gone = 0; var moves = 0;
    var g = el('div', { class: 'mem' }); var info = el('div', { class: 'sub', style: 'margin-top:8px' }, 'Züge: 0');
    cards.forEach(function (c, i) {
      var b = el('button', { 'aria-label': 'Karte' }, '');
      b.onclick = function () {
        if (lock || b.classList.contains('up') || b.classList.contains('gone')) return;
        b.classList.add('up'); b.textContent = c; open.push([b, c]);
        if (open.length === 2) {
          moves++; info.textContent = 'Züge: ' + moves; lock = true;
          var a = open[0], z = open[1];
          if (a[1] === z[1]) { a[0].classList.add('gone'); z[0].classList.add('gone'); open = []; lock = false; gone += 2; if (gone === cards.length) later(ctx.won, 500); }
          else later(function () { [a, z].forEach(function (p) { p[0].classList.remove('up'); p[0].textContent = ''; }); open = []; lock = false; }, 800);
        }
      };
      g.appendChild(b);
    });
    area.appendChild(g); area.appendChild(info);
  };

  GAMES.simon = function (area, t, ctx) {
    var g = el('div', { class: 'simon wait' }); var btns = [];
    t.pads.forEach(function (p, i) { var b = el('button', { 'aria-label': 'Feld ' + (i + 1) }, p); btns.push(b); g.appendChild(b); });
    var info = el('div', { class: 'sub', style: 'margin-top:8px' });
    var start = el('button', { class: 'btn block', style: 'margin-top:12px' }, 'Los geht’s!');
    area.appendChild(g); area.appendChild(info); area.appendChild(start);
    var seq, level, pos;
    function flash(i, ms) { btns[i].classList.add('lit'); later(function () { btns[i].classList.remove('lit'); }, ms); }
    function show() {
      g.classList.add('wait'); pos = 0; info.textContent = 'Schau genau hin … (' + level + ' von ' + t.length + ')';
      for (var k = 0; k < level; k++) (function (k) { later(function () { flash(seq[k], 450); }, 700 + k * 700); })(k);
      later(function () { g.classList.remove('wait'); info.textContent = 'Jetzt du! (' + level + ' von ' + t.length + ')'; }, 700 + level * 700);
    }
    btns.forEach(function (b, i) {
      b.onclick = function () {
        flash(i, 200);
        if (i !== seq[pos]) { g.classList.add('wait'); ctx.say('Ups, falsch! Noch ein Versuch mit einer neuen Reihenfolge.'); start.style.display = ''; start.textContent = 'Nochmal'; return; }
        pos++;
        if (pos === level) {
          if (level === t.length) { g.classList.add('wait'); later(ctx.won, 500); return; }
          level++; ctx.say('Richtig! Jetzt eins mehr …', true); later(show, 500);
        }
      };
    });
    start.onclick = function () { start.style.display = 'none'; ctx.say('', true); seq = []; for (var i = 0; i < t.length; i++) seq.push(Math.floor(Math.random() * t.pads.length)); level = Math.min(2, t.length); show(); };
  };

  GAMES.lights = function (area, t, ctx) {
    var s = t.start.slice(); var box = el('div', { class: 'lights' }); var moves = 0;
    var info = el('div', { class: 'sub', style: 'margin-top:10px' });
    function draw() {
      box.innerHTML = '';
      s.forEach(function (v, i) {
        box.appendChild(el('button', { class: v ? 'on' : '', 'aria-label': 'Schalter ' + (i + 1), onclick: function () {
          [i - 1, i, i + 1].forEach(function (j) { if (j >= 0 && j < s.length) s[j] ^= 1; });
          moves++; draw();
          if (s.every(function (x) { return x === 1; })) { later(ctx.won, 600); }
        } }, v ? '💡' : ''));
      });
      info.textContent = 'Schaltungen: ' + moves;
    }
    var reset = el('button', { class: 'btn ghost block', style: 'margin-top:12px' }, 'Von vorne anfangen');
    reset.onclick = function () { s = t.start.slice(); moves = 0; draw(); };
    area.appendChild(box); area.appendChild(info); area.appendChild(reset); draw();
  };

  GAMES.words = function (area, t, ctx) {
    var N = t.size; var r = seeded(t.seed || 1);
    var dirs = [[0, 1], [1, 0]]; if (t.diagonal) dirs.push([1, 1], [-1, 1]);
    var grid, placed;
    for (var attempt = 0; attempt < 200; attempt++) {
      grid = []; for (var y = 0; y < N; y++) grid.push(new Array(N).fill(''));
      placed = []; var ok = true;
      for (var w = 0; w < t.words.length && ok; w++) {
        var word = t.words[w]; var done = false;
        for (var tries = 0; tries < 300 && !done; tries++) {
          var d = dirs[Math.floor(r() * dirs.length)];
          var sy = Math.floor(r() * N), sx = Math.floor(r() * N);
          var ey = sy + d[0] * (word.length - 1), ex = sx + d[1] * (word.length - 1);
          if (ey < 0 || ey >= N || ex >= N) continue;
          var fit = true;
          for (var k = 0; k < word.length; k++) { var c = grid[sy + d[0] * k][sx + d[1] * k]; if (c && c !== word[k]) { fit = false; break; } }
          if (!fit) continue;
          for (k = 0; k < word.length; k++) grid[sy + d[0] * k][sx + d[1] * k] = word[k];
          placed.push({ word: word, a: [sy, sx], b: [ey, ex], d: d }); done = true;
        }
        if (!done) ok = false;
      }
      if (ok) break;
    }
    var ABC = 'ABCDEFGHIKLMNOPRSTUZEAEINR';
    for (y = 0; y < N; y++) for (var x = 0; x < N; x++) if (!grid[y][x]) grid[y][x] = ABC[Math.floor(r() * ABC.length)];
    var g = el('div', { class: 'wgrid' }); g.style.gridTemplateColumns = 'repeat(' + N + ', 1fr)';
    var cells = []; var first = null; var found = 0;
    var list = el('div', { class: 'wlist' });
    var tags = {}; t.words.forEach(function (wd) { tags[wd] = el('span', null, wd); list.appendChild(tags[wd]); });
    for (y = 0; y < N; y++) { cells.push([]); for (x = 0; x < N; x++) (function (y, x) {
      var b = el('button', null, grid[y][x]); cells[y].push(b);
      b.onclick = function () {
        if (!first) { first = [y, x]; b.classList.add('sel'); return; }
        var f = first; first = null; cells[f[0]][f[1]].classList.remove('sel');
        var hit = placed.filter(function (p) { return !p.got && ((p.a[0] === f[0] && p.a[1] === f[1] && p.b[0] === y && p.b[1] === x) || (p.b[0] === f[0] && p.b[1] === f[1] && p.a[0] === y && p.a[1] === x)); })[0];
        if (hit) {
          hit.got = true; found++; tags[hit.word].classList.add('got');
          for (var k = 0; k < hit.word.length; k++) cells[hit.a[0] + hit.d[0] * k][hit.a[1] + hit.d[1] * k].classList.add('hit');
          ctx.say(found === placed.length ? 'Alle gefunden!' : 'Gefunden: ' + hit.word, true);
          if (found === placed.length) later(ctx.won, 600);
        } else if (!(f[0] === y && f[1] === x)) { ctx.say('Das ist kein Wort aus der Liste. Tippe den ersten und den letzten Buchstaben an.'); }
      };
      g.appendChild(b);
    })(y, x); }
    area.appendChild(list); area.appendChild(g);
  };

  GAMES.penalty = function (area, t, ctx) {
    var pitch = el('div', { class: 'pitch' });
    pitch.innerHTML = '<div class="goal"></div><div class="keeper">🧤</div><div class="aim">🎯</div><div class="ball">⚽</div>';
    var score = el('div', { class: 'score' });
    var shoot = el('button', { class: 'btn block', style: 'margin-top:10px' }, 'Schießen!');
    area.appendChild(pitch); area.appendChild(score); area.appendChild(shoot);
    var keeper = pitch.querySelector('.keeper'), aim = pitch.querySelector('.aim'), ball = pitch.querySelector('.ball');
    var goals, shots, busy, kx = .5, ax = .5, t0 = performance.now(), results;
    function reset() { goals = 0; shots = 0; busy = false; results = []; drawScore(); shoot.textContent = 'Schießen!'; }
    function drawScore() { score.innerHTML = results.map(function (r) { return r ? '✅' : '❌'; }).join('') + '<span style="opacity:.5">' + new Array(t.shots - results.length + 1).join('⚪') + '</span>'; }
    function tri(x) { x = x % 2; return x < 1 ? x : 2 - x; }
    frame(function (ts) {
      if (busy) return;
      var s = (ts - t0) / 1000;
      kx = .14 + .72 * (.5 + .5 * Math.sin(s * 1.7 * t.speed));
      ax = .12 + .76 * tri(s * .55 * (1 + .25 * t.speed));
      keeper.style.left = (kx * 100) + '%'; aim.style.left = (ax * 100) + '%';
    });
    shoot.onclick = function () {
      if (busy) return;
      if (shots >= t.shots) { reset(); return; }
      busy = true; shots++;
      var goal = Math.abs(ax - kx) > .16;
      ball.style.left = (ax * 100) + '%'; ball.style.bottom = '160px'; ball.style.fontSize = '1.5rem';
      later(function () {
        results.push(goal); if (goal) goals++; drawScore();
        ctx.say(goal ? 'TOOOR! ⚽🎉' : 'Gehalten! 🧤', goal);
        if (goals >= t.goals) { later(ctx.won, 700); return; }
        if (t.shots - shots < t.goals - goals) { ctx.say('Schade, das reicht nicht mehr. Versuch es nochmal!'); shots = t.shots; shoot.textContent = 'Nochmal'; }
        later(function () { ball.style.transition = 'none'; ball.style.left = '50%'; ball.style.bottom = '20px'; ball.style.fontSize = ''; void ball.offsetWidth; ball.style.transition = ''; busy = false; }, 650);
      }, 380);
    };
    reset();
  };

  GAMES.catch = function (area, t, ctx) {
    var arena = el('div', { class: 'arena' });
    var stat = el('div', { class: 'stat' });
    var start = el('button', { class: 'btn block', style: 'margin-top:10px' }, 'Start!');
    area.appendChild(stat); area.appendChild(arena); area.appendChild(start);
    var points, left, running = false;
    function draw() { stat.innerHTML = '<span>' + t.good + ' ' + points + ' / ' + t.need + '</span><span>⏱️ ' + left + ' s</span>'; }
    points = 0; left = t.time; draw();
    function spawn() {
      if (!running) return;
      var bad = t.bad && Math.random() < .28;
      var b = el('button', { 'aria-label': bad ? 'Kohle' : 'Treffer' }, bad ? t.bad : t.good);
      b.style.left = (10 + Math.random() * 80) + '%'; b.style.top = (12 + Math.random() * 76) + '%';
      b.onpointerdown = function (e) {
        e.preventDefault(); b.remove(); if (!running) return;
        if (bad) { points = Math.max(0, points - 2); ctx.say('Autsch, Kohle! −2', false); } else { points++; }
        draw();
        if (points >= t.need) { running = false; arena.innerHTML = ''; later(ctx.won, 300); }
      };
      arena.appendChild(b); later(function () { b.remove(); }, t.life);
    }
    start.onclick = function () {
      points = 0; left = t.time; running = true; start.style.display = 'none'; ctx.say('', true); draw();
      var sp = every(spawn, 520); spawn();
      var tm = every(function () {
        left--; draw();
        if (left <= 0 && running) { running = false; clearInterval(sp); clearInterval(tm); arena.innerHTML = ''; ctx.say('Zeit um! Du hattest ' + points + '. Versuch es nochmal!'); start.textContent = 'Nochmal'; start.style.display = ''; }
        if (!running) { clearInterval(sp); clearInterval(tm); }
      }, 1000);
    };
  };

  if (!window.AK_DATA) { app.innerHTML = '<p>Daten fehlen.</p>'; return; }
  route();
})();
