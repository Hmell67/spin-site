if (localStorage.getItem(storageKey)) {
  spinBtn.disabled = true;
  spinBtn.textContent = "Участие завершено";
}

const spinBtn = document.getElementById("spinBtn");
const wheel = document.getElementById("wheel");
const result = document.getElementById("result");
const claimBtn = document.getElementById("claimBtn");

const PARTNER_URL = "https://example.com"; // ← ТУТ ПОТОМ ВСТАВИШЬ РЕФКУ

const uid = new URLSearchParams(window.location.search).get("uid") || "guest";
const storageKey = "spin_done_" + uid + "_" + navigator.userAgent;


if (localStorage.getItem(storageKey)) {
  spinBtn.disabled = true;
  result.classList.remove("hidden");
  result.textContent = "ℹ️ Вы уже участвовали в акции.";
}

function pickOutcome() {
  const rand = Math.random() * 100;
  if (rand < 70) return { text: "🎁 Бонус от партнёра", angle: 75 };
  if (rand < 95) return { text: "🔥 Расширенное предложение", angle: 195 };
  return { text: "🏆 Специальная акция", angle: 315 };

}

spinBtn.addEventListener("click", () => {
  if (localStorage.getItem(storageKey)) return;

  spinBtn.disabled = true;

  const outcome = pickOutcome();
  const spins = 5;
  const finalAngle = spins * 360 + outcome.angle;

  wheel.style.transform = `rotate(${finalAngle}deg)`;

  setTimeout(() => {
    result.textContent = outcome.text;
    result.classList.remove("hidden");
    claimBtn.classList.remove("hidden");
    localStorage.setItem(storageKey, "1");
  }, 6000);
});

claimBtn.addEventListener("click", () => {
  window.location.href = PARTNER_URL;
});
