/* "Who we are": six options. ?v=1..6 picks one. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var m = /[?&]v=([1-6])/.exec(location.search);
  var v = m ? m[1] : '1';
  root.setAttribute('data-v', v);
  var calm = root.classList.contains('calm');
  var on = $('.picker a[data-v="' + v + '"]'); if (on) on.classList.add('is-on');

  /* mobile menu: same as the homepage */
  var mm = $('#mm'), body = $('#mm-body');
  if (mm && body) {
    $$('.nav__list > li').forEach(function (li) {
      var a = $(':scope > a', li), g = document.createElement('div');
      g.className = 'mm__group'; g.appendChild(a.cloneNode(true)); body.appendChild(g);
    });
    $('#burger').addEventListener('click', function () { mm.showModal(); });
    $('#mm-close').addEventListener('click', function () { mm.close(); });
  }

  /* reveals: rise, and images open from the bottom */
  var watch = $$('.iv[data-n="' + v + '"] .rv, .iv[data-n="' + v + '"] .shape');
  if (calm || !('IntersectionObserver' in window)) watch.forEach(function (el) { el.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    watch.forEach(function (el) { io.observe(el); });
  }

  /* 4 · the row you point at (or the one in the middle of the screen) lights up; the photo follows */
  if (v === '4') {
    var rows = $$('.iv4__i'), imgs = $$('.iv4__ph img'), cur = 0;
    var set = function (i) {
      if (i === cur) return; cur = i;
      rows.forEach(function (r, j) { r.classList.toggle('is-on', j === i); });
      imgs.forEach(function (im, j) { im.classList.toggle('is-on', j === i); });
    };
    rows.forEach(function (r, i) { r.addEventListener('mouseenter', function () { set(i); }); });
    if (!window.matchMedia('(hover:hover)').matches) {
      window.addEventListener('scroll', function () {
        var mid = window.innerHeight * 0.55, best = 0, bd = 1e9;
        rows.forEach(function (r, i) { var b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - mid); if (d < bd) { bd = d; best = i; } });
        set(best);
      }, { passive: true });
    }
  }

  /* 5 · the held photo changes with the passage in view */
  if (v === '5') {
    var blocks = $$('.iv5__b'), pics = $$('.iv5__ph img'), caps = $$('.iv5__cap span'), c5 = 0;
    var tick = function () {
      var mid = window.innerHeight * 0.5, best = 0, bd = 1e9;
      blocks.forEach(function (b, i) { var r = b.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid); if (d < bd) { bd = d; best = i; } });
      if (best === c5) return; c5 = best;
      pics.forEach(function (p, j) { p.classList.toggle('is-on', j === best); });
      caps.forEach(function (p, j) { p.classList.toggle('is-on', j === best); });
    };
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }
})();
