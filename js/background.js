// ==================== GALAXY BACKGROUND ====================
(function(){
  const canvas = document.getElementById('galaxy-canvas');
  const ctx    = canvas.getContext('2d');

  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const STAR_COLORS = ['#ffffff','#ffffff','#ffffff','#fffaf0','#f0f8ff','#fff8e0','#e8f0ff','#ffe8c8'];
  const stars = [];
  for(let i = 0; i < 340; i++){
    const rnd  = Math.random();
    const size = rnd < 0.65 ? Math.random()*0.7+0.15
               : rnd < 0.88 ? Math.random()*1.0+0.6
               : rnd < 0.97 ? Math.random()*1.5+1.0
                             : Math.random()*2.0+1.8;
    stars.push({
      x:Math.random(), y:Math.random(), r:size,
      basealpha: rnd < 0.65 ? Math.random()*0.55+0.15 : Math.random()*0.5+0.45,
      tw: Math.random()*Math.PI*2, sp: Math.random()*0.012+0.002,
      color: STAR_COLORS[Math.floor(Math.random()*STAR_COLORS.length)],
      bright: rnd > 0.96
    });
  }

  function drawBlackHole(cx, cy, R){
    const lens = ctx.createRadialGradient(cx,cy,R*0.8,cx,cy,R*3.8);
    lens.addColorStop(0,'rgba(200,140,30,0)');
    lens.addColorStop(0.12,'rgba(190,130,25,0.07)');
    lens.addColorStop(0.28,'rgba(150,100,20,0.04)');
    lens.addColorStop(0.5,'rgba(80,55,12,0.02)');
    lens.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cx,cy,R*3.8,0,Math.PI*2); ctx.fillStyle=lens; ctx.fill();
    ctx.save(); ctx.translate(cx,cy);
    // Disk back
    ctx.save(); ctx.scale(1,0.28);
    for(let i=20;i>=0;i--){
      const t=i/20, dr=R*1.05+t*(R*2.2-R*1.05), lw=(R*2.2-R*1.05)/21+0.5;
      ctx.beginPath(); ctx.arc(0,0,dr,Math.PI,2*Math.PI);
      const al=((1-t)*(1-t))*0.28;
      ctx.strokeStyle=`rgba(${Math.round(200-t*60)},${Math.round(90-t*50)},${Math.round(15-t*10)},${al})`;
      ctx.lineWidth=lw; ctx.stroke();
    }
    ctx.restore();
    // Disk front
    ctx.save(); ctx.scale(1,0.28);
    for(let i=30;i>=0;i--){
      const t=i/30, dr=R*1.05+t*(R*2.4-R*1.05), lw=(R*2.4-R*1.05)/31+0.8;
      ctx.beginPath(); ctx.arc(0,0,dr,0,Math.PI);
      const al=((1-t)*(1-t))*0.75;
      const rr=Math.min(255,Math.round(255-t*30)), gg=Math.round(200-t*140), bb=Math.round(80-t*70);
      ctx.strokeStyle=`rgba(${rr},${gg},${bb},${al})`;
      ctx.lineWidth=lw; ctx.stroke();
    }
    ctx.restore();
    // Photon ring
    const photon=ctx.createRadialGradient(0,0,R*0.88,0,0,R*1.22);
    photon.addColorStop(0,'rgba(255,240,180,0)');
    photon.addColorStop(0.3,'rgba(255,228,150,0.55)');
    photon.addColorStop(0.55,'rgba(255,200,100,0.28)');
    photon.addColorStop(0.8,'rgba(220,160,60,0.10)');
    photon.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(0,0,R*1.22,0,Math.PI*2); ctx.fillStyle=photon; ctx.fill();
    ctx.beginPath(); ctx.arc(0,0,R,0,Math.PI*2); ctx.fillStyle='#000004'; ctx.fill();
    const inner=ctx.createRadialGradient(0,0,R*0.82,0,0,R*1.02);
    inner.addColorStop(0,'rgba(255,240,160,0)');
    inner.addColorStop(0.6,'rgba(255,230,140,0.18)');
    inner.addColorStop(1,'rgba(255,200,80,0)');
    ctx.beginPath(); ctx.arc(0,0,R*1.02,0,Math.PI*2); ctx.fillStyle=inner; ctx.fill();
    ctx.beginPath(); ctx.arc(0,0,R*0.97,0,Math.PI*2); ctx.fillStyle='#000004'; ctx.fill();
    ctx.restore();
  }

  const shooting = []; let lastShoot = 0;
  function maybeShoot(now){
    if(now - lastShoot > 6000 + Math.random()*12000){
      lastShoot = now;
      shooting.push({ x:Math.random()*0.5+0.05, y:Math.random()*0.35, len:60+Math.random()*100, a:1, dx:0.9+Math.random()*0.4, dy:0.25+Math.random()*0.2 });
    }
  }

  let bhX, bhY, bhR;
  function updateBH(){ const W=canvas.width, H=canvas.height; bhR=Math.min(W,H)*0.22; bhX=W*0.78; bhY=H*0.18; }
  updateBH();
  window.addEventListener('resize', updateBH);

  function draw(now){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawBlackHole(bhX,bhY,bhR);
    stars.forEach(s=>{
      s.tw += s.sp;
      const a  = s.basealpha*(0.6+0.4*Math.sin(s.tw));
      const px = s.x*canvas.width, py = s.y*canvas.height;
      if(s.bright){
        ctx.globalAlpha=a*0.15; ctx.strokeStyle=s.color; ctx.lineWidth=0.6;
        ctx.beginPath(); ctx.moveTo(px-s.r*5,py); ctx.lineTo(px+s.r*5,py); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px,py-s.r*5); ctx.lineTo(px,py+s.r*5); ctx.stroke();
        const halo=ctx.createRadialGradient(px,py,0,px,py,s.r*4);
        halo.addColorStop(0,`rgba(255,248,230,${a*0.25})`);
        halo.addColorStop(1,'rgba(255,248,230,0)');
        ctx.globalAlpha=1;
        ctx.beginPath(); ctx.arc(px,py,s.r*4,0,Math.PI*2); ctx.fillStyle=halo; ctx.fill();
      }
      ctx.globalAlpha=a; ctx.fillStyle=s.color;
      ctx.beginPath(); ctx.arc(px,py,s.r,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;
    maybeShoot(now);
    for(let i=shooting.length-1;i>=0;i--){
      const ss=shooting[i];
      ss.x+=ss.dx*0.0008; ss.y+=ss.dy*0.0008; ss.a-=0.012;
      if(ss.a<=0){shooting.splice(i,1);continue;}
      const x1=ss.x*canvas.width, y1=ss.y*canvas.height;
      const x2=x1-ss.dx*ss.len*0.5, y2=y1-ss.dy*ss.len*0.5;
      const g=ctx.createLinearGradient(x1,y1,x2,y2);
      g.addColorStop(0,`rgba(255,248,220,${ss.a})`);
      g.addColorStop(0.3,`rgba(220,200,160,${ss.a*0.5})`);
      g.addColorStop(1,'rgba(220,200,160,0)');
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
      ctx.strokeStyle=g; ctx.lineWidth=1.2; ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

// ==================== SPLASH BLACK HOLE ====================
(function(){
  const sc = document.getElementById('splash-bh');
  if(!sc) return;
  const sx = sc.getContext('2d');
  function rsz(){ sc.width=window.innerWidth; sc.height=window.innerHeight; }
  rsz();
  function drawSplashBH(t){
    const W=sc.width, H=sc.height;
    sx.clearRect(0,0,W,H);
    const cx=W/2, cy=H/2, R=Math.min(W,H)*0.17;
    const lg=sx.createRadialGradient(cx,cy,R*0.9,cx,cy,R*4);
    lg.addColorStop(0,'rgba(200,140,30,0)'); lg.addColorStop(0.15,'rgba(180,120,20,0.06)');
    lg.addColorStop(0.5,'rgba(100,70,15,0.025)'); lg.addColorStop(1,'rgba(0,0,0,0)');
    sx.beginPath(); sx.arc(cx,cy,R*4,0,Math.PI*2); sx.fillStyle=lg; sx.fill();
    sx.save(); sx.translate(cx,cy);
    sx.save(); sx.scale(1,0.26);
    for(let i=18;i>=0;i--){
      const tt=i/18, dr=R*1.05+tt*(R*2.1-R*1.05), lw=(R*2.1-R*1.05)/19+0.4;
      sx.beginPath(); sx.arc(0,0,dr,Math.PI,2*Math.PI);
      sx.strokeStyle=`rgba(${Math.round(190-tt*50)},${Math.round(85-tt*45)},${Math.round(12-tt*8)},${((1-tt)*(1-tt))*0.22})`;
      sx.lineWidth=lw; sx.stroke();
    }
    sx.restore();
    sx.save(); sx.scale(1,0.26);
    const pulse=0.75+0.25*Math.sin(t*0.0018);
    for(let i=28;i>=0;i--){
      const tt=i/28, dr=R*1.05+tt*(R*2.3-R*1.05), lw=(R*2.3-R*1.05)/29+0.7;
      sx.beginPath(); sx.arc(0,0,dr,0,Math.PI);
      const al=((1-tt)*(1-tt))*0.72*pulse;
      sx.strokeStyle=`rgba(${Math.min(255,Math.round(255-tt*25))},${Math.round(195-tt*135)},${Math.round(75-tt*65)},${al})`;
      sx.lineWidth=lw; sx.stroke();
    }
    sx.restore();
    const pr=sx.createRadialGradient(0,0,R*0.9,0,0,R*1.2);
    pr.addColorStop(0,'rgba(255,240,180,0)'); pr.addColorStop(0.35,'rgba(255,228,145,0.6)');
    pr.addColorStop(0.65,'rgba(255,200,95,0.25)'); pr.addColorStop(1,'rgba(0,0,0,0)');
    sx.beginPath(); sx.arc(0,0,R*1.2,0,Math.PI*2); sx.fillStyle=pr; sx.fill();
    sx.beginPath(); sx.arc(0,0,R,0,Math.PI*2); sx.fillStyle='#000004'; sx.fill();
    sx.restore();
  }
  let splashRAF;
  function loop(t){ drawSplashBH(t); splashRAF=requestAnimationFrame(loop); }
  splashRAF = requestAnimationFrame(loop);
  setTimeout(() => { cancelAnimationFrame(splashRAF); }, 2500);
})();
