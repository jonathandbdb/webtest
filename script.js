/* ═══════════════════════════════════════════════════════
   LANDING PAGE — JavaScript
   Menu toggle + Smooth interactions
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Mobile nav toggle ───
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.navbar__links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isOpen = navLinks.classList.contains('active');
      navToggle.innerHTML = isOpen
        ? '<i class="ph ph-x"></i>'
        : '<i class="ph ph-list"></i>';
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.innerHTML = '<i class="ph ph-list"></i>';
      });
    });
  }

  // ─── Navbar background on scroll ───
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        navbar.style.background = 'rgba(11, 17, 32, 0.95)';
      } else {
        navbar.style.background = 'rgba(11, 17, 32, 0.85)';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── Intersection Observer for fade-in animations ───
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const animatedElements = document.querySelectorAll(
    '.service-card, .benefit-item, .process-step, .testimonial-card, .faq-item, .problem-card, .comparison-col'
  );

  // Reset initial state
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add a staggered delay based on sibling index
        const parent = entry.target.parentElement;
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(entry.target);
        
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 80);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));

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
          section: link.closest('nav') ? 'navbar' : (link.closest('.hero') ? 'hero' : 'page')
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

  // ─── Inline helper popover on word “Odoo” ───
  const odooInlineWrap = document.getElementById('odooInlineHelpWrap');
  const odooInlineBtn = document.getElementById('odooInlineHelpBtn');
  const odooInlinePopover = document.getElementById('odooInlineHelpPopover');

  if (odooInlineWrap && odooInlineBtn && odooInlinePopover) {
    const setOpen = (open) => {
      odooInlineWrap.classList.toggle('is-open', open);
      odooInlineBtn.setAttribute('aria-expanded', String(open));
      odooInlinePopover.setAttribute('aria-hidden', String(!open));
    };

    odooInlineBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = odooInlineWrap.classList.contains('is-open');
      setOpen(!isOpen);
    });

    odooInlinePopover.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('click', (e) => {
      if (!odooInlineWrap.contains(e.target)) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

});
