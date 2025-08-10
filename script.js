document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Custom cursor ---------- */
  const cursor = document.getElementById('customCursor');
  if (cursor) {
    window.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }, { passive: true });
  }

  /* ---------- GSAP animations ---------- */
  const gsapAvailable = typeof gsap !== 'undefined';
  const scrollTriggerAvailable = typeof ScrollTrigger !== 'undefined';
  if (gsapAvailable && scrollTriggerAvailable) gsap.registerPlugin(ScrollTrigger);

  if (gsapAvailable) {
    gsap.from('nav', { y: -50, opacity: 0, duration: 0.45, ease: 'power2.out' });
    gsap.from('.hero-overlay .profile-pic', { opacity: 0, y: 8, duration: 0.45, delay: 0.1 });
    gsap.from('.glitch', { opacity: 0, y: 10, duration: 0.45, delay: 0.2 });
    gsap.from('.hero-sub', { opacity: 0, y: 10, duration: 0.45, delay: 0.3 });
    gsap.from('.hero .btn', { opacity: 0, scale: 0.97, duration: 0.4, delay: 0.4 });

    if (scrollTriggerAvailable) {
      ScrollTrigger.batch('.section', {
        onEnter: batch => gsap.fromTo(batch, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.05 }),
        start: 'top 80%'
      });

      ScrollTrigger.batch('.project-card', {
        onEnter: batch => gsap.from(batch, { opacity: 0, y: 20, duration: 0.45, ease: 'power2.out', stagger: 0.06 }),
        start: 'top 90%'
      });

      gsap.utils.toArray('.fill').forEach((el) => {
        const target = el.dataset.fill || '0%';
        gsap.set(el, { width: '0%' });
        ScrollTrigger.create({
          trigger: el.closest('.section') || el,
          start: 'top 75%',
          onEnter: () => gsap.to(el, { width: target, duration: 1, ease: 'power2.out' }),
          onEnterBack: () => gsap.to(el, { width: target, duration: 1, ease: 'power2.out' })
        });
      });
    }
  }

  /* ---------- Smooth nav ---------- */
  function smoothToHash(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    if (window._lenisInstance) {
      window._lenisInstance.scrollTo(target);
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
  document.querySelectorAll('nav a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      smoothToHash(a.getAttribute('href'));
    });
  });

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (typeof Lenis === 'function') {
    lenis = new Lenis({
      duration: 0.85, // snappier
      easing: t => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      smoothTouch: false
    });
    window._lenisInstance = lenis;

    function lenisRaf(time) {
      lenis.raf(time);
      requestAnimationFrame(lenisRaf);
    }
    requestAnimationFrame(lenisRaf);

    if (scrollTriggerAvailable) lenis.on('scroll', ScrollTrigger.update);
  } else {
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  /* ---------- Particle background ---------- */
  const canvas = document.getElementById('bgCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let W = innerWidth, H = innerHeight;
    const setSize = () => {
      W = innerWidth; H = innerHeight;
      canvas.width = W; canvas.height = H;
    };
    setSize();
    window.addEventListener('resize', () => {
      clearTimeout(window._bgResizeTimer);
      window._bgResizeTimer = setTimeout(setSize, 100);
    });

    const N = 40;
    const particles = [];
    const maxDist = 120, maxDistSq = maxDist * maxDist;
    let isScrolling = false;

    class Particle {
      constructor() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.r = 1 + Math.random() * 1.6;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(51,153,255,0.75)';
        ctx.fill();
      }
    }

    for (let i = 0; i < N; i++) particles.push(new Particle());

    function animateParticles() {
      ctx.clearRect(0, 0, W, H);
      if (!isScrolling) {
        for (let i = 0; i < N; i++) {
          particles[i].update();
          particles[i].draw();
        }
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dSq = dx * dx + dy * dy;
            if (dSq < maxDistSq) {
              const alpha = 1 - Math.sqrt(dSq) / maxDist;
              ctx.strokeStyle = `rgba(51,153,255,${(alpha * 0.6).toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }
      requestAnimationFrame(animateParticles);
    }
    animateParticles();

    /* Pause particles while scrolling */
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => { isScrolling = false; }, 100);
    }, { passive: true });
  }
});
