const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById("spinBtn");
const claimBtn = document.getElementById("claimBtn");
const result = document.getElementById("result");
const showPrizesBtn = document.getElementById("showPrizesBtn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const overlay = modal.querySelector(".modal-overlay");

const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

// Партнёрский URL
const PARTNER_URL = "https://example.com";

// Проверка локального хранения
const uid = new URLSearchParams(window.location.search).get("uid") || "guest";
const storageKey = "spin_done_" + uid + "_" + navigator.userAgent;
if(localStorage.getItem(storageKey)){
  spinBtn.disabled = true;
  spinBtn.textContent = "Участие завершено";
  result.classList.remove("hidden");
  result.textContent = "ℹ️ Вы уже участвовали в акции.";
}

// Секторы
const sectors = [
  { color:'#22c55e', text:'Telegram Premium', prize:'🟦 Telegram Premium' },
  { color:'#3b82f6', text:'Telegram Stars', prize:'⭐ Telegram Звезды' },
  { color:'#fbbf24', text:'Фрибет 1000₽', prize:'💵 Фрибет 1000₽' },
  { color:'#f87171', text:'Секретный бонус', prize:'🔒 Секретный бонус' },
  { color:'#a78bfa', text:'50 фриспинов', prize:'🎰 50 фриспинов' }
];
const numSectors = sectors.length;
let currentAngle = 0;

// Draw wheel
function drawWheel(highlight=-1){
  const radius = canvas.width/2;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  sectors.forEach((s,i)=>{
    const start = (i*2*Math.PI)/numSectors;
    const end = ((i+1)*2*Math.PI)/numSectors;
    ctx.beginPath();
    ctx.moveTo(radius,radius);
    ctx.arc(radius,radius,radius,start,end);
    ctx.fillStyle = (i===highlight)?lightenColor(s.color,40):s.color;
    ctx.fill();
    // Draw text/icon
    ctx.save();
    ctx.translate(radius,radius);
    ctx.rotate(start+(end-start)/2);
    ctx.textAlign="right";
    ctx.fillStyle="#fff";
    ctx.font="18px Arial";
    ctx.fillText(s.prize,radius-10,5);
    ctx.restore();
  });
}

function lightenColor(color, percent){
  const f=parseInt(color.slice(1),16),t=percent/100;
  const R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
  return "#"+(0x1000000 + (Math.round((255-R)*t)+R)*0x10000 + (Math.round((255-G)*t)+G)*0x100 + (Math.round((255-B)*t)+B)).toString(16).slice(1);
}

drawWheel();

// Pick outcome
function pickOutcome(){
  const rand = Math.random()*100;
  if(rand<20) return {sector:0,angle:60};
  if(rand<40) return {sector:1,angle:132};
  if(rand<60) return {sector:2,angle:204};
  if(rand<80) return {sector:3,angle:276};
  return {sector:4,angle:348};
}

// Spin animation
function spinWheel(finalAngle, highlight, duration=6000){
  const start = performance.now();
  const startAngle = currentAngle;
  function animate(time){
    let progress = (time-start)/duration;
    if(progress>1) progress=1;
    const angle = startAngle + (finalAngle-startAngle)*easeOutCubic(progress);
    canvas.style.transform = `rotate(${angle}deg)`;
    const sectorIndex = Math.floor(((angle%360)/360)*numSectors);
    drawWheel(sectorIndex);
    if(progress<1) requestAnimationFrame(animate);
    else { currentAngle = finalAngle%360; drawWheel(highlight); runConfetti(); }
  }
  requestAnimationFrame(animate);
}

function easeOutCubic(t){ return (--t)*t*t+1; }

// Spin click
spinBtn.addEventListener("click", ()=>{
  if(spinBtn.disabled) return;
  spinBtn.disabled=true;

  const outcome = pickOutcome();
  const spins=6;
  const finalAngle = spins*360 + outcome.angle;

  spinWheel(finalAngle,outcome.sector);

  setTimeout(()=>{
    result.textContent = `🎉 Вы выиграли: ${sectors[outcome.sector].prize}`;
    result.classList.remove("hidden");
    claimBtn.classList.remove("hidden");
    localStorage.setItem(storageKey,"1");
  }, 6000);
});

// Claim bonus
claimBtn.addEventListener("click",()=>{ window.location.href = PARTNER_URL; });

// Modal
showPrizesBtn.addEventListener("click",()=>{ modal.classList.remove("hidden"); document.body.style.overflow='hidden'; });
closeModal.addEventListener("click",()=>{ modal.classList.add("hidden"); document.body.style.overflow='auto'; });
overlay.addEventListener("click",()=>{ modal.classList.add("hidden"); document.body.style.overflow='auto'; });

// Confetti
let confettiParticles = [];
function runConfetti(){
  confettiParticles = [];
  for(let i=0;i<100;i++){
    confettiParticles.push({
      x: Math.random()*confettiCanvas.width,
      y: Math.random()*confettiCanvas.height - confettiCanvas.height,
      r: Math.random()*6+4,
      d: Math.random()*10+5,
      color: `hsl(${Math.random()*360}, 100%, 50%)`,
      tilt: Math.random()*10-5,
      tiltAngleIncrement: 0.05 + Math.random()/10
    });
  }
  animateConfetti();
}

function animateConfetti(){
  confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach((p,i)=>{
    p.tilt += p.tiltAngleIncrement;
    p.y += Math.sin(p.tilt)*2 + 2;
    p.x += Math.sin(p.tilt/2);
    confettiCtx.beginPath();
    confettiCtx.moveTo(p.x + p.tilt + p.r/2, p.y);
    confettiCtx.lineTo(p.x + p.tilt, p.y + p.r);
    confettiCtx.strokeStyle = p.color;
    confettiCtx.lineWidth = p.r/2;
    confettiCtx.stroke();
    if(p.y>confettiCanvas.height) { confettiParticles.splice(i,1); }
  });
  if(confettiParticles.length>0) requestAnimationFrame(animateConfetti);
}
