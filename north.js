/* Planit Hair — theme interactions: marquee, header states, hero, drag slider, rows, pixel reveal. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isHome = document.body.dataset.page === 'home';

  // Marquee: duplicate the track so the loop is seamless.
  $$('.n-marquee').forEach(m => {
    const track = $('.n-marquee-track', m);
    if (!track || reduced) return;
    const clone = track.cloneNode(true); clone.setAttribute('aria-hidden', 'true');
    m.append(clone);
  });

  // Header: hide the marquee once scrolling; on home, turn solid after the hero.
  const top = $('#siteTop'), hero = $('.n-hero');
  const syncTop = () => {
    if (!top) return;
    const y = scrollY;
    top.classList.toggle('is-condensed', y > 60);
    if (isHome) top.classList.toggle('is-solid', !hero || y > hero.offsetHeight - 90);
  };
  addEventListener('scroll', syncTop, { passive: true }); addEventListener('resize', syncTop); syncTop();
  const menuBtn = $('.menu-button');
  menuBtn?.addEventListener('click', () => requestAnimationFrame(() => top?.classList.toggle('menu-open', menuBtn.getAttribute('aria-expanded') === 'true')));
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => top?.classList.remove('menu-open')));

  // Hero headline: word-by-word rise.
  const title = $('.n-hero-title');
  if (title && !reduced) {
    const words = title.textContent.trim().split(/\s+/);
    title.setAttribute('aria-label', title.textContent.trim());
    title.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
  }

  // Hero video: only play while visible.
  const heroVideo = $('.n-hero video');
  if (heroVideo) {
    heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-playing'));
    if (reduced || navigator.connection?.saveData) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { if (e.isIntersecting) heroVideo.play().catch(() => {}); else heroVideo.pause(); }).observe(heroVideo);
    }
  }

  // Drag-to-explore slider (mouse); touch uses native scrolling.
  $$('[data-drag-track]').forEach(track => {
    let startX = 0, startLeft = 0, moved = 0, down = false;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = 0; startX = e.clientX; startLeft = track.scrollLeft;
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) { track.classList.add('is-dragging'); track.scrollLeft = startLeft - dx; }
    });
    const end = () => {
      if (!down) return; down = false;
      if (!track.classList.contains('is-dragging')) return;
      track.classList.remove('is-dragging');
      const slides = $$('.n-slide', track); const left = track.scrollLeft;
      let best = slides[0];
      slides.forEach(s => { if (Math.abs(s.offsetLeft - left) < Math.abs(best.offsetLeft - left)) best = s; });
      track.scrollTo({ left: best.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
    };
    addEventListener('pointerup', end); addEventListener('pointercancel', end);
    track.addEventListener('click', e => { if (moved > 4) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
    track.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const w = $('.n-slide', track)?.offsetWidth || track.clientWidth;
      track.scrollBy({ left: e.key === 'ArrowRight' ? w : -w, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  // Row arrows (Made at Planit…).
  $$('[data-row]').forEach(row => {
    const scope = row.closest('section') || document;
    const prev = $('[data-row-prev]', scope), next = $('[data-row-next]', scope);
    const step = () => (row.firstElementChild?.offsetWidth || row.clientWidth / 4) + 14;
    const sync = () => {
      if (prev) prev.disabled = row.scrollLeft < 4;
      if (next) next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
    };
    prev?.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => row.scrollBy({ left: step(), behavior: 'smooth' }));
    row.addEventListener('scroll', sync, { passive: true });
    new MutationObserver(sync).observe(row, { childList: true }); sync();
  });

  // Starting prices on the showcase, from the CMS data.
  if (typeof siteReady !== 'undefined') siteReady.then(d => {
    $$('[data-from]').forEach(el => {
      if (typeof priceOptionsFor !== 'function') return;
      const options = el.dataset.from.split('|').flatMap(n => priceOptionsFor(d || {}, n));
      const from = startingPrice(options);
      if (from) el.textContent = `from ${from}`;
    });
  });

  // Curtain reveal for images + fade-up for text, staggered per row.
  if (reduced || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-reveal');
  const textTargets = '.n-head,.n-page-head .n-crumbs,.n-page-head h1,.n-page-head-row,.n-band-inner,.n-care-intro,.care-row,.reminder,.price-intro,.n-route,.n-book .shell>*,.faq-layout>*,.n-insta,.n-slide-copy,.n-card-info,.n-card-sub,.n-card-actions,.n-swatches,.gallery-card-meta,.social-card,.footer-grid>div';
  const io = new IntersectionObserver(entries => {
    const shown = entries.filter(e => e.isIntersecting).map(e => e.target);
    shown.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left || a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    shown.forEach((watched, i) => {
      io.unobserve(watched);
      const el = watched.__revealTarget || watched;
      el.style.setProperty('--stagger', `${Math.min(i, 6) * 0.08}s`);
      requestAnimationFrame(() => el.classList.add('is-in'));
      setTimeout(() => el.style.removeProperty('--stagger'), 1800);
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  // Clipped elements count as invisible to IntersectionObserver, so watch an unclipped stand-in.
  const setup = el => {
    if (el.dataset.revealReady) return; el.dataset.revealReady = '1';
    let watched = el;
    if (el.hasAttribute('data-reveal')) { watched = el.parentElement; if (watched.__revealTarget) watched = el.closest('section') || el; }
    watched.__revealTarget = el; io.observe(watched);
  };
  const scan = () => {
    $$('[data-reveal]').forEach(setup);
    $$(textTargets).forEach(el => { if (!el.closest('.n-hero') && !el.hasAttribute('data-rise')) el.setAttribute('data-rise', ''); setup(el); });
  };
  scan();
  let t = 0; new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 30); }).observe(document.body, { childList: true, subtree: true });
})();
