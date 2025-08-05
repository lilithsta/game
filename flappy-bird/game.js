const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const retryBtn = document.getElementById('retryBtn');

let bird = {
  x: 50,
  y: 150,
  width: 30,
  height: 30,
  velocity: 0,
  gravity: 0.5,
  jumpPower: -8,
};

let pipes = [];
let score = 0;
let gameOver = false;
let frameCount = 0;

function drawBird() {
  ctx.fillStyle = 'yellow';
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
  ctx.fillStyle = 'green';
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
  });
}

function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver = true;
  }
}

function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= 2;

    if (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.bottomY)
    ) {
      gameOver = true;
    }

    if (!pipe.scored && pipe.x + pipe.width < bird.x) {
      score++;
      pipe.scored = true;
    }
  });

  pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

function spawnPipe() {
  const gap = 150;
  const top = Math.random() * (canvas.height - gap - 100) + 50;
  const pipe = {
    x: canvas.width,
    width: 50,
    top: top,
    bottomY: top + gap,
    scored: false
  };
  pipes.push(pipe);
}

function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '24px sans-serif';
  ctx.fillText(`Score: ${score}`, 10, 30);
}

function loop() {
  if (gameOver) {
    ctx.fillStyle = 'black';
    ctx.font = '36px sans-serif';
    ctx.fillText('Game Over!', 100, canvas.height / 2);
    retryBtn.style.display = 'block';
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateBird();
  updatePipes();

  if (frameCount % 90 === 0) {
    spawnPipe();
  }

  drawBird();
  drawPipes();
  drawScore();

  frameCount++;
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', () => {
  bird.velocity = bird.jumpPower;
});

retryBtn.addEventListener('click', () => {
  bird.y = 150;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
  gameOver = false;

  retryBtn.style.display = 'none';
  loop();
});

loop();
