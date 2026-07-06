/**
 * GreenNet Energy Ltd — Pitch Prototype
 * script.js — Interactions & Progressive Enhancement
 */

(function () {
  'use strict';

  /* ─── UTILITIES ────────────────────────────────────────────── */
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


  /* ─── 1. FOOTER YEAR ────────────────────────────────────────── */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ─── 2. STICKY NAVIGATION ──────────────────────────────────── */
  const nav = document.getElementById('nav');

  function updateNav() {
    if (!nav) return;
    const scrolled = window.scrollY > 48;
    nav.classList.toggle('nav--solid',       scrolled);
    nav.classList.toggle('nav--transparent', !scrolled);
  }

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });


  /* ─── 3. MOBILE MENU ────────────────────────────────────────── */
  const menuToggle  = document.getElementById('menu-toggle');
  const menuClose   = document.getElementById('menu-close');
  const mobileMenu  = document.getElementById('mobile-menu');
  const menuOverlay = document.getElementById('menu-overlay');

  let lastFocusedElement = null;

  function openMenu() {
    if (!mobileMenu) return;
    lastFocusedElement = document.activeElement;
    mobileMenu.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    menuToggle.setAttribute('aria-expanded', 'true');
    // Focus first focusable element in panel
    const firstFocusable = mobileMenu.querySelector('a, button');
    if (firstFocusable) firstFocusable.focus();
    document.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', handleEsc);
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.setAttribute('hidden', '');
    document.body.style.overflow = '';
    menuToggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', trapFocus);
    document.removeEventListener('keydown', handleEsc);
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function handleEsc(e) {
    if (e.key === 'Escape') closeMenu();
  }

  function trapFocus(e) {
    if (e.key !== 'Tab' || !mobileMenu) return;
    const focusable = $$('a, button, [tabindex]:not([tabindex="-1"])', mobileMenu)
      .filter(el => !el.hasAttribute('disabled'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { last.focus(); e.preventDefault(); }
    } else {
      if (document.activeElement === last)  { first.focus(); e.preventDefault(); }
    }
  }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (menuClose)  menuClose.addEventListener('click',  closeMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

  // Close menu on any internal link click
  if (mobileMenu) {
    $$('.mobile-menu__link, .mobile-menu__cta .btn', mobileMenu).forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
        // Small delay to let the menu animate away before scrolling
        setTimeout(() => {}, 300);
      });
    });
  }


  /* ─── 4. SMOOTH SCROLL ──────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 0;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;

      if (prefersReducedMotion()) {
        window.scrollTo({ top });
      } else {
        window.scrollTo({ top, behavior: 'smooth' });
      }
      // Move focus to target for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });


  /* ─── 5. SCROLL REVEAL (IntersectionObserver) ───────────────── */
  function initScrollReveal() {
    if (prefersReducedMotion()) {
      // Immediately show all elements when motion is reduced
      $$('.reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    $$('.reveal').forEach(el => io.observe(el));
  }

  if ('IntersectionObserver' in window) {
    initScrollReveal();
  } else {
    // Fallback for old browsers
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }


  /* ─── 6. FAQ ACCORDION ──────────────────────────────────────── */
  function initFAQ() {
    const faqItems = $$('.faq__item');

    faqItems.forEach(item => {
      const btn    = item.querySelector('.faq__question');
      const answer = item.querySelector('.faq__answer');
      if (!btn || !answer) return;

      // Set up initial state — answer is hidden via HTML hidden attr
      btn.addEventListener('click', () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        // Optionally close others (one-open-at-a-time)
        faqItems.forEach(otherItem => {
          const otherBtn    = otherItem.querySelector('.faq__question');
          const otherAnswer = otherItem.querySelector('.faq__answer');
          if (otherBtn && otherBtn !== btn && otherBtn.getAttribute('aria-expanded') === 'true') {
            otherBtn.setAttribute('aria-expanded', 'false');
            otherAnswer.setAttribute('hidden', '');
          }
        });

        // Toggle current
        if (isExpanded) {
          btn.setAttribute('aria-expanded', 'false');
          closeAnswer(answer);
        } else {
          btn.setAttribute('aria-expanded', 'true');
          openAnswer(answer);
        }
      });
    });
  }

  function openAnswer(el) {
    el.removeAttribute('hidden');
    if (!prefersReducedMotion()) {
      el.style.maxHeight = '0';
      el.style.overflow  = 'hidden';
      el.style.transition = 'max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      // Trigger reflow then animate
      el.offsetHeight; // eslint-disable-line no-unused-expressions
      el.style.maxHeight = el.scrollHeight + 'px';
      el.addEventListener('transitionend', () => {
        el.style.maxHeight = '';
        el.style.overflow  = '';
        el.style.transition = '';
      }, { once: true });
    }
  }

  function closeAnswer(el) {
    if (!prefersReducedMotion()) {
      el.style.maxHeight  = el.scrollHeight + 'px';
      el.style.overflow   = 'hidden';
      el.style.transition = 'max-height 0.25s cubic-bezier(0.7, 0, 0.84, 0)';
      el.offsetHeight; // eslint-disable-line no-unused-expressions
      el.style.maxHeight = '0';
      el.addEventListener('transitionend', () => {
        el.setAttribute('hidden', '');
        el.style.maxHeight  = '';
        el.style.overflow   = '';
        el.style.transition = '';
      }, { once: true });
    } else {
      el.setAttribute('hidden', '');
    }
  }

  initFAQ();


  /* ─── 7. STICKY MOBILE CTA ──────────────────────────────────── */
  const stickyCta = document.getElementById('sticky-cta');

  function updateStickyCTA() {
    if (!stickyCta) return;
    // Show after scrolling past the hero section
    const hero = document.getElementById('home');
    const contact = document.getElementById('contact');
    if (!hero) return;

    const heroBottom   = hero.getBoundingClientRect().bottom;
    const contactTop   = contact ? contact.getBoundingClientRect().top : Infinity;
    const windowH      = window.innerHeight;
    const pastHero     = heroBottom < 0;
    const nearContact  = contactTop < windowH * 0.5;

    const visible = pastHero && !nearContact;
    stickyCta.classList.toggle('sticky-cta--visible', visible);

    if (visible) {
      stickyCta.removeAttribute('inert');
    } else {
      stickyCta.setAttribute('inert', '');
    }
  }

  window.addEventListener('scroll', updateStickyCTA, { passive: true });


  /* ─── 8. BUTTON ARROW MICRO-ANIMATION ───────────────────────── */
  // Handled purely via CSS (.btn--arrow:hover .btn__arrow-icon)
  // This JS block adds a subtle scale pulse on click as extra polish
  $$('.btn--arrow').forEach(btn => {
    btn.addEventListener('pointerdown', () => {
      if (prefersReducedMotion()) return;
      btn.style.transform = 'scale(0.96)';
    });
    btn.addEventListener('pointerup', () => {
      btn.style.transform = '';
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  });


  /* ─── 9. CARD HOVER ELEVATION (progressive) ─────────────────── */
  // CSS handles the main effect; this adds a subtle mouse-follow tilt
  // only on large screens where hover is reliable
  if (window.matchMedia('(hover: hover) and (min-width: 1024px)').matches && !prefersReducedMotion()) {
    $$('.services__card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const x      = ((e.clientX - rect.left) / rect.width  - 0.5) * 6;
        const y      = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
        card.style.transform = `translateY(-3px) rotateX(${-y}deg) rotateY(${x}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      });
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease';
      });
    });
  }


  /* ─── 10. NAV ACTIVE LINK HIGHLIGHTING ─────────────────────── */
  const sections = $$('section[id]');
  const navLinks = $$('.nav__link');

  function updateActiveLink() {
    let current = '';
    const scrollY = window.scrollY + (nav ? nav.offsetHeight : 0) + 40;

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('nav__link--active', href === current);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

})();
