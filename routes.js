/* Hero links, five options. Renders the chosen option into the hero foot before app.js runs.
   ?v=1..5 picks the option. The links appear once the video has filled the screen, as on the homepage. */
(function () {
  'use strict';
  var m = /[?&]v=([1-5])/.exec(location.search);
  var v = m ? m[1] : '1';
  document.documentElement.setAttribute('data-rt', v);
  if (/[?&]still/.test(location.search)) document.documentElement.classList.add('still'); /* capture aid: no transitions */

  var R = [
    { k: 'home', n: '01', t: 'Find a home', d: 'Pointe Grand communities, now leasing in Florida, Georgia and South Carolina.', cta: 'Browse communities', href: 'https://hillpointe.com/communities', img: 'media/c/deland.jpg' },
    { k: 'land', n: '02', t: 'Sell us land', d: 'We are acquiring sites from the Southeast to the Mountain West. Tell us about yours.', cta: 'Submit a site', href: 'https://hillpointe.com/sell-land', img: 'media/news/foothills-groundbreaking.jpg' },
    { k: 'invest', n: '03', t: 'Invest with us', d: 'Partner with the No. 5 multifamily developer in America, or log in to the investor portal.', cta: 'Investor login', href: 'https://app.junipersquare.com/i/hillpointe', ext: true, img: 'media/office.jpg' }
  ];
  var ext = function (r) { return r.ext ? ' target="_blank" rel="noopener"' : ''; };
  var foot = document.getElementById('hero-foot');
  var html = '';

  if (v === '1') { /* 1. Index tabs: three full-width panels with number, title, line and arrow */
    html = '<nav class="rt1" aria-label="Start here">' + R.map(function (r) {
      return '<a class="rt1__i" href="' + r.href + '"' + ext(r) + '><span class="rt1__n">' + r.n + '</span>' +
        '<span class="rt1__b"><span class="rt1__t">' + r.t + '</span><span class="rt1__d">' + r.d + '</span></span>' +
        '<span class="rt1__a" aria-hidden="true">→</span></a>';
    }).join('') + '</nav>';
  }

  if (v === '2') { /* 2. "I'm here to…": pick who you are, one clear button follows */
    html = '<div class="rt2" role="group" aria-label="Start here">' +
      '<p class="rt2__l">I\'m here to</p>' +
      '<div class="rt2__opts" role="tablist">' + R.map(function (r, i) {
        return '<button type="button" role="tab" class="rt2__o' + (i ? '' : ' is-on') + '" aria-selected="' + (i ? 'false' : 'true') + '" data-i="' + i + '">' + r.t + '</button>';
      }).join('') + '</div>' +
      '<div class="rt2__panes">' + R.map(function (r, i) {
        return '<div class="rt2__p' + (i ? '' : ' is-on') + '" role="tabpanel"><p>' + r.d + '</p><a class="btn btn--gold" href="' + r.href + '"' + ext(r) + '>' + r.cta + '</a></div>';
      }).join('') + '</div></div>';
  }

  if (v === '3') { /* 3. Editorial index: a large numbered list on the right, like a contents page */
    html = '<nav class="rt3" aria-label="Start here"><p class="rt3__l">Start here</p>' + R.map(function (r) {
      return '<a class="rt3__i" href="' + r.href + '"' + ext(r) + '><span class="rt3__n">' + r.n + '</span><span class="rt3__t">' + r.t + '</span><span class="rt3__a" aria-hidden="true">→</span></a>';
    }).join('') + '</nav>';
  }

  if (v === '4') { /* 4. Picture cards: a photo for each audience */
    html = '<nav class="rt4" aria-label="Start here">' + R.map(function (r) {
      return '<a class="rt4__i" href="' + r.href + '"' + ext(r) + '><span class="rt4__img"><img src="' + r.img + '" alt="" loading="lazy"></span>' +
        '<span class="rt4__row"><span class="rt4__t">' + r.t + '</span><span class="rt4__a" aria-hidden="true">→</span></span></a>';
    }).join('') + '</nav>';
  }

  if (v === '5') { /* 5. Expanding bar: hover opens a segment and reveals its line, in one smooth step */
    html = '<nav class="rt5" aria-label="Start here">' + R.map(function (r, i) {
      return '<a class="rt5__i' + (i ? '' : ' is-open') + '" href="' + r.href + '"' + ext(r) + '><span class="rt5__n">' + r.n + '</span><span class="rt5__t">' + r.t + '</span>' +
        '<span class="rt5__d">' + r.d + '</span><span class="rt5__a" aria-hidden="true">→</span></a>';
    }).join('') + '</nav>';
  }

  foot.innerHTML = html;
  foot.classList.add('rt');

  /* option 2: switching who you are */
  if (v === '2') {
    var opts = foot.querySelectorAll('.rt2__o'), panes = foot.querySelectorAll('.rt2__p');
    Array.prototype.forEach.call(opts, function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.i;
        Array.prototype.forEach.call(opts, function (o, j) { o.classList.toggle('is-on', j === i); o.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
        Array.prototype.forEach.call(panes, function (p, j) { p.classList.toggle('is-on', j === i); });
      });
    });
  }

  /* option 5: the hovered (or focused) segment opens; the first stays open otherwise */
  if (v === '5') {
    var items = foot.querySelectorAll('.rt5__i');
    var open = function (el) { Array.prototype.forEach.call(items, function (a) { a.classList.toggle('is-open', a === el); }); };
    Array.prototype.forEach.call(items, function (a) {
      a.addEventListener('mouseenter', function () { open(a); });
      a.addEventListener('focus', function () { open(a); });
    });
  }

  /* picker */
  document.addEventListener('DOMContentLoaded', function () {
    var on = document.querySelector('.picker a[data-v="' + v + '"]');
    if (on) on.classList.add('is-on');
    var jump = document.getElementById('picker-jump');
    if (jump) jump.addEventListener('click', function () {
      var hero = document.getElementById('hero');
      window.scrollTo({ top: hero.offsetTop + hero.offsetHeight - window.innerHeight, behavior: 'smooth' });
    });
  });
})();
