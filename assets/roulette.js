(function () {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.rowof123.carousel').forEach(initCarousel);
  });

   function initCarousel(root) {
    const track = root.querySelector('.carousel-track');
    if (!track) return;
    let originals = Array.from(track.children);
    console.info('roulette: initCarousel found track, originals count=', originals.length);
    if (!originals.length) return;

    // ensure track has display:flex and gap in CSS
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 0;

    // clone full set for seamless loop
    const clones = originals.map(el => el.cloneNode(true));
    clones.forEach(c => track.appendChild(c));

    // recompute items array (originals first, then clones)
    const items = Array.from(track.children);
    const origCount = originals.length;

    // measure width of original sequence
    function calcOriginalWidth() {
      let w = 0;
      for (let el of originals) {
        const r = el.getBoundingClientRect();
        w += r.width + gap;
      }
      // subtract last gap
      return Math.max(0, w - gap);
    }

    let origWidth = calcOriginalWidth();

    // state for RAF
    let offset = 0;            // pixels scrolled into the track
    let running = true;
    const baseSpeed = Math.max(0.4, Math.min(1.4, root.clientWidth / 1200)); // px per frame factor
    let lastTime = performance.now();

    // helper: set transform
    function apply() {
      track.style.transform = `translateX(${-offset}px)`;
    }

    // find and mark center item (only among originals)
     function updateActive() {
      const rootRect = root.getBoundingClientRect();
      const containerCenterX = rootRect.left + rootRect.width / 2;

      let bestIdx = 0;
      let bestDist = Infinity;

      for (let i = 0; i < origCount; i++) {
        const el = originals[i];
        const rect = el.getBoundingClientRect();
        const elCenter = rect.left + rect.width / 2;
        const dist = Math.abs(elCenter - containerCenterX);
        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
      }
      // debug log
      console.debug('roulette:updateActive centerX=', Math.round(containerCenterX),
                    'bestIdx=', bestIdx, 'bestDist=', Math.round(bestDist));

      originals.forEach((el, i) => {
        el.classList.toggle('active', i === bestIdx);
        el.classList.toggle('inactive', i !== bestIdx);
      });
      for (let i = origCount; i < items.length; i++) {
        items[i].classList.remove('active');
        items[i].classList.add('inactive');
      }
    

      // назначаем классы: только один active среди оригиналов
      originals.forEach((el, i) => {
        el.classList.toggle('active', i === bestIdx);
        el.classList.toggle('inactive', i !== bestIdx);
      });

      // на всякий случай снимем active у клонов
      for (let i = origCount; i < items.length; i++) {
        items[i].classList.remove('active');
        items[i].classList.add('inactive');
      }
    }

    // animation loop
    function step(now) {
      const dt = Math.min(40, now - lastTime); // cap delta
      lastTime = now;
      if (running) {
        // speed scaled by dt so framerate independent
        offset += baseSpeed * (dt / (1000 / 60)) * 1.2; // tweak multiplier for feel
        // wrap offset when passes original width
        if (origWidth > 0 && offset >= origWidth) {
          offset -= origWidth;
        }
        apply();
        updateActive();
      }
      rafId = requestAnimationFrame(step);
    }

    // start/stop
    let rafId = requestAnimationFrame(step);
    function start() { running = true; lastTime = performance.now(); }
    function stop() { running = false; }

    // pause on hover/focus
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    // on resize recompute widths and reposition to avoid jump
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        origWidth = calcOriginalWidth();
        // clamp offset
        if (origWidth > 0) offset = offset % origWidth;
        apply();
      }, 80);
    });

    // initial layout after images/fonts
    window.requestAnimationFrame(() => {
      origWidth = calcOriginalWidth();
      offset = offset % (origWidth || 1);
      apply();
      updateActive();
    });
  }
})();