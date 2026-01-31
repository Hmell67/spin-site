// Элементы
const spinBtn = document.getElementById("spinBtn");
const wheel = document.getElementById("wheel");
const result = document.getElementById("result");
const claimBtn = document.getElementById("claimBtn");

// Партнёрский URL (замени на свою рефку)
const PARTNER_URL = "https://example.com";

// Уникальный ID пользователя из URL (Telegram user_id)
const uid = new URLSearchParams(window.location.search).get("uid") || "guest";
const storageKey = "spin_done_" + uid + "_" + navigator.userAgent;

// Проверка участия
if (localStorage.getItem(storageKey)) {
  spinBtn.disabled = true;
  spinBtn.textContent = "Участие завершено";
  result.classList.remove("hidden");
  result.textContent = "ℹ️ Вы уже участвовали в акции.";
}

// Выбор исхода рулетки
function pickOutcome() {
  const rand = Math.random() * 100;
  if (rand < 70) return { text: "🎁 Бонус от партнёра", angle: 75 };
  if (rand < 95) return { text: "🔥 Расширенное предложение", angle: 195 };
  return { text: "🏆 Специальная акция", angle: 315 };
}

// Клик по кнопке «Получить бонус»
spinBtn.addEventListener("click", () => {
  if (spinBtn.disabled) return;
  spinBtn.disabled = true;

  const outcome = pickOutcome();
  const spins = 5; // количество оборотов
  const finalAngle = spins * 360 + outcome.angle;

  // Псевдо-анимация (мобильная вибрация)
  if (navigator.vibrate) navigator.vibrate([200,100,200]);

  wheel.style.transform = `rotate(${finalAngle}deg)`;

  // Через 6 секунд показываем результат
  setTimeout(() => {
    result.textContent = outcome.text + "\nАкция активна ограниченное время.";
    result.classList.remove("hidden");
    claimBtn.classList.remove("hidden");
    localStorage.setItem(storageKey, "1");
  }, 6000);
});

// Клик по кнопке «Перейти к акции»
claimBtn.addEventListener("click", () => {
  window.location.href = PARTNER_URL;
});
