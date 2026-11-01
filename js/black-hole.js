// ==================== BURACO NEGRO ANIMADO ====================
// Desenha em todo <canvas data-black-hole> visível: sombra, anel de fótons, luz curvada
// pela gravidade e disco de acreção, com o lado que vem em nossa direção mais brilhante.
(function(){
  const FRAME_MS = 1000 / 30;
  const PARTICLES = 260;
  const DISK_TILT = 0.2;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvases = [...document.querySelectorAll('canvas[data-black-hole]')];

  const particles = Array.from({ length: PARTICLES }, () => {
    const orbit = 1.55 + Math.pow(Math.random(), 1.6) * 2.1;
    return {
      orbit,
      angle: Math.random() * Math.PI * 2,
      speed: 0.035 / Math.pow(orbit, 1.5),
      width: Math.random() * 1.3 + 0.4
    };
  });

  function fitToDisplay(canvas){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if(canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)){
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function dopplerGradient(ctx, radius, alpha){
    const gradient = ctx.createLinearGradient(-radius, 0, radius, 0);
    gradient.addColorStop(0, `rgba(255,244,214,${alpha})`);
    gradient.addColorStop(0.5, `rgba(255,188,92,${alpha * 0.8})`);
    gradient.addColorStop(1, `rgba(214,92,28,${alpha * 0.35})`);
    return gradient;
  }

  function drawParticles(ctx, radius, front){
    particles.forEach(p => {
      if((Math.sin(p.angle) > 0) !== front) return;
      const orbit = p.orbit * radius;
      const brightness = 0.3 + 0.7 * (0.5 - 0.5 * Math.cos(p.angle));
      ctx.strokeStyle = `rgba(255,${Math.round(150 + 80 * brightness)},${Math.round(70 + 110 * brightness)},${brightness * 0.9})`;
      ctx.lineWidth = p.width;
      ctx.beginPath();
      ctx.ellipse(0, 0, orbit, orbit * DISK_TILT, 0, p.angle, p.angle + 0.14);
      ctx.stroke();
    });
  }

  function drawDiskBand(ctx, radius, start, end, strength){
    for(let i = 0; i < 9; i++){
      const t = i / 8;
      const orbit = radius * (1.5 + t * 1.9);
      ctx.strokeStyle = dopplerGradient(ctx, orbit, (1 - t) * (1 - t) * strength);
      ctx.lineWidth = radius * 0.17;
      ctx.beginPath();
      ctx.ellipse(0, 0, orbit, orbit * DISK_TILT, 0, start, end);
      ctx.stroke();
    }
  }

  function render(canvas){
    const { ctx, width, height } = fitToDisplay(canvas);
    const radius = Math.min(width * 0.17, height * 0.26);
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);

    const halo = ctx.createRadialGradient(0, 0, radius, 0, 0, Math.min(radius * 3.6, height / 2));
    halo.addColorStop(0, 'rgba(255,170,70,.26)');
    halo.addColorStop(0.45, 'rgba(190,100,40,.08)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(-width / 2, -height / 2, width, height);

    ctx.globalCompositeOperation = 'lighter';
    drawDiskBand(ctx, radius, Math.PI, Math.PI * 2, 0.32);
    drawParticles(ctx, radius, false);

    // Luz da parte de trás do disco, curvada por cima e por baixo da sombra.
    [[1.42, 1.3, -0.09, 0.2, 0.34], [1.26, 1.2, -0.05, 0.1, 0.55]].forEach(([rx, ry, offset, line, alpha]) => {
      ctx.strokeStyle = dopplerGradient(ctx, radius * rx, alpha);
      ctx.lineWidth = radius * line;
      ctx.beginPath();
      ctx.ellipse(0, radius * offset, radius * rx, radius * ry, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    });
    ctx.strokeStyle = dopplerGradient(ctx, radius * 1.2, 0.3);
    ctx.lineWidth = radius * 0.07;
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.04, radius * 1.2, radius * 1.13, 0, 0, Math.PI);
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = dopplerGradient(ctx, radius, 0.95);
    ctx.lineWidth = Math.max(1, radius * 0.025);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.015, 0, Math.PI * 2);
    ctx.stroke();

    drawDiskBand(ctx, radius, 0, Math.PI, 0.6);
    drawParticles(ctx, radius, true);
    ctx.restore();
  }

  function renderVisible(){
    canvases.forEach(canvas => {
      if(canvas.offsetParent !== null && canvas.clientWidth > 0) render(canvas);
    });
  }

  let last = 0;
  function loop(now){
    const covered = document.body.classList.contains('no-scroll');
    if(!document.hidden && !covered && now - last >= FRAME_MS){
      const delta = last ? Math.min((now - last) / FRAME_MS, 3) : 1;
      last = now;
      particles.forEach(p => { p.angle = (p.angle + p.speed * delta) % (Math.PI * 2); });
      renderVisible();
    }
    requestAnimationFrame(loop);
  }

  window.renderBlackHoles = renderVisible; // quadro único quando a animação está desligada
  window.addEventListener('resize', renderVisible);
  renderVisible();
  if(!reducedMotion) requestAnimationFrame(loop);
})();
