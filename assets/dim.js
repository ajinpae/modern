(function () {
  const overlay = document.querySelector('.page-dim-overlay');
  if (!overlay) {
    console.warn('dim: overlay element .page-dim-overlay not found');
  }

  function init() {
    const triggers = Array.from(document.querySelectorAll('.We, [data-dim-trigger]'));
    if (!triggers.length) {
      console.info('dim: no triggers found (.We or [data-dim-trigger])');
      return;
    }
    console.info('dim: init', triggers.length, 'triggers');

    function add() { document.body.classList.add('dimmed'); }
    function remove() { document.body.classList.remove('dimmed'); }

    triggers.forEach(el => {
      el.addEventListener('mouseenter', add);
      el.addEventListener('mouseleave', remove);
      el.addEventListener('focusin', add);
      el.addEventListener('focusout', remove);
      el.addEventListener('touchstart', add, {passive:true});
      el.addEventListener('touchend', remove, {passive:true});
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    });

    if (overlay) {
      // click overlay to close dim
      overlay.addEventListener('click', remove);
    }

    // Escape closes
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') remove(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else init();
})();