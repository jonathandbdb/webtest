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
      const duration = 4000;
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
      window.gtag('event', eventName, {
        transport_type: 'beacon',
        ...params,
      });
    }
  };

  // 1) Conversion: agendar_consultoria (click a Calendly)
  document.querySelectorAll('a[href*="calendly.com"]').forEach(link => {
    link.addEventListener('click', () => {
      track('agendar_consultoria', {
        event_category: 'conversion',
        event_label: 'calendly_click',
        link_url: link.href,
        link_text: (link.textContent || '').trim()
      });
    });
  });

  // 2) Conversion: correo (click en mailto)
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
      track('correo', {
        event_category: 'conversion',
        event_label: 'email_click',
        email: (link.getAttribute('href') || '').replace('mailto:', ''),
        section: link.closest('#contacto') ? 'contacto' : 'footer'
      });
    });
  });

  // 3) Conversion: whatsapp (click a WhatsApp)
  document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]').forEach(link => {
    link.addEventListener('click', () => {
      track('whatsapp', {
        event_category: 'conversion',
        event_label: 'whatsapp_click',
        link_url: link.href,
        link_text: (link.textContent || '').trim() || 'whatsapp'
      });
    });
  });

  // 4) Conversion: contact_section_view (view of #contacto)
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

  // 5) Micro: scroll_75
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

  // 6) Micro: cta_secondary_click ("Ver por qué somos diferentes")
  document.querySelectorAll('a[href="#problema"]').forEach(link => {
    link.addEventListener('click', () => {
      track('cta_secondary_click', {
        event_category: 'micro_conversion',
        event_label: 'ver_por_que_somos_diferentes',
        cta_text: (link.textContent || '').trim()
      });
    });
  });

  // 7) Micro: engaged_45s
  setTimeout(() => {
    track('engaged_45s', {
      event_category: 'micro_conversion',
      event_label: 'time_on_page_45s'
    });
  }, 45000);

  // ─── Testimonial Slider (horizontal slide) ───
  const sliderTrack = document.getElementById('testimonialTrack');
  const tSlides = document.querySelectorAll('.testimonial-slide');
  const tDots = document.querySelectorAll('.testimonial-dot');
  const tPrevBtn = document.querySelector('.testimonial-prev');
  const tNextBtn = document.querySelector('.testimonial-next');

  if (sliderTrack && tSlides.length > 0) {
    let tCurrent = 0;
    let tAutoplay;
    let tStartX = 0;
    let tDragging = false;

    const tGoTo = (index) => {
      tCurrent = (index + tSlides.length) % tSlides.length;
      sliderTrack.style.transform = 'translateX(-' + (tCurrent * 100) + '%)';
      tDots.forEach((d, i) => d.classList.toggle('active', i === tCurrent));
    };

    const tStartAutoplay = () => {
      tAutoplay = setInterval(() => tGoTo(tCurrent + 1), 5000);
    };
    const tResetAutoplay = () => {
      clearInterval(tAutoplay);
      tStartAutoplay();
    };

    if (tPrevBtn) tPrevBtn.addEventListener('click', () => { tGoTo(tCurrent - 1); tResetAutoplay(); });
    if (tNextBtn) tNextBtn.addEventListener('click', () => { tGoTo(tCurrent + 1); tResetAutoplay(); });
    tDots.forEach(dot => {
      dot.addEventListener('click', () => {
        tGoTo(parseInt(dot.dataset.slide, 10));
        tResetAutoplay();
      });
    });

    // Touch / swipe support
    const tSlider = document.getElementById('testimonialSlider');
    if (tSlider) {
      tSlider.addEventListener('touchstart', (e) => {
        tStartX = e.touches[0].clientX;
        tDragging = true;
      }, { passive: true });
      tSlider.addEventListener('touchend', (e) => {
        if (!tDragging) return;
        tDragging = false;
        const diff = tStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) tGoTo(tCurrent + 1);
          else tGoTo(tCurrent - 1);
          tResetAutoplay();
        }
      }, { passive: true });
    }

    tStartAutoplay();
  }

  // ─── Problem / Solution Dual Synchronized Sliders ───
  const painTrack = document.getElementById('painTrack');
  const solutionTrack = document.getElementById('solutionTrack');
  const psSlideCount = document.querySelectorAll('#painTrack .ps-slide').length;

  if (painTrack && solutionTrack && psSlideCount > 0) {
    let psCurrent = 0;
    let psAutoplay;

    const painDots = document.querySelectorAll('#painDots .ps-dot');
    const solutionDots = document.querySelectorAll('#solutionDots .ps-dot');

    const psGoTo = (index) => {
      psCurrent = (index + psSlideCount) % psSlideCount;
      const offset = -(psCurrent * 100) + '%';
      painTrack.style.transform = 'translateX(' + offset + ')';
      solutionTrack.style.transform = 'translateX(' + offset + ')';
      painDots.forEach((d, i) => d.classList.toggle('active', i === psCurrent));
      solutionDots.forEach((d, i) => d.classList.toggle('active', i === psCurrent));
    };

    const psStartAutoplay = () => {
      psAutoplay = setInterval(() => psGoTo(psCurrent + 1), 4500);
    };
    const psResetAutoplay = () => {
      clearInterval(psAutoplay);
      psStartAutoplay();
    };

    // Arrow listeners (both sliders share navigation)
    document.querySelector('.pain-prev')?.addEventListener('click', () => { psGoTo(psCurrent - 1); psResetAutoplay(); });
    document.querySelector('.pain-next')?.addEventListener('click', () => { psGoTo(psCurrent + 1); psResetAutoplay(); });
    document.querySelector('.solution-prev')?.addEventListener('click', () => { psGoTo(psCurrent - 1); psResetAutoplay(); });
    document.querySelector('.solution-next')?.addEventListener('click', () => { psGoTo(psCurrent + 1); psResetAutoplay(); });

    // Dot listeners (both sets control both sliders)
    painDots.forEach(dot => {
      dot.addEventListener('click', () => { psGoTo(parseInt(dot.dataset.slide, 10)); psResetAutoplay(); });
    });
    solutionDots.forEach(dot => {
      dot.addEventListener('click', () => { psGoTo(parseInt(dot.dataset.slide, 10)); psResetAutoplay(); });
    });

    // Touch / swipe on either slider
    [document.getElementById('painSlider'), document.getElementById('solutionSlider')].forEach(el => {
      if (!el) return;
      let startX = 0;
      let dragging = false;
      el.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
      el.addEventListener('touchend', (e) => {
        if (!dragging) return;
        dragging = false;
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          psGoTo(diff > 0 ? psCurrent + 1 : psCurrent - 1);
          psResetAutoplay();
        }
      }, { passive: true });
    });

    psStartAutoplay();
  }

  // ─── Compare Slider (mobile only) ───
  const compareTrack = document.querySelector('.compare-slider-track');
  const compareSlides = document.querySelectorAll('.compare-slider-slide');
  const compareDots = document.querySelectorAll('.compare-dot');

  if (compareTrack && compareSlides.length > 0) {
    let cmpCurrent = 0;
    let cmpStartX = 0;
    let cmpDragging = false;

    const isMobile = () => window.innerWidth <= 991;

    const cmpGoTo = (index) => {
      if (!isMobile()) return;
      cmpCurrent = Math.max(0, Math.min(index, compareSlides.length - 1));
      const slideW = compareSlides[0].offsetWidth;
      const gap = 12;
      compareTrack.style.transform = 'translateX(-' + (cmpCurrent * (slideW + gap)) + 'px)';
      compareDots.forEach((d, i) => d.classList.toggle('active', i === cmpCurrent));
    };

    compareDots.forEach(dot => {
      dot.addEventListener('click', () => { cmpGoTo(parseInt(dot.dataset.slide, 10)); cmpResetAutoplay(); });
    });

    // Autoplay (ping-pong every 4s, mobile only)
    let cmpDirection = 1;
    let cmpAutoplayTimer = null;
    const cmpAutoplay = () => {
      if (!isMobile()) return;
      const next = cmpCurrent + cmpDirection;
      if (next >= compareSlides.length) { cmpDirection = -1; }
      else if (next < 0) { cmpDirection = 1; }
      cmpGoTo(cmpCurrent + cmpDirection);
    };
    const cmpStartAutoplay = () => {
      cmpStopAutoplay();
      cmpAutoplayTimer = setInterval(cmpAutoplay, 4000);
    };
    const cmpStopAutoplay = () => { if (cmpAutoplayTimer) { clearInterval(cmpAutoplayTimer); cmpAutoplayTimer = null; } };
    const cmpResetAutoplay = () => { cmpStopAutoplay(); cmpStartAutoplay(); };
    cmpStartAutoplay();

    // Swipe
    compareTrack.addEventListener('touchstart', (e) => {
      if (!isMobile()) return;
      cmpStartX = e.touches[0].clientX;
      cmpDragging = true;
    }, { passive: true });
    compareTrack.addEventListener('touchend', (e) => {
      if (!isMobile() || !cmpDragging) return;
      cmpDragging = false;
      const diff = cmpStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        cmpGoTo(diff > 0 ? cmpCurrent + 1 : cmpCurrent - 1);
        cmpResetAutoplay();
      }
    }, { passive: true });

    // Reset on resize
    window.addEventListener('resize', () => {
      if (!isMobile()) {
        compareTrack.style.transform = '';
        cmpCurrent = 0;
        cmpDirection = 1;
        compareDots.forEach((d, i) => d.classList.toggle('active', i === 0));
        cmpStopAutoplay();
      } else {
        cmpStartAutoplay();
      }
    });
  }

});
