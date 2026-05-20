/* ============================================================
   INK & EQUITY LLP — Core Site JavaScript
   Vanilla, lightweight, GPU-friendly, accessible
   ============================================================ */

(function () {
  'use strict';

  // ------------- HELPERS -------------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  // ------------- LOADER -------------
  function initLoader() {
    const loader = $('.loader');
    if (!loader) return;
    const done = () => {
      loader.classList.add('is-hidden');
      setTimeout(() => loader.remove(), 1000);
    };
    if (document.readyState === 'complete') {
      setTimeout(done, 1500);
    } else {
      window.addEventListener('load', () => setTimeout(done, 1200));
    }
  }

  // ------------- SCROLL PROGRESS -------------
  function initScrollProgress() {
    const bar = $('.scroll-progress');
    if (!bar) return;
    let ticking = false;
    function update() {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      bar.style.width = pct + '%';
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  // ------------- NAVBAR (scroll state) -------------
  function initNavbar() {
    const nav = $('.nav');
    if (!nav) return;
    let lastY = 0;
    let ticking = false;
    function update() {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 40);
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  // ------------- MOBILE MENU -------------
  function initMobileMenu() {
    const toggle = $('.nav__toggle');
    const menu = $('.nav__mobile');
    if (!toggle || !menu) return;
    function close() {
      toggle.classList.remove('is-open');
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    function open() {
      toggle.classList.add('is-open');
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    toggle.addEventListener('click', () => {
      if (menu.classList.contains('is-open')) close(); else open();
    });
    $$('.nav__mobile-link', menu).forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
    });
  }

  // ------------- REVEAL ON SCROLL -------------
  function initReveal() {
    if (prefersReducedMotion) {
      $$('.reveal, .reveal-stagger, .reveal-line').forEach(el => el.classList.add('is-visible'));
      return;
    }
    if (!('IntersectionObserver' in window)) {
      $$('.reveal, .reveal-stagger, .reveal-line').forEach(el => el.classList.add('is-visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    $$('.reveal, .reveal-stagger, .reveal-line').forEach(el => obs.observe(el));
  }

  // ------------- ANIMATED COUNTERS -------------
  function initCounters() {
    const counters = $$('[data-counter]');
    if (!counters.length) return;
    if (prefersReducedMotion) {
      counters.forEach(c => { c.textContent = c.dataset.counter; });
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        obs.unobserve(el);
        const target = parseFloat(el.dataset.counter);
        const decimals = (el.dataset.counter.split('.')[1] || '').length;
        const duration = 1800;
        const start = performance.now();
        function step(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = target * eased;
          el.textContent = decimals ? val.toFixed(decimals) : Math.floor(val).toString();
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = decimals ? target.toFixed(decimals) : target.toString();
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => obs.observe(c));
  }

  // ------------- MARQUEE (duplicate content for seamless loop) -------------
  function initMarquee() {
    $$('.marquee__track').forEach(track => {
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.parentNode.appendChild(clone);
    });
  }

  // ------------- SEARCH OVERLAY -------------
  function initSearch() {
    const trigger = $('[data-search-open]');
    const overlay = $('.search-overlay');
    if (!trigger || !overlay) return;
    const input = $('.search-input', overlay);
    const close = $('.search-close', overlay);
    function open() {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      setTimeout(() => input && input.focus(), 100);
    }
    function shut() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    }
    trigger.addEventListener('click', open);
    close && close.addEventListener('click', shut);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) shut();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) shut();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        overlay.classList.contains('is-open') ? shut() : open();
      }
    });
  }

  // ------------- BACK TO TOP -------------
  function initBackToTop() {
    const btn = $('.back-to-top');
    if (!btn) return;
    let ticking = false;
    function update() {
      btn.classList.toggle('is-visible', window.scrollY > 600);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // ------------- DISCLAIMER MODAL (one-time per session) -------------
  function initDisclaimer() {
    const modal = $('.disclaimer-modal');
    if (!modal) return;
    const accept = $('[data-disclaimer-accept]', modal);
    const decline = $('[data-disclaimer-decline]', modal);
    const KEY = 'ie_disclaimer_v1';
    const accepted = sessionStorage.getItem(KEY);
    if (!accepted) {
      setTimeout(() => modal.classList.add('is-open'), 600);
    }
    accept && accept.addEventListener('click', () => {
      sessionStorage.setItem(KEY, '1');
      modal.classList.remove('is-open');
    });
    decline && decline.addEventListener('click', () => {
      window.location.href = 'https://www.google.com';
    });
  }

  // ------------- NEWSLETTER (graceful no-op) -------------
  function initNewsletter() {
    $$('.footer__newsletter-form, [data-newsletter-form]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const btn = form.querySelector('button, .footer__newsletter-btn');
        if (input && input.value) {
          if (btn) btn.textContent = 'Subscribed ✓';
          input.value = '';
          setTimeout(() => { if (btn) btn.textContent = btn.dataset.label || 'Subscribe →'; }, 3000);
        }
      });
    });
  }

  // ------------- SMOOTH ANCHOR SCROLL -------------
  function initAnchorScroll() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // ------------- PARALLAX (hero orbs, lightweight) -------------
  function initParallax() {
    if (prefersReducedMotion || isTouch) return;
    const orbs = $$('[data-parallax]');
    if (!orbs.length) return;
    let mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    function loop() {
      tx += (mx - tx) * 0.04;
      ty += (my - ty) * 0.04;
      orbs.forEach(orb => {
        const depth = parseFloat(orb.dataset.parallax) || 20;
        orb.style.transform = `translate3d(${tx * depth}px, ${ty * depth}px, 0)`;
      });
      requestAnimationFrame(loop);
    }
    loop();
  }

  // ------------- CURRENT YEAR -------------
  function initYear() {
    $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  }

  // ------------- INIT ALL -------------
  function init() {
    initLoader();
    initScrollProgress();
    initNavbar();
    initMobileMenu();
    initReveal();
    initCounters();
    initMarquee();
    initSearch();
    initBackToTop();
    initDisclaimer();
    initNewsletter();
    initAnchorScroll();
    initParallax();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
