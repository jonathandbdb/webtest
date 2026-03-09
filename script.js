/* ═══════════════════════════════════════════════════════
   CONECTA — JavaScript (TechEdge template adapted)
   Sticky header, offcanvas, WOW, counters, scroll, GA4
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Sticky Header ───
  const header = document.getElementById('header-sticky');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('sticky', window.scrollY > 250);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── Mobile Offcanvas Menu ───
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileOverlay = document.getElementById('mobileOverlay');

  const openMenu = () => {
    if (mobileMenu) mobileMenu.classList.add('opened');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    if (mobileMenu) mobileMenu.classList.remove('opened');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (navToggle) navToggle.addEventListener('click', openMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

  // Cerrar menú al hacer click en un link
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ─── WOW.js Animations ───
  if (typeof WOW !== 'undefined') {
    new WOW({ offset: 100, mobile: true }).init();
  }

  // ─── Counter Animation ───
  const counters = document.querySelectorAll('.count');
  let countersAnimated = false;

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'), 10);
      if (isNaN(target)) return;
      const duration = 2000;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        counter.textContent = Math.floor(eased * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target;
        }
      };
      requestAnimationFrame(step);
    });
  };

  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          animateCounters();
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => counterObserver.observe(c));
  }

  // ─── Back to Top Button ───
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const progressPath = backToTop.querySelector('path');
    const pathLength = progressPath ? 307.919 : 0;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Mostrar/ocultar botón
      backToTop.classList.toggle('active', scrollTop > 300);

      // Actualizar progreso del círculo
      if (progressPath && docHeight > 0) {
        const progress = pathLength - (scrollTop * pathLength / docHeight);
        progressPath.style.strokeDashoffset = Math.max(0, progress);
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── Smooth scroll for anchor links ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ─── GA4 tracking helpers ───
  const track = (eventName, params = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  };

  // 1) Conversion: generate_lead (CTA Agendar)
  document.querySelectorAll('a[href="#contacto"]').forEach(link => {
    link.addEventListener('click', () => {
      const txt = (link.textContent || '').trim().toLowerCase();
      if (txt.includes('agendar') || txt.includes('consultoría') || txt.includes('consultoria')) {
        track('generate_lead', {
          event_category: 'conversion',
          event_label: 'agendar_cta',
          cta_text: (link.textContent || '').trim(),
          section: link.closest('header') ? 'header' : (link.closest('.hero-section') ? 'hero' : 'page')
        });
      }
    });
  });

  // 2) Conversion: contact_email_click
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
      track('contact_email_click', {
        event_category: 'conversion',
        event_label: 'email_click',
        email: (link.getAttribute('href') || '').replace('mailto:', ''),
        section: link.closest('#contacto') ? 'contacto' : 'footer'
      });
    });
  });

  // 3) Conversion: contact_section_view (view of #contacto)
  const contactSection = document.getElementById('contacto');
  if (contactSection) {
    const contactObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          track('contact_section_view', {
            event_category: 'conversion',
            event_label: 'contact_section_visible'
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    contactObserver.observe(contactSection);
  }

  // 4) Micro: scroll_75
  let scrollTracked = false;
  const onScrollDepth = () => {
    if (scrollTracked) return;
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const pct = (window.scrollY / maxScroll) * 100;
    if (pct >= 75) {
      track('scroll_75', {
        event_category: 'micro_conversion',
        event_label: 'scroll_depth_75'
      });
      scrollTracked = true;
      window.removeEventListener('scroll', onScrollDepth);
    }
  };
  window.addEventListener('scroll', onScrollDepth, { passive: true });

  // 5) Micro: cta_secondary_click ("Ver por qué somos diferentes")
  document.querySelectorAll('a[href="#problema"]').forEach(link => {
    link.addEventListener('click', () => {
      track('cta_secondary_click', {
        event_category: 'micro_conversion',
        event_label: 'ver_por_que_somos_diferentes',
        cta_text: (link.textContent || '').trim()
      });
    });
  });

  // 6) Micro: engaged_45s
  setTimeout(() => {
    track('engaged_45s', {
      event_category: 'micro_conversion',
      event_label: 'time_on_page_45s'
    });
  }, 45000);

});
