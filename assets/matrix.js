(function(){
  const canvas = document.querySelector('.matrix-overlay');
  if(!canvas) return;

  const ctx = canvas.getContext('2d');
  let raf = null;
  let cols = [];
  let width = 0;
  let height = 0;
  const chars = '0123456789';
  const fontSizeBase = 18;

  // tuning
  const FADE_ALPHA = 0.06;    // фон для постепенного стирания предыдущих кадров (меньше = более "хвост")
  const TAIL_LENGTH = 7;      // длина трейла
  const HEAD_ALPHA = 0.85;    // базовая яркость головы
  const TRAIL_ALPHA_START = 0.6;

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setupCols();
  }

  function setupCols() {
    const fontSize = Math.max(12, Math.round(fontSizeBase * Math.min(1.6, width / 800)));
    ctx.font = fontSize + 'px monospace';
    ctx.textBaseline = 'top';
    const colW = fontSize * 0.6;
    const colCount = Math.max(2, Math.floor(width / colW));
    cols = new Array(colCount).fill(0).map((_, idx)=>({
      y: Math.random() * height * -1,               // старт выше экрана (разный для плавности)
      speed: 0.6 + Math.random() * 2.2,             // скорость колонок
      font: fontSize,
      offsetPhase: Math.random() * 1000,            // для мягкой десинхронизации
      jitter: (Math.random() - 0.5) * 0.6           // небольшая горизонтальная дрожь
    }));
  }

  function draw() {
    // плавное стирание предыдущих кадров
    ctx.fillStyle = `rgba(0,0,0,${FADE_ALPHA})`;
    ctx.fillRect(0,0,width,height);

    // небольшой glow наложение для более мягкого вида
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      const xBase = i * (c.font * 0.6);
      // добавляем маленькую синусоидальную горизонтальную «дрожь» для живости
      const xJitter = Math.sin((performance.now() * 0.0007) + c.offsetPhase) * c.jitter * 6;
      const x = xBase + xJitter;

      // head
      const headChar = chars.charAt(Math.floor(Math.random() * chars.length));
      ctx.font = c.font + 'px monospace';
      ctx.fillStyle = `rgba(180,255,180,${HEAD_ALPHA})`;
      ctx.fillText(headChar, x, c.y);

      // trail — плавный градиент яркости
      for (let t = 1; t <= TAIL_LENGTH; t++) {
        const yy = c.y - t * (c.font * 0.9);
        if (yy < -50) break;
        const alpha = Math.max(0, TRAIL_ALPHA_START - t * (TRAIL_ALPHA_START / (TAIL_LENGTH + 1)));
        ctx.fillStyle = `rgba(120,200,120,${alpha})`;
        ctx.fillText(chars.charAt((Math.floor(Math.random()*chars.length))), x, yy);
      }

      // обновление позиции — плавное движение
      c.y += c.speed * (c.font * 0.85);

      // когда колонка уходит вниз — мягкий ресет с рандомизацией
      if (c.y > height + 20) {
        // смещаем не в большой случайный прыжок, а на небольшое отрицательное значение
        c.y = -Math.random() * (height * 0.35) - (i % 6) * 4;
        c.speed = 0.6 + Math.random() * 2.2;
        c.offsetPhase = Math.random() * 1000;
      }
    }

    // вернём нормальную композитную операцию
    ctx.globalCompositeOperation = 'source-over';

    raf = requestAnimationFrame(draw);
  }

  function start() {
    if (raf) return;
    resize();
    // лёгкая начальная затемняющая заливка (не резко)
    ctx.fillStyle = 'rgba(122, 118, 118, 0.52)';
    ctx.fillRect(0,0,width,height);
    raf = requestAnimationFrame(draw);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  // observe body.dimmed changes
  const obs = new MutationObserver(()=> {
    const active = document.body.classList.contains('dimmed');
    if (active) start(); else stop();
  });
  obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('resize', () => {
    if (raf) resize();
  });

  // start immediately if already dimmed
  if (document.body.classList.contains('dimmed')) start();
})();