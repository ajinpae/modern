document.addEventListener('DOMContentLoaded', function initTilt() {
  const nodes = document.querySelectorAll('.tilt');
  if(!nodes.length) {
    console.info('tilt: no .tilt nodes found');
    return;
  }
  nodes.forEach(el=>{
    const inner = el.querySelector('.tilt__inner') || el;
    const sheen = el.querySelector('.tilt__sheen');

    function onMove(e){
      const rect = el.getBoundingClientRect();
      const clientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0].clientX);
      const clientY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0].clientY);
      if (clientX == null || clientY == null) return;
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      const rx = (y - 0.5) * -14; // rotateX
      const ry = (x - 0.5) * 18;  // rotateY
      inner.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      inner.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      inner.style.setProperty('--sx', ((x-0.5)*20).toFixed(1) + 'px');
      inner.style.setProperty('--sy', ((y-0.5)*20).toFixed(1) + 'px');
      if(sheen){
        sheen.style.setProperty('--sheenX', (x*140 - 70) + '%');
        sheen.style.setProperty('--sheenY', (y*140 - 70) + '%');
      }
    }

    el.addEventListener('mousemove', onMove);
    el.addEventListener('touchmove', onMove, {passive:true});
    el.addEventListener('mouseleave', ()=>{
      inner.style.setProperty('--rx','0deg');
      inner.style.setProperty('--ry','0deg');
      inner.style.setProperty('--sx','0px');
      inner.style.setProperty('--sy','0px');
      if(sheen){ sheen.style.setProperty('--sheenX','-100%'); sheen.style.setProperty('--sheenY','-100%'); }
    });
  });
});