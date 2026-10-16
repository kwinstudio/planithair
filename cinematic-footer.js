(() => {
  const footer = document.querySelector('.cinematic-footer');
  if (!footer) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const video = footer.querySelector('[data-footer-video]');
  const toggle = footer.querySelector('.cinema-motion');
  const label = footer.querySelector('[data-motion-label]');
  const cursor = footer.querySelector('.cinema-cursor');
  let inView = false, paused = false, failed = false;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  // Preserve readable HTML and the static poster if scripting is unavailable.
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const title = footer.querySelector('.cinema-title');
    title.setAttribute('aria-label', 'Your next look starts here.');
    let wordIndex = 0;
    function splitWords(parent) {
      [...parent.childNodes].forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(word => {
            if (!word.trim()) { frag.append(document.createTextNode(word)); return; }
            const mask = document.createElement('span'), inner = document.createElement('span');
            mask.className = 'cinema-word-mask'; mask.setAttribute('aria-hidden', 'true');
            inner.className = 'cinema-word'; inner.textContent = word;
            inner.style.setProperty('--delay', `${wordIndex++ * .08}s`);
            mask.append(inner); frag.append(mask);
          });
          node.replaceWith(frag);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') splitWords(node);
      });
    }
    splitWords(title);
    const mark = footer.querySelector('.cinema-wordmark > span');
    const text = mark.textContent; mark.textContent = '';
    [...text].forEach((char, index) => {
      const mask = document.createElement('span'), inner = document.createElement('span');
      mask.className = 'cinema-letter-mask'; inner.className = 'cinema-letter';
      inner.textContent = char === ' ' ? '\u00a0' : char;
      inner.style.setProperty('--delay', `${.12 + index * .055}s`);
      mask.append(inner); mark.append(mask);
    });
    footer.classList.add('has-motion');
  }

  function syncVideo() {
    const saveData = navigator.connection?.saveData;
    const shouldPlay = inView && !paused && !failed && !reduced.matches && !saveData && !document.hidden;
    if (!shouldPlay) { video.pause(); footer.classList.remove('is-playing'); return; }
    const source = video.querySelector('source');
    if (!source.hasAttribute('src')) { source.src = source.dataset.src; video.load(); }
    video.play().catch(() => { toggle.hidden = false; label.textContent = 'Play film'; });
  }
  video.addEventListener('playing', () => {
    footer.classList.add('is-playing'); toggle.hidden = false;
    toggle.setAttribute('aria-label', 'Pause background video'); label.textContent = 'Pause film';
    toggle.setAttribute('aria-pressed', 'false');
  });
  video.addEventListener('error', () => {
    failed = true; footer.classList.remove('is-playing'); toggle.hidden = true;
  });
  toggle.addEventListener('click', () => {
    paused = !video.paused; // Also permits retry after a browser blocks autoplay.
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
    label.textContent = paused ? 'Play film' : 'Pause film';
    syncVideo();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) footer.classList.add('is-visible');
      else footer.classList.remove('cursor-active');
      syncVideo();
    }, { threshold: .08 }).observe(footer);
  } else footer.classList.add('is-visible');
  document.addEventListener('visibilitychange', syncVideo);
  reduced.addEventListener('change', () => {
    if (reduced.matches) footer.classList.remove('cursor-active');
    toggle.hidden = reduced.matches || !video.hasAttribute('src') && !video.querySelector('source').hasAttribute('src');
    syncVideo();
  });

  // A restrained cursor accent, limited to empty footer space on desktop.
  footer.addEventListener('pointermove', event => {
    if (!finePointer.matches || reduced.matches || event.pointerType === 'touch') return;
    const interactive = event.target.closest('a,button');
    footer.classList.toggle('cursor-active', !interactive);
    const x = Math.min(event.clientX + 20, innerWidth - 210);
    const y = Math.min(event.clientY + 20, innerHeight - 65);
    cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
  }, { passive: true });
  footer.addEventListener('pointerleave', () => footer.classList.remove('cursor-active'));
})();
