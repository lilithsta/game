const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const retryBtn = document.getElementById('retryBtn');

let bird;
let pipes = [];
let score = 0;
let gameOver = false;
let frameCount = 0;

// 基准画布尺寸比例
const BASE_WIDTH = 400;
const BASE_HEIGHT = 600;

function resizeCanvas() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const baseRatio = BASE_WIDTH / BASE_HEIGHT; // 0.6667
  const windowRatio = windowWidth / windowHeight;

  if (windowRatio < baseRatio) {
    // 窄屏（手机），按宽度撑满，高度自适应
    canvas.width = windowWidth;
    canvas.height = windowWidth / baseRatio;
  } else {
    // 宽屏（PC），按高度撑满，宽度自适应
    canvas.height = windowHeight;
    canvas.width = windowHeight * baseRatio;
  }

  bird = {
    x: canvas.width * 0.125,
    y: canvas.height * 0.25,
    width: canvas.width * 0.075,
    height: canvas.height * 0.05,
    velocity: 0,
    gravity: canvas.height * 0.00083,
    jumpPower: -canvas.height * 0.0133,
  };
  pipes = [];
  score = 0;
  gameOver = false;
  frameCount = 0;
  retryBtn.style.display = 'none';
}

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
    pipe.x -= canvas.width * 0.005;

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
  const gap = canvas.height * 0.25;
  const top = Math.random() * (canvas.height - gap - canvas.height * 0.1667) + canvas.height * 0.0833;
  const pipe = {
    x: canvas.width,
    width: canvas.width * 0.125,
    top: top,
    bottomY: top + gap,
    scored: false
  };
  pipes.push(pipe);
}

function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = `${Math.floor(canvas.height * 0.04)}px sans-serif`;
  ctx.fillText(`Score: ${score}`, canvas.width * 0.025, canvas.height * 0.05);
}

function loop() {
  if (gameOver) {
    ctx.fillStyle = 'black';
    ctx.font = `${Math.floor(canvas.height * 0.06)}px sans-serif`;
    ctx.fillText('Game Over!', canvas.width * 0.25, canvas.height / 2);
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

function jump() {
  if (!gameOver) {
    bird.velocity = bird.jumpPower;
  }
}

// 键盘跳跃（空格和上箭头）
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    jump();
  }
});

// 触摸屏跳跃（手机）
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  jump();
}, { passive: false });

// 鼠标点击跳跃（PC）
canvas.addEventListener('mousedown', e => {
  jump();
});

retryBtn.addEventListener('click', () => {
  resizeCanvas();
  loop();
});

resizeCanvas();
loop();

window.addEventListener('resize', () => {
  resizeCanvas();
});
