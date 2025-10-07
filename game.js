const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10, paddleHeight = 100;
const ballSize = 12;

const player = {
    x: 0,
    y: canvas.height/2 - paddleHeight/2,
    width: paddleWidth,
    height: paddleHeight,
    color: 'white',
    score: 0
};

const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height/2 - paddleHeight/2,
    width: paddleWidth,
    height: paddleHeight,
    color: 'white',
    score: 0
};

const ball = {
    x: canvas.width/2 - ballSize/2,
    y: canvas.height/2 - ballSize/2,
    size: ballSize,
    speed: 6,
    velocityX: 6 * (Math.random() > 0.5 ? 1 : -1),
    velocityY: 6 * (Math.random() > 0.5 ? 1 : -1),
    color: 'white'
};

// Draw a rectangle (paddle or ball)
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Draw the ball
function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fill();
}

// Draw the net
function drawNet() {
    ctx.fillStyle = "white";
    for (let i = 0; i <= canvas.height; i += 24) {
        ctx.fillRect(canvas.width/2 - 1, i, 2, 12);
    }
}

// Render everything
function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#000"); // Clear
    drawNet();
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawBall(ball.x, ball.y, ball.size, ball.color);

    // Draw Scores
    ctx.font = "40px Arial";
    ctx.fillText(player.score, canvas.width/4, 50);
    ctx.fillText(ai.score, 3*canvas.width/4, 50);
}

// Collision detection
function collision(b, p) {
    return b.x < p.x + p.width &&
           b.x + b.size > p.x &&
           b.y < p.y + p.height &&
           b.y + b.size > p.y;
}

// Reset Ball
function resetBall() {
    ball.x = canvas.width/2 - ball.size/2;
    ball.y = canvas.height/2 - ball.size/2;
    ball.velocityX = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

// Update game state
function update() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Wall collision (top/bottom)
    if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
        ball.velocityY *= -1;
    }

    // Left paddle collision
    if (collision(ball, player)) {
        ball.x = player.x + player.width;
        ball.velocityX *= -1;

        // Add spin based on where the ball hits the paddle
        let collidePoint = (ball.y + ball.size/2) - (player.y + player.height/2);
        collidePoint = collidePoint / (player.height/2);
        let angleRad = collidePoint * (Math.PI/4);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // Right paddle collision
    if (collision(ball, ai)) {
        ball.x = ai.x - ball.size;
        ball.velocityX *= -1;

        let collidePoint = (ball.y + ball.size/2) - (ai.y + ai.height/2);
        collidePoint = collidePoint / (ai.height/2);
        let angleRad = collidePoint * (Math.PI/4);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // Score update
    if (ball.x < 0) {
        ai.score++;
        resetBall();
    }
    if (ball.x + ball.size > canvas.width) {
        player.score++;
        resetBall();
    }

    // AI movement (simple)
    let aiCenter = ai.y + ai.height/2;
    let ballCenter = ball.y + ball.size/2;
    if (aiCenter < ballCenter - 20) {
        ai.y += 6;
    } else if (aiCenter > ballCenter + 20) {
        ai.y -= 6;
    }

    // Clamp AI paddle
    ai.y = Math.max(Math.min(ai.y, canvas.height - ai.height), 0);
}

// Player paddle follows mouse Y
canvas.addEventListener('mousemove', function(evt) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height/2;
    // Clamp
    player.y = Math.max(Math.min(player.y, canvas.height - player.height), 0);
});

// Main game loop
function game() {
    update();
    render();
    requestAnimationFrame(game);
}

// Start game
resetBall();
game();