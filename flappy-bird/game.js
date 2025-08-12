const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const retryBtn = document.getElementById('retryBtn');

let bird;
let pipes = [];
let score = 0;
let gameOver = false;
let frameCount = 0;

// 画面基准宽高比例，用于缩放
const BASE_WIDTH = 400;
const BASE_HEIGHT = 600;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // 重新计算 bird 基于画布大小的位置和大小
  bird = {
    x: canvas.width * 0.125, // 50 / 400 = 0.125
    y: canvas.height * 0.25, // 150 / 600 = 0.25
    width: canvas.width * 0.075,  // 30 / 400 = 0.075
    height: canvas.height * 0.05, // 30 / 600 = 0.05
    velocity: 0,
    gravity: canvas.height * 0.00083,  // 0.5 / 600 ≈ 0.00083
    jumpPower: -canvas.height * 0.0133, // -8 / 600 ≈ -0.0133
  };
  pipes = [];
  score = 0;
  gameOver = false;
  frameCount = 0;
  retryBtn.style.display = 'none';
}

// 绘制小鸟
function drawBird() {
  ctx.fillStyle = 'yellow';
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

// 绘制水管
function drawPipes() {
  ctx.fillStyle = 'green';
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
  });
}

// 更新小鸟位置
function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver = true;
  }
}

// 更新水管位置和碰撞检测
function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= canvas.width * 0.005; // 2 / 400 = 0.005 的速度基准，随屏幕宽度变化

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

// 生成水管
function spawnPipe() {
  const gap = canvas.height * 0.25; // 150 / 600 = 0.25
  const top = Math.random() * (canvas.height - gap - canvas.height * 0.1667) + canvas.height * 0.0833;
  // 上面：50/600=0.0833 100/600=0.1667
  const pipe = {
    x: canvas.width,
    width: canvas.width * 0.125, // 50 / 400 = 0.125
    top: top,
    bottomY: top + gap,
    scored: false
  };
  pipes.push(pipe);
}

// 绘制分数
function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = `${Math.floor(canvas.height * 0.04)}px sans-serif`; // 24px 基准调整
  ctx.fillText(`Score: ${score}`, canvas.width * 0.025, canvas.height * 0.05);
}

// 游戏主循环
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

// 控制跳跃（键盘和触屏）
function jump() {
  if (!gameOver) {
    bird.velocity = bird.jumpPower;
  }
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    jump();
  }
});

document.addEventListener('touchstart', e => {
  e.preventDefault(); // 防止页面滚动
  jump();
}, { passive: false });

retryBtn.addEventListener('click', () => {
  resizeCanvas();
  loop();
});

// 初始化
resizeCanvas();
loop();

window.addEventListener('resize', () => {
  resizeCanvas();
});
