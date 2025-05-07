let score = 0;
let speed = 1000;
let currentButton = null;
let timeout = null;
let keyBindings = ['A', 'S', 'D', 'F'];
let buttonElements = [];
let audios = [];
let gameActive = false;
let clicksUntilHardMode = 40;

window.onload = () => {
  for (let i = 0; i < 4; i++) {
    buttonElements[i] = document.getElementById('btn' + i);
    audios[i] = document.getElementById('audio' + i);

    buttonElements[i].addEventListener('click', () => {
      handlePress(i);
      if (navigator.vibrate) navigator.vibrate(50);
    });

    buttonElements[i].addEventListener('dblclick', () => {
      let newKey = prompt("Uusi näppäin tälle painikkeelle:", keyBindings[i]);
      if (newKey) {
        keyBindings[i] = newKey.toUpperCase();
        buttonElements[i].dataset.key = keyBindings[i];
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    let key = e.key.toUpperCase();
    let index = keyBindings.indexOf(key);
    if (index !== -1) handlePress(index);
  });

  loadLeaderboard();
};

function startCountdown() {
  document.getElementById('score').innerText = '0';
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('countdown').innerText = "Peli alkaa nyt!";
  document.getElementById('audio-start').play();

  buttonElements.forEach(btn => btn.disabled = true);
  setTimeout(() => {
    document.getElementById('countdown').innerText = "";
    buttonElements.forEach(btn => btn.disabled = false);
    startGame();
  }, 17000);
}

function startGame() {
  gameActive = true;
  score = 0;
  speed = 1000;
  clicksUntilHardMode = Math.floor(30 + Math.random() * 20);
  nextRound();
}

function nextRound() {
  if (!gameActive) return;

  if (timeout) clearTimeout(timeout);
  if (currentButton !== null) {
    buttonElements[currentButton].classList.remove('active');
  }

  currentButton = Math.floor(Math.random() * 4);
  buttonElements[currentButton].classList.add('active');
  audios[currentButton].play();

  let reactionTime = speed;

  if (score > 20 && Math.random() < 0.1) {
    reactionTime = 300;
  }

  timeout = setTimeout(() => {
    endGame();
  }, reactionTime + 200);
}

function handlePress(index) {
  if (!gameActive) return;

  if (index === currentButton) {
    score++;
    document.getElementById('score').innerText = score;

    if (--clicksUntilHardMode <= 0) {
      speed = Math.max(200, speed * 0.95);
    }

    nextRound();
  } else {
    endGame();
  }
}

function endGame() {
  gameActive = false;
  if (timeout) clearTimeout(timeout);
  buttonElements[currentButton]?.classList.remove('active');
  document.getElementById('game-over').style.display = 'block';
  buttonElements.forEach(btn => btn.disabled = true);
  updateLeaderboard(score);
}

function updateLeaderboard(score) {
  let scores = JSON.parse(localStorage.getItem('speden_scores')) || [];
  scores.push(score);
  scores.sort((a, b) => b - a);
  scores = scores.slice(0, 5);
  localStorage.setItem('speden_scores', JSON.stringify(scores));
  loadLeaderboard();
}

function loadLeaderboard() {
  let scores = JSON.parse(localStorage.getItem('speden_scores')) || [];
  let html = "";
  scores.forEach((s, i) => {
    html += `<li>#${i + 1} — ${s} pistettä</li>`;
  });
  document.getElementById('leaderboard').innerHTML = html;
}
