/* ============================================================
   ANDRADE PORTO ARQUITETURA — main.js
   ============================================================ */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var menuMobile = document.getElementById('menu-mobile');
  var toTop = document.getElementById('to-top');

  /* ---------- Header state ---------- */
  function onScrollHeader() {
    var scrolled = window.scrollY > 40;
    header.classList.toggle('header--top', !scrolled && !document.body.classList.contains('menu-open'));
    if (toTop) toTop.classList.toggle('is-visible', scrolled);
  }

  header.classList.add('header--top');
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menuMobile.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    onScrollHeader();
  }

  burger.addEventListener('click', function () {
    setMenu(!document.body.classList.contains('menu-open'));
  });

  Array.prototype.forEach.call(menuMobile.querySelectorAll('a'), function (link) {
    link.addEventListener('click', function (e) {
      if (link.getAttribute('href').indexOf('#') === 0) {
        e.preventDefault();
        var target = link.getAttribute('href');
        setMenu(false);
        setTimeout(function () {
          var el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
        }, 120);
      }
    });
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Gallery (projetos) ---------- */
  var gallery = document.getElementById('gallery');
  var track = document.getElementById('gallery-track');
  var bar = document.getElementById('gal-bar');
  var count = document.getElementById('gal-count');
  var prevBtn = document.getElementById('gal-prev');
  var nextBtn = document.getElementById('gal-next');

  if (gallery && track) {
    var slides = Array.prototype.slice.call(track.children);

    /* Crop-mark corners on each slide frame (invisible on load, revealed later) */
    var CORNERS = ['tl', 'tr', 'bl', 'br'];
    slides.forEach(function (slide) {
      var frame = slide.querySelector('.slide__frame');
      if (!frame) return;
      CORNERS.forEach(function (pos) {
        var c = document.createElement('span');
        c.className = 'folio__corner folio__corner--' + pos;
        frame.appendChild(c);
      });
    });

    /* Map vertical wheel over the gallery to horizontal scroll (desktop) */
    gallery.addEventListener('wheel', function (e) {
      var max = gallery.scrollWidth - gallery.clientWidth;
      if (max <= 0) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var before = gallery.scrollLeft;
      gallery.scrollLeft += e.deltaY;
      if (gallery.scrollLeft !== before) e.preventDefault();
    }, { passive: false });

    /* Fallback reveal: mark slides that are horizontally in view */
    function revealInView() {
      var box = gallery.getBoundingClientRect();
      slides.forEach(function (s) {
        if (s.classList.contains('is-in')) return;
        var r = s.getBoundingClientRect();
        if (r.left < box.right && r.right > box.left) s.classList.add('is-in');
      });
    }

    function step() {
      if (!slides.length) return 1;
      var slideW = slides[0].offsetWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return slideW + gap;
    }

    function padLeft() {
      return parseFloat(getComputedStyle(gallery).paddingLeft) || 0;
    }

    function indexOf() {
      var idx = Math.round((gallery.scrollLeft + padLeft()) / step());
      return Math.max(0, Math.min(slides.length - 1, idx));
    }

    function update() {
      var max = gallery.scrollWidth - gallery.clientWidth;
      var p = max > 0 ? gallery.scrollLeft / max : 0;
      if (bar) bar.style.width = (p * 100) + '%';
      var i = indexOf();
      if (count) count.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b> / ' + String(slides.length).padStart(2, '0');
      if (prevBtn) prevBtn.disabled = gallery.scrollLeft <= 4;
      if (nextBtn) nextBtn.disabled = gallery.scrollLeft >= max - 4;
    }

    function goTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      slides[i].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(indexOf() - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(indexOf() + 1); });

    gallery.addEventListener('scroll', function () {
      window.requestAnimationFrame(function () { update(); revealInView(); });
    }, { passive: true });
    window.addEventListener('resize', function () { update(); });
    window.addEventListener('load', function () { update(); revealInView(); });
    update();
    revealInView();
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
