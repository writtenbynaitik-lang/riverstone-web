/* ============================================================
   RIVERSTONE — interaction layer
   All motion uses the cubic-bezier(0.16, 1, 0.3, 1) signature
   defined in styles.css; this file only drives state.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. hero letter stagger ---------- */
  (function letters() {
    var el = document.querySelector('[data-letters]');
    if (!el) return;
    var text = el.textContent.trim();
    el.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement('span');
      s.textContent = text[i];
      s.style.animationDelay = (i * 0.05) + 's';   // 0.05s per letter
      el.appendChild(s);
    }
    requestAnimationFrame(function () {
      document.documentElement.classList.add('is-ready');
    });
  })();

  /* ---------- 2. scroll reveals ---------- */
  (function reveals() {
    var items = document.querySelectorAll('.rv');
    if (!items.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- 3. floating parallax on hero cards ---------- */
  var floats = [].slice.call(document.querySelectorAll('.float'));
  function parallax(y) {
    for (var i = 0; i < floats.length; i++) {
      var f = floats[i];
      var sp = parseFloat(f.getAttribute('data-speed')) || 0.05;
      var inner = f.firstElementChild;
      if (inner) inner.style.transform = 'translateY(' + (y * sp).toFixed(2) + 'px)';
    }
  }

  /* ---------- 4. header state + active link + back-to-top ---------- */
  var header = document.getElementById('header');
  var totop = document.getElementById('totop');
  var links = [].slice.call(document.querySelectorAll('.navpill a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle('is-stuck', y > 40);
    if (totop) totop.classList.toggle('show', y > window.innerHeight * 0.9);
    if (!reduced) parallax(y);

    // active nav link = last section whose top has passed a third of the viewport
    var active = -1, probe = y + window.innerHeight * 0.34;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].offsetTop <= probe) active = i;
    }
    for (var j = 0; j < links.length; j++) {
      links[j].classList.toggle('is-active', j === active);
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- 5. mobile menu ---------- */
  (function mobile() {
    var burger = document.getElementById('burger');
    var sheet = document.getElementById('mobilenav');
    if (!burger || !sheet) return;

    function setOpen(open) {
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) { var f = sheet.querySelector('a'); if (f) f.focus(); }
    }
    burger.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('nav-open'));
    });
    sheet.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        setOpen(false); burger.focus();
      }
    });
  })();

  /* ---------- 6. newsletter ----------
     Front-end only: there is no mailing-list backend wired up yet.
     Point POST_URL at a form endpoint (Formspree, Buttondown, Mailchimp,
     a serverless function…) to make this live. Until then it validates
     and confirms locally so the control is never a dead end. */
  var POST_URL = '';
  (function newsletter() {
    var form = document.getElementById('newsletter');
    var msg = document.getElementById('f-msg');
    if (!form || !msg) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var value = (input.value || '').trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

      if (!ok) {
        msg.textContent = 'Please enter a valid email address.';
        msg.setAttribute('data-state', 'err');
        input.focus();
        return;
      }
      msg.removeAttribute('data-state');

      if (!POST_URL) {
        msg.textContent = 'Thanks — we’ll be in touch.';
        form.reset();
        return;
      }
      msg.textContent = 'Signing you up…';
      fetch(POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: value })
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        msg.textContent = 'Thanks — we’ll be in touch.';
        form.reset();
      }).catch(function () {
        msg.textContent = 'Something went wrong. Please try again.';
        msg.setAttribute('data-state', 'err');
      });
    });
  })();

  /* ---------- 7. year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
