const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById("spinBtn");
const claimBtn = document.getElementById("claimBtn");
const result = document.getElementById("result");
const showPrizesBtn = document.getElementById("showPrizesBtn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");

// Партнёрский URL
const PARTNER_URL = "https://example.com";

// UID пользователя
const uid = new URLSearchParams(window.location.search).get("uid") || "guest";
const storageKey = "spin_done_" + uid + "_" + navigator.userAgent;

// Проверка участия
if (localStorage.getItem(storageKey)) {
  spinBtn.disabled = true;
  spinBtn.textContent = "Участие завершено";
  result.classList.remove("hidden");
  result.textContent = "ℹ️ Вы уже участвовали в акции.";
}

// Настройки рулетки
const sectors = [
  { color: '#22c55e', text: '🎁 Бонус', prize: '🎁 Бонус для новых пользователей' },
  { color: '#3b82f6', text: '🔥 Подарок', prize: '🔥 Расширенное предложение' },
  { color: '#facc15', text: '🏆 Акция', prize: '🏆 Специальная акция' }
];
const numSectors = sectors.length;
let currentAngle = 0;

// Рисуем колесо
function drawWheel(highlightSector = -1) {
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sectors.forEach((s, i) => {
    const start = (i * 2 * Math.PI) / numSectors;
    const end = ((i + 1) * 2 * Math.PI) / numSectors;
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, start, end);
    ctx.fillStyle = (i === highlightSector) ? lightenColor(s.color, 40) : s.color;
    ctx.fill();
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(start + (end - start)/2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.fillText(s.text, radius - 10, 5);
    ctx.restore();
  });
}

// Лёгкое осветление цвета для подсветки
function lightenColor(color, percent) {
  const f=parseInt(color.slice(1),16),t=percent/100;
  const R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
  return "#" + (0x1000000 + 
      (Math.round((255-R)*t)+R)*0x10000 + 
      (Math.round((255-G)*t)+G)*0x100 + 
      (Math.round((255-B)*t)+B)).toString(16).slice(1);
}

drawWheel();

// Выбор исхода
function pickOutcome() {
  const rand = Math.random() * 100;
  if (rand < 70) return { sector: 0, angle: 60 };
  if (rand < 95) return { sector: 1, angle: 180 };
  return { sector: 2, angle: 300 };
}

// Анимация вращения с подсветкой
function spinWheel(finalAngle, highlightSector, duration = 6000) {
  const start = performance.now();
  const startAngle = currentAngle;

  function animate(time) {
    let progress = (time - start)/duration;
    if (progress > 1) progress = 1;

    const angle = startAngle + (finalAngle - startAngle) * easeOutCubic(progress);
    canvas.style.transform = `rotate(${angle}deg)`;

    // подсветка сектора при вращении
    const sectorIndex = Math.floor(((angle%360)/360)*numSectors);
    drawWheel(sectorIndex);

    if(progress<1) requestAnimationFrame(animate);
    else {
      currentAngle = finalAngle % 360;
      drawWheel(highlightSector);
    }
  }

  requestAnimationFrame(animate);
}

function easeOutCubic(t){return (--t)*t*t+1;}

// Клик «Крутить колесо»
spinBtn.addEventListener("click", () => {
  if(spinBtn.disabled) return;
  spinBtn.disabled = true;

  const outcome = pickOutcome();
  const spins = 5;
  const finalAngle = spins*360 + outcome.angle;

  if(navigator.vibrate) navigator.vibrate([200,100,200]);

  spinWheel(finalAngle, outcome.sector);

  setTimeout(()=>{
    result.textContent = `🎉 ${outcome.prize} — доступно ограниченное время!`;
    result.classList.remove("hidden");
    claimBtn.classList.remove("hidden");
    localStorage.setItem(storageKey,"1");
  },6000);
});

// Кнопка «Забрать бонус»
claimBtn.addEventListener("click",()=>{window.location.href=PARTNER_URL;});

// Модалка «Что может выпасть»
showPrizesBtn.addEventListener("click",()=>{modal.classList.remove("hidden"); document.body.style.overflow='hidden';});
closeModal.addEventListener("click",()=>{modal.classList.add("hidden"); document.body.style.overflow='auto';});
window.addEventListener("click",(e)=>{if(e.target===modal){modal.classList.add("hidden"); document.body.style.overflow='auto';}});
