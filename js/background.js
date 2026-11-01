// ==================== CAMPO ESTELAR E VIAGEM ENTRE TELAS ====================
(function(){
  const canvas = document.getElementById('galaxy-canvas');
  const ctx    = canvas.getContext('2d');
  const photo  = document.getElementById('bg-photo');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FRAME_MS = 1000 / 30; // poupa bateria: estrelas não precisam de 60fps
  const WARP_DECAY = 0.86;
  const COLORS = ['#ffffff','#fff4d6','#cfe9ff','#ffe0b0','#d9e4ff'];

  const stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * 2 - 1, // relativo ao centro da tela
    y: Math.random() * 2 - 1,
    depth: Math.random() * 0.8 + 0.2,
    r: Math.random() * 1.1 + 0.25,
    alpha: Math.random() * 0.5 + 0.25,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.03 + 0.006,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  }));

  let warp = 0;

  function draw(){
    const { width, height } = canvas;
    const cx = width / 2, cy = height / 2;
    ctx.clearRect(0, 0, width, height);
    stars.forEach(s => {
      s.phase += s.speed;
      const px = cx + s.x * cx, py = cy + s.y * cy;
      ctx.globalAlpha = s.alpha * (0.6 + 0.4 * Math.sin(s.phase));
      if(warp > 0.02){
        const stretch = 1 + warp * 0.42 * s.depth;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.r;
        ctx.globalAlpha = Math.min(1, ctx.globalAlpha + warp * 0.5);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx + s.x * cx * stretch, cy + s.y * cy * stretch);
        ctx.stroke();
      } else {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    warp *= WARP_DECAY;
  }

  function resize(){
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  }

  let last = 0;
  function loop(now){
    if(!document.hidden && now - last >= FRAME_MS){
      last = now;
      draw();
    }
    requestAnimationFrame(loop);
  }

  // Cada tela é um lugar do universo: troca a foto com um salto rápido pelas estrelas.
  window.travelTo = (screenId) => {
    document.body.dataset.space = screenId;
    if(reducedMotion){
      if(window.renderBlackHoles) window.renderBlackHoles();
      return;
    }
    warp = 1;
    photo.animate([{ opacity: 0, transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 480, easing: 'ease-out' });
  };

  window.addEventListener('resize', resize);
  resize();
  if(!reducedMotion) requestAnimationFrame(loop);
})();
