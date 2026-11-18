/* Hillpointe homepage proposal — header, mobile menu and the logo-mark hero zoom. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var calm = root.classList.contains('calm');

  /* ---------- header: solid once the page moves ---------- */
  var hdr = $('#hdr');
  function onScrollHeader() { hdr.classList.toggle('is-stuck', window.scrollY > 40); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* desktop dropdown toggles (keyboard / touch) */
  $$('.nav__list > li.has-sub').forEach(function (li) {
    var b = $('.nav__tog', li);
    b.addEventListener('click', function () {
      var open = !li.classList.contains('open');
      $$('.nav__list > li.open').forEach(function (o) { o.classList.remove('open'); $('.nav__tog', o).setAttribute('aria-expanded', 'false'); });
      li.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-sub')) $$('.nav__list > li.open').forEach(function (o) { o.classList.remove('open'); });
  });

  /* ---------- mobile menu, built from the desktop nav ---------- */
  var mm = $('#mm'), body = $('#mm-body');
  $$('.nav__list > li').forEach(function (li, i) {
    var a = $(':scope > a', li), sub = $('.sub', li);
    var g = document.createElement('div'); g.className = 'mm__group';
    if (!sub) { var l = a.cloneNode(true); g.appendChild(l); body.appendChild(g); return; }
    var head = document.createElement('button');
    head.type = 'button'; head.className = 'mm__head';
    head.setAttribute('aria-expanded', 'false'); head.setAttribute('aria-controls', 'mm-sub-' + i);
    head.innerHTML = a.textContent + '<i aria-hidden="true"></i>';
    var panel = document.createElement('div'); panel.className = 'mm__panel'; panel.id = 'mm-sub-' + i;
    var inner = document.createElement('div'); inner.appendChild(sub.cloneNode(true)); inner.firstChild.className = '';
    panel.appendChild(inner);
    head.addEventListener('click', function () {
      var open = !g.classList.contains('open');
      g.classList.toggle('open', open); head.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    g.appendChild(head); g.appendChild(panel); body.appendChild(g);
  });
  var util = document.createElement('div'); util.className = 'mm__util';
  $$('.util a').forEach(function (a) { util.appendChild(a.cloneNode(true)); });
  body.appendChild(util);
  $('#burger').addEventListener('click', function () { mm.showModal(); });
  $('#mm-close').addEventListener('click', function () { mm.close(); });
  mm.addEventListener('click', function (e) { if (e.target.closest('a')) mm.close(); });

  /* ---------- video: play / pause ---------- */
  var video = $('#hero-video'), vctl = $('#vctl');
  var userPaused = false;
  vctl.addEventListener('click', function () {
    userPaused = !video.paused;
    if (userPaused) video.pause(); else video.play();
    vctl.classList.toggle('is-paused', userPaused);
    vctl.setAttribute('aria-label', userPaused ? 'Play video' : 'Pause video');
    $('span', vctl).textContent = userPaused ? 'Play' : 'Pause';
  });
  if (calm) { video.removeAttribute('autoplay'); video.pause(); }

  /* ---------- hero: zoom through the logo mark ----------
     Mark geometry in logo units (53 × 68). The zoom lands on the solid top-left block (0,0 → 23,32),
     scaled until that block alone covers the screen, so the end state is the plain, untinted video. */
  var MW = 53, MH = 68, BX = 11.5, BY = 16, BW = 23, BH = 32;
  var hero = $('#hero'), media = $('#hero-media'), slot = $('#hero-slot');
  var foot = $('#hero-foot'), scrim = $('#hero-scrim');
  var start = null, end = null, W = 0, H = 0;
  var target = 0, cur = 0, raf = 0;
  var forced = /[?&]p=([\d.]+)/.exec(location.search);
  if (forced && !/[?&]notag/.test(location.search)) { /* make the review freeze obvious, with a one-click way back to normal scrolling */
    var tag = document.createElement('a');
    tag.className = 'freeze-tag'; tag.href = location.pathname;
    tag.textContent = 'Hero frozen at ' + forced[1] + ' — click to scroll normally';
    document.body.appendChild(tag);
  }

  function measure() {
    W = window.innerWidth; H = hero.querySelector('.hero__stage').clientHeight;
    var r = slot.getBoundingClientRect(), stage = hero.querySelector('.hero__stage').getBoundingClientRect();
    var s0 = r.height / MH;
    start = { s: s0, ax: r.left - stage.left + BX * s0, ay: r.top - stage.top + BY * s0 };
    var s1 = Math.max(W / BW, H / BH) * 1.06;
    end = { s: s1, ax: W / 2, ay: H / 2 };
    measureLift();
  }

  /* When the links arrive, the headline block lifts so its buttons end a set gap above the links
     (about a tenth of the screen height, 56–110px). Measured from layout, so it holds at any size. */
  var heroContent = $('#hero-content');
  function measureLift() {
    if (!foot || !heroContent || !foot.children.length) return;
    var top = Infinity;
    Array.prototype.forEach.call(foot.children, function (c) { top = Math.min(top, c.offsetTop); });
    var footTop = foot.offsetTop + top;
    var contentBottom = heroContent.offsetTop + heroContent.offsetHeight;
    var gap = Math.min(110, Math.max(56, H * 0.1));
    heroContent.style.setProperty('--lift', Math.max(0, Math.round(contentBottom + gap - footTop)) + 'px');
  }

  function progress() {
    if (forced) return Math.min(1, Math.max(0, parseFloat(forced[1])));
    if (calm) return 0;
    var dist = hero.offsetHeight - H;
    return dist > 0 ? Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / dist)) : 0;
  }

  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }; /* easeInOutCubic */
  var clamp01 = function (t) { return Math.min(1, Math.max(0, t)); };

  function render(p) {
    /* zoom across the first 72% of the scroll, then hold the full video with the metrics up */
    var z = clamp01(p / 0.72); /* linear here: the log-scale zoom already feels even, and the scroll lerp softens both ends */
    var s = Math.exp(Math.log(start.s) + (Math.log(end.s) - Math.log(start.s)) * z); /* even-feeling zoom */
    var m = clamp01(z * 1.15);
    var ax = start.ax + (end.ax - start.ax) * m;
    var ay = start.ay + (end.ay - start.ay) * m;
    var st = media.style;
    st.setProperty('--mw', (MW * s).toFixed(2) + 'px');
    st.setProperty('--mh', (MH * s).toFixed(2) + 'px');
    st.setProperty('--mx', (ax - BX * s).toFixed(2) + 'px');
    st.setProperty('--my', (ay - BY * s).toFixed(2) + 'px');
    media.classList.toggle('is-full', z >= 0.999);

    /* Frame the whole video scene inside the visible part of the mark: cover-fit the video to the
       mark's box (clipped to the screen). Once the mark outgrows the screen this settles at full size. */
    var bx0 = Math.max(0, ax - BX * s), by0 = Math.max(0, ay - BY * s);
    var bx1 = Math.min(W, ax - BX * s + MW * s), by1 = Math.min(H, ay - BY * s + MH * s);
    var bw = Math.max(1, bx1 - bx0), bh = Math.max(1, by1 - by0);
    var k = Math.min(1, Math.max(bw / W, bh / H));
    var tx = (bx0 + bw / 2) - W / 2, ty = (by0 + bh / 2) - H / 2;
    video.style.transform = (k >= 1 && Math.abs(tx) < .5 && Math.abs(ty) < .5) ? 'none' : 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + k.toFixed(4) + ')';

    /* The copy stays put the whole way and ends up on the video. A soft shade grows in behind it
       only as the video spreads under the text, so the rest of the frame stays clear. */
    scrim.style.opacity = ease(clamp01((z - 0.45) / 0.5)).toFixed(3);

    /* Metrics and quick links arrive once the video has filled the screen. */
    var full = z >= 0.98;
    foot.classList.toggle('is-in', full);
    vctl.classList.toggle('is-on', full);
  }

  function tick() {
    cur += (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.0004) cur = target;
    render(cur);
    raf = cur !== target ? requestAnimationFrame(tick) : 0;
  }
  function onScroll() {
    target = progress();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function init() {
    measure();
    target = cur = progress();
    render(cur);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); render(cur); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  init();

  /* =====================================================================
     SECTIONS BELOW THE HERO
     ===================================================================== */

  /* ---------- 3) tile map ---------- */
  var GRID = { ME:[10,0], VT:[9,1], NH:[10,1],
    WA:[0,2], ID:[1,2], MT:[2,2], ND:[3,2], MN:[4,2], IL:[5,2], WI:[6,2], MI:[7,2], NY:[8,2], RI:[9,2], MA:[10,2],
    OR:[0,3], NV:[1,3], WY:[2,3], SD:[3,3], IA:[4,3], IN:[5,3], OH:[6,3], PA:[7,3], NJ:[8,3], CT:[9,3],
    CA:[0,4], UT:[1,4], CO:[2,4], NE:[3,4], MO:[4,4], KY:[5,4], WV:[6,4], VA:[7,4], MD:[8,4], DE:[9,4],
    AZ:[1,5], NM:[2,5], KS:[3,5], AR:[4,5], TN:[5,5], NC:[6,5], SC:[7,5],
    OK:[3,6], LA:[4,6], MS:[5,6], AL:[6,6], GA:[7,6],
    TX:[3,7], FL:[8,7] };
  /* counts and cities from hillpointe.com (they include under management, under construction and pipeline) */
  var STATES = {
    FL: { n:'Florida', c:33, s:'live', cities:'Daytona Beach · Ocala · Palm Coast · Jacksonville · Davenport · Spring Hill · Tampa · Sarasota', img:'media/c/davenport.jpg', alt:'Pointe Grand Davenport on the water', tag:'288 homes<span class=\"state__at\"> · Davenport</span>', q:'Florida' },
    GA: { n:'Georgia', c:24, s:'live', cities:'Augusta · Brunswick · Macon · Warner Robins · Savannah · Athens · Covington · Dawsonville', img:'media/c/pendergrass.jpg', alt:'Pointe Grand Pendergrass', tag:'340 homes<span class=\"state__at\"> · Pendergrass</span>', q:'Georgia' },
    SC: { n:'South Carolina', c:6, s:'live', cities:'Spartanburg · Columbia · Beaufort · Hardeeville · Okatie', img:'media/c/columbia.jpg', alt:'Outdoor kitchen at Pointe Grand Columbia', tag:'258 homes<span class=\"state__at\"> · Columbia</span>', q:'South Carolina' },
    NC: { n:'North Carolina', c:6, s:'build', cities:'Durham · Greenville · Raleigh · Southport · Kernersville', q:'North Carolina' },
    TN: { n:'Tennessee', c:5, s:'build', cities:'Nashville · Cleveland · Oak Ridge · Murfreesboro · Maryville', tag:'300 homes<span class=\"state__at\"> · Maryville</span>', q:'Tennessee' },
    KY: { n:'Kentucky', c:3, s:'build', cities:'Lexington · Nicholasville', q:'Kentucky' },
    CO: { n:'Colorado', c:11, s:'build', cities:'Gypsum · Longmont · Aurora · Thornton · Monument · Loveland · Colorado Springs', q:'Colorado' },
    AZ: { n:'Arizona', c:7, s:'build', cities:'Mesa · Tolleson · Queen Creek · Goodyear · Flagstaff · Laveen', q:'Arizona' },
    NV: { n:'Nevada', c:3, s:'new', cities:'Reno · Carson City', tag:'358 homes<span class=\"state__at\"> · South Reno</span>', q:'Nevada' }
  };
  var STATUS = { live:'Now leasing', build:'Under construction', 'new':'First site acquired' };
  var tilesEl = $('#tiles'), stateEl = $('#state');
  if (tilesEl) {
    var cells = [];
    Object.keys(GRID).forEach(function (k) {
      var p = GRID[k], d = STATES[k];
      var t = document.createElement(d ? 'button' : 'span');
      t.className = 'tile-s' + (d ? ' is-hp is-' + d.s : '');
      t.textContent = k;
      t.style.gridColumn = (p[0] + 1); t.style.gridRow = (p[1] + 1);
      if (d) {
        t.type = 'button'; t.dataset.k = k;
        t.setAttribute('aria-label', d.n + ', ' + d.c + ' communities, ' + STATUS[d.s]);
        t.addEventListener('click', function () { pick(k, true); });
        t.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) pick(k); });
        cells.push(t);
      } else t.setAttribute('aria-hidden', 'true');
      tilesEl.appendChild(t);
    });
    var curState = null;
    var pick = function (k, focus) {
      if (k === curState) return;
      curState = k;
      var d = STATES[k];
      cells.forEach(function (c) { var on = c.dataset.k === k; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var img = d.img
        ? '<div class="state__img"><img src="' + d.img + '" alt="' + d.alt + '"></div>'
        : '<div class="state__img state__img--none"><span class="state__abbr" aria-hidden="true">' + k + '</span></div>';
      stateEl.innerHTML = img +
        '<div class="state__body">' +
          '<div class="state__top"><h3 class="state__n">' + d.n + '</h3><p class="state__count"><b>' + d.c + '</b>communities</p></div>' +
          '<div class="state__tags"><p class="state__status is-' + d.s + '"><i></i>' + STATUS[d.s] + '</p>' +
            (d.tag ? '<p class="state__tag">' + d.tag + '</p>' : '') + '</div>' +
          '<p class="state__cities">' + d.cities + '</p>' +
          '<a class="link" href="https://hillpointe.com/communities?state=' + encodeURIComponent(d.q) + '">' + d.n + ' communities</a>' +
        '</div>';
    };
    pick('FL');
    /* arrow keys move between the nine states */
    tilesEl.addEventListener('keydown', function (e) {
      if (!/Arrow/.test(e.key)) return;
      var keys = cells.map(function (c) { return c.dataset.k; });
      var i = keys.indexOf(curState) + (/Right|Down/.test(e.key) ? 1 : -1);
      i = (i + keys.length) % keys.length;
      pick(keys[i]); cells[i].focus(); e.preventDefault();
    });
  }

  /* ---------- 4) approach: pinned and stepped; the counter rolls in detents ---------- */
  var flow = $('#approach');
  if (flow) {
    var fTexts = $$('.flow__t', flow), fImgs = $$('#flow-imgs img'), fRail = $$('#rail li'), fDigit = $('#flow-digit');
    var fStep = -1;
    var setStep = function (i) {
      if (i === fStep) return;
      fImgs.forEach(function (im, j) { im.classList.toggle('was-on', j < i); im.classList.toggle('is-on', j === i); });
      fTexts.forEach(function (t, j) { t.classList.toggle('is-on', j === i); });
      fRail.forEach(function (r, j) { r.classList.toggle('is-on', j === i); });
      $$('span', fDigit).forEach(function (s) { s.style.setProperty('--i', i); });
      fStep = i;
    };
    var flowTick = function () {
      var r = flow.getBoundingClientRect(), dist = flow.offsetHeight - window.innerHeight;
      var p = calm ? 0 : Math.min(1, Math.max(0, -r.top / dist));
      var x = p * 5;
      setStep(Math.min(4, Math.floor(x)));
      fRail.forEach(function (li, j) { $('i', li).style.setProperty('--f', Math.min(1, Math.max(0, x - j)).toFixed(3)); });
    };
    window.addEventListener('scroll', flowTick, { passive: true });
    window.addEventListener('resize', flowTick);
    flowTick();
    /* rail labels jump to their stage */
    fRail.forEach(function (li, j) {
      li.style.cursor = 'pointer';
      li.addEventListener('click', function () {
        var dist = flow.offsetHeight - window.innerHeight;
        window.scrollTo({ top: flow.offsetTop + dist * (j + 0.5) / 5, behavior: 'smooth' });
      });
    });
  }

  /* ---------- 2) stair bars fill in sequence with scroll ---------- */
  var stairs = $('#stairs');
  if (stairs) {
    /* the bars now grow by CSS, once each card has wiped in (see .stair in styles.css) */
  }

  /* ---------- heading lines rise from a mask (Castle) ---------- */
  var splitEls = calm ? [] : $$('.h2, .card__t, .tile__t');
  function splitLines(el) {
    if (el._orig == null) el._orig = el.innerHTML; else el.innerHTML = el._orig;
    var words = [], frag = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.textContent = t; frag.appendChild(w); words.push(w);
        });
      } else { var w2 = document.createElement('span'); w2.appendChild(n); frag.appendChild(w2); words.push(w2); }
    });
    el.innerHTML = ''; el.appendChild(frag);
    var lines = [], cur = null, top = null;
    words.forEach(function (w) { var t = w.offsetTop; if (!cur || Math.abs(t - top) > 4) { cur = []; lines.push(cur); top = t; } cur.push(w); });
    el.innerHTML = '';
    lines.forEach(function (ws, i) {
      var ln = document.createElement('span'); ln.className = 'ln';
      var inner = document.createElement('span'); inner.className = 'ln__i';
      inner.style.transitionDelay = 'calc(var(--d, 0s) + ' + (i * 0.09).toFixed(2) + 's)';
      ws.forEach(function (w, j) { if (j) inner.appendChild(document.createTextNode(' ')); while (w.firstChild) inner.appendChild(w.firstChild); });
      ln.appendChild(inner); el.appendChild(ln);
      if (i < lines.length - 1) el.appendChild(document.createTextNode(' ')); /* keeps the words apart for screen readers */
    });
    el._lines = lines.length;
    el.classList.add('split', 'rv');
  }
  function unsplit(el) {
    if (el._done) return; el._done = true;
    setTimeout(function () { el.innerHTML = el._orig; el.classList.remove('split'); }, (el._lines * 0.09 + 1.4) * 1000);
  }
  function doSplit() { splitEls.forEach(function (el) { if (!el._done && !el.classList.contains('in')) splitLines(el); }); }
  if (splitEls.length) {
    doSplit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(doSplit);
    var lastW = window.innerWidth, rsT;
    window.addEventListener('resize', function () { if (window.innerWidth === lastW) return; lastW = window.innerWidth; clearTimeout(rsT); rsT = setTimeout(doSplit, 150); });
  }

  /* ---------- reveals ---------- */
  var watch = $$('.rv, .shape, .stairs, .award');
  function show(el) {
    if (el.classList.contains('in')) return;
    el.classList.add('in');
    if (el.classList.contains('split')) unsplit(el);
  }
  if (calm || !('IntersectionObserver' in window)) watch.forEach(show);
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    watch.forEach(function (el) { io.observe(el); });
    /* fast flicks can skip the observer; sweep anything already above the fold line */
    var sweep = function () { var lim = window.innerHeight * 0.92; watch.forEach(function (el) { if (!el.classList.contains('in') && el.getBoundingClientRect().top < lim) show(el); }); };
    window.addEventListener('scroll', function () { clearTimeout(sweep._t); sweep._t = setTimeout(sweep, 120); }, { passive: true });
  }

  /* ---------- careers tile video: plays only while on screen ---------- */
  var tv = $('.tile__vid');
  if (tv) tv.addEventListener('loadedmetadata', function () { tv.currentTime = 7; }, { once: true }); /* skip the building exterior: start on the people */
  if (tv && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !calm) { tv.preload = 'auto'; var pr = tv.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else tv.pause();
      });
    }, { threshold: 0.15 }).observe(tv);
  }

  /* ---------- leaders: on touch screens the portrait nearest the middle turns to colour ---------- */
  var people = $$('.person');
  if (people.length && !window.matchMedia('(hover:hover)').matches) {
    var pTick = function () {
      var mid = window.innerHeight / 2, best = null, bd = 1e9;
      people.forEach(function (p) { var r = p.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid); if (d < bd) { bd = d; best = p; } });
      people.forEach(function (p) { p.classList.toggle('is-c', p === best && bd < window.innerHeight * 0.4); });
    };
    window.addEventListener('scroll', pTick, { passive: true });
    pTick();
  }

  /* =====================================================================
     DEPTH LAYER (round 3)
     ===================================================================== */
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var outCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
  var finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- 1) blueprint spotlight: follows the pointer with a smooth glide ---------- */
  var bps = $$('.bp').map(function (el) { return { el: el, x: 0.7, y: 0.4, tx: 0.7, ty: 0.4 }; });
  if (bps.length && !calm) {
    var bpRaf = 0;
    var bpTick = function () {
      var moving = false;
      bps.forEach(function (b) {
        b.x += (b.tx - b.x) * 0.12; b.y += (b.ty - b.y) * 0.12;
        if (Math.abs(b.tx - b.x) > 0.0005 || Math.abs(b.ty - b.y) > 0.0005) moving = true;
        b.el.style.setProperty('--x', (b.x * 100).toFixed(2) + '%');
        b.el.style.setProperty('--y', (b.y * 100).toFixed(2) + '%');
      });
      bpRaf = moving ? requestAnimationFrame(bpTick) : 0;
    };
    var aim = function (cx, cy) {
      bps.forEach(function (b) {
        var r = b.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        b.tx = (cx - r.left) / r.width; b.ty = (cy - r.top) / r.height;
      });
      if (!bpRaf) bpRaf = requestAnimationFrame(bpTick);
    };
    window.addEventListener('pointermove', function (e) { aim(e.clientX, e.clientY); }, { passive: true });
    window.addEventListener('touchmove', function (e) { var t = e.touches[0]; if (t) aim(t.clientX, t.clientY); }, { passive: true });
    window.addEventListener('touchstart', function (e) { var t = e.touches[0]; if (t) aim(t.clientX, t.clientY); }, { passive: true });
    /* no cursor (touch screens): the light drifts slowly across the drawing as the page scrolls */
    if (!finePointer) {
      window.addEventListener('scroll', function () {
        var s = window.scrollY / window.innerHeight;
        bps.forEach(function (b) { b.tx = 0.5 + 0.32 * Math.sin(s * 1.7); b.ty = 0.42 + 0.22 * Math.cos(s * 1.3); });
        if (!bpRaf) bpRaf = requestAnimationFrame(bpTick);
      }, { passive: true });
    }
  }

  /* ---------- 3a) mission statement: words darken as you read down ---------- */
  var scrubEl = $('.intro__statement');
  if (scrubEl) {
    var txt = scrubEl.textContent.trim();
    scrubEl.setAttribute('aria-label', txt);
    scrubEl.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="wd" aria-hidden="true">' + w + '</span>'; }).join(' ');
    scrubEl.classList.add('scrub');
    var words = $$('.wd', scrubEl);
    var scrubTick = function () {
      if (calm) return;
      var r = scrubEl.getBoundingClientRect(), vh = window.innerHeight;
      var p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.32));
      var n = words.length;
      words.forEach(function (w, i) { w.style.setProperty('--o', (0.16 + 0.84 * clamp(p * (n + 3) - i)).toFixed(3)); });
    };
    window.addEventListener('scroll', scrubTick, { passive: true });
    scrubTick();
  }

  /* ---------- 3b) floors: every photo opens in seven bands, bottom band first, with scroll ----------
     Applies to all photos below the hero. The bands take the colour behind the photo, so the photo
     looks like it is being built up floor by floor out of the page. */
  var FLOOR_TARGETS = '.intro__img-a, .intro__img-b .frame, .intro__wide .frame, #flow-imgs, .card__img, .person__img, .tile';
  var bgBehind = function (el) {
    for (var n = el.parentElement; n; n = n.parentElement) {
      var c = getComputedStyle(n).backgroundColor;
      if (c && c !== 'transparent' && !/rgba\(\d+,\s*\d+,\s*\d+,\s*0\)/.test(c)) return c;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  var hosts = $$(FLOOR_TARGETS).map(function (el) {
    el.classList.remove('shape'); /* the bands replace the old open-from-the-bottom reveal */
    el.classList.add('fl-host');
    var col = bgBehind(el), bands = [];
    for (var k = 0; k < 7; k++) {
      var b = document.createElement('i'); b.className = 'fl'; b.setAttribute('aria-hidden', 'true');
      b.style.top = (k * 100 / 7) + '%'; b.style.background = col;
      el.appendChild(b); bands.push(b);
    }
    return { el: el, bands: bands.reverse() }; /* bottom band first */
  });
  var floorTick = function () {
    if (calm) return;
    var vh = window.innerHeight;
    hosts.forEach(function (h) {
      var r = h.el.getBoundingClientRect();
      if (r.top > vh * 1.1 || r.bottom < -vh * 0.5) return;
      var p = clamp((vh - r.top) / (vh * 0.75));
      h.bands.forEach(function (b, i) { b.style.setProperty('--s', (1 - outCubic(clamp(p * 1.9 - i * 0.13))).toFixed(4)); });
    });
  };
  window.addEventListener('scroll', floorTick, { passive: true });
  window.addEventListener('resize', floorTick);
  floorTick();

  /* ---------- 3c) odometer: each digit rolls to its value ---------- */
  var odoEls = $$('.stair__num');
  odoEls.forEach(function (el) {
    var t = el.textContent.trim(), di = 0;
    el.setAttribute('aria-label', t);
    el.innerHTML = t.split('').map(function (c) {
      if (/\d/.test(c)) {
        var strip = ''; for (var d = 0; d <= 9; d++) strip += '<b>' + d + '</b>';
        return '<span class="odo" aria-hidden="true" data-d="' + c + '"><span style="--od:' + (di++ * 0.09).toFixed(2) + 's">' + strip + '</span><i class="odo__w">' + c + '</i></span>';
      }
      return '<span class="sym" aria-hidden="true">' + c + '</span>';
    }).join('');
  });
  /* digits roll by CSS when the cards arrive: each strip moves to its own value */
  $$('.odo').forEach(function (o) { $('span', o).style.setProperty('--to', (-o.dataset.d * 10) + '%'); });
  if (calm) $$('.odo > span').forEach(function (s) { s.style.transition = 'none'; });

})();
