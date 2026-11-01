// ==================== FUNDO ESTELAR ====================
(function(){
  const canvas = document.getElementById('galaxy-canvas');
  const ctx    = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FRAME_MS = 1000 / 24; // estrelas não precisam de 60fps; poupa bateria na academia
  const COLORS = ['#ffffff','#fffaf0','#f0f8ff','#fff8e0','#e8f0ff','#ffe8c8'];

  const stars = Array.from({ length: 140 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.1 + 0.2,
    alpha: Math.random() * 0.5 + 0.2,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.02 + 0.004,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  }));

  function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.phase += s.speed;
      ctx.globalAlpha = s.alpha * (0.6 + 0.4 * Math.sin(s.phase));
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
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

  window.addEventListener('resize', resize);
  resize();
  if(!reducedMotion) requestAnimationFrame(loop);
})();
