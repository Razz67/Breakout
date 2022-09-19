const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Add Border
canvas.style.border = "1px solid #0ff";
let canvasMinX = 0;
let canvasMaxX = 400;
const WIDTH = window.innerWidth;
// GAME VARIABLES AND CONSTANTS
const paddleWidth = 100;
const PADDLE_MARGIN_BOTTOM = 50;
const paddleHeight = 20;
const BALL_RADIUS = 8;
let LIFE = 3; // PLAYER HAS 3 LIVES
let SCORE = 0;
const scoreUnit = 10;
let LEVEL = 1;
const MAX_LEVEL = 3;
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;
ctx.lineWidth = 3;


// CREATE THE PADDLE
const paddle = {
	x: canvas.width / 2 - paddleWidth / 2,
	y: canvas.height - PADDLE_MARGIN_BOTTOM - paddleHeight,
	width: paddleWidth,
	height: paddleHeight,
	dx: 5,
};

// DRAW PADDLE
function drawPaddle() {
	ctx.fillStyle = "#2e3548";
	ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

	ctx.strokeStyle = "#ffcd05";
	ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// CONTROL THE PADDLE WITH ARROW KEYS
document.addEventListener("keydown", function (event) {
	if (event.key == 37) {
		leftArrow = true;
	} else if (event.key == 39) {
		rightArrow = true;
	}
});
document.addEventListener("keyup", function (event) {
	if (event.key == 37) {
		leftArrow = false;
	} else if (event.key == 39) {
		rightArrow = false;
	}
});


document.addEventListener("mousemove", onMouseMove);

// MOVE PADDLE
function movePaddle() {
	if (rightArrow && paddle.x + paddle.width < canvas.width) {
		paddle.x += paddle.dx;
	} else if (leftArrow && paddle.x > 0) {
		paddle.x -= paddle.dx;
	}
}

// Control paddle with mouse
function onMouseMove(evt) {
    if (evt.clientX > canvasMinX && evt.clientX < canvasMaxX) {
      paddle.x = Math.max(evt.clientX - canvasMinX - (paddleWidth / 2), 0);
      paddle.x = Math.min(WIDTH - paddleWidth, paddle.x);
    }
} 



// CREATE THE BALL
const ball = {
	x: canvas.width / 2,
	y: paddle.y - BALL_RADIUS,
	radius: BALL_RADIUS,
	speed: 4,
	dx: 3 * (Math.random() * 2 - 1),
	dy: -3,
};

// DRAW THE BALL
function drawBall() {
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
	ctx.fillStyle = "#ffcd05";
	ctx.fill();
	ctx.strokeStyle = "#2e3548";
	ctx.stroke();
	ctx.closePath();
}

// MOVE THE BALL
function moveBall() {
	ball.x += ball.dx;
	ball.y += ball.dy;
}

// BALL AND WALL COLLISION DETECTION
function ballWallCollision() {
	if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
		ball.dx = -ball.dx;
		wallHit.play();
	}

	if (ball.y - ball.radius < 0) {
		ball.dy = -ball.dy;
		wallHit.play();
	}

	if (ball.y + ball.radius > canvas.height) {
		LIFE--; // LOSE LIFE
		lifeLost.play();
		resetBall();
	}
}

// RESET THE BALL
function resetBall() {
	ball.x = canvas.width / 2;
	ball.y = paddle.y - BALL_RADIUS;
	ball.dx = 3 * (Math.random() * 2 - 1);
	ball.dy = -3;
}

// BALL AND PADDLE COLLISION
function ballPaddleCollision() {
	if (
		ball.x < paddle.x + paddle.width &&
		ball.x > paddle.x &&
		paddle.y < paddle.y + paddle.height &&
		ball.y > paddle.y
	) {
		// PLAY SOUND
		paddleHit.play();

		// CHECK WHERE THE BALL HIT THE PADDLE
		let collidePoint = ball.x - (paddle.x + paddle.width / 2);

		// NORMALIZE THE VALUES
		collidePoint = collidePoint / (paddle.width / 2);

		// CALCULATE THE ANGLE OF THE BALL
		let angle = (collidePoint * Math.PI) / 3;

		ball.dx = ball.speed * Math.sin(angle);
		ball.dy = -ball.speed * Math.cos(angle);
	}
}

// CREATE THE BRICKS
const brick = {
	row: 1,
	column: 5,
	width: 55,
	height: 20,
	offSetLeft: 20,
	offSetTop: 20,
	marginTop: 40,
	fillColor: "#2e3548",
	strokeColor: "#FFF",
};

let bricks = [];

function createBricks() {
	for (let r = 0; r < brick.row; r++) {
		bricks[r] = [];
		for (let c = 0; c < brick.column; c++) {
			bricks[r][c] = {
				x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
				y:
					r * (brick.offSetTop + brick.height) +
					brick.offSetTop +
					brick.marginTop,
				status: true,
			};
		}
	}
}

createBricks();

// draw the bricks
function drawBricks() {
	for (let r = 0; r < brick.row; r++) {
		for (let c = 0; c < brick.column; c++) {
			let b = bricks[r][c];
			// if the brick isn't broken
			if (b.status) {
				ctx.fillStyle = brick.fillColor;
				ctx.fillRect(b.x, b.y, brick.width, brick.height);

				ctx.strokeStyle = brick.strokeColor;
				ctx.strokeRect(b.x, b.y, brick.width, brick.height);
			}
		}
	}
}

// ball brick collision
function ballBrickCollision() {
	for (let r = 0; r < brick.row; r++) {
		for (let c = 0; c < brick.column; c++) {
			let b = bricks[r][c];
			// if the brick isn't broken
			if (b.status) {
				if (
					ball.x + ball.radius > b.x &&
					ball.x - ball.radius < b.x + brick.width &&
					ball.y + ball.radius > b.y &&
					ball.y - ball.radius < b.y + brick.height
				) {
					brickHit.play();
					ball.dy = -ball.dy;
					b.status = false; // the brick is broken
					SCORE += scoreUnit;
				}
			}
		}
	}
}

// show game stats
function showGameStats(text, textX, textY, img, imgX, imgY) {
	// draw text
	ctx.fillStyle = "#FFF";
	ctx.font = "25px Germania One";
	ctx.fillText(text, textX, textY);

	// draw image
	ctx.drawImage(img, imgX, imgY, (width = 25), (height = 25));
}

// DRAW FUNCTION
function draw() {
	drawPaddle();
	drawBall();
	drawBricks();

	showGameStats(SCORE, 35, 25, scoreImg, 5, 5); // score
	showGameStats(LIFE, canvas.width - 25, 25, lifeImg, canvas.width - 55, 5); // lives
	showGameStats(LEVEL, canvas.width / 2, 25, levelImg, canvas.width / 2 - 30, 5); // level
}

// game over function
function gameOver() {
	if (LIFE <= 0) {
		showYouLose();
		GAME_OVER = true;
	}
}

// Next level function
function levelUp() {
	let isLevelDone = true;

	// If all the bricks are broken
	for (let r = 0; r < brick.row; r++) {
		for (let c = 0; c < brick.column; c++) {
			isLevelDone = isLevelDone && !bricks[r][c].status;
		}
	}

	if (isLevelDone) {
		win.play();

		if (LEVEL >= MAX_LEVEL) {
			showYouwin();
			GAME_OVER = true;
			return;
		}
		brick.row++;
		createBricks();
		ball.speed += 0.5;
		resetBall();
		LEVEL++;
	}
}

// UPDATE GAME FUNCTION
function update() {
	movePaddle();
	moveBall();
	ballWallCollision();
	ballPaddleCollision();
	ballBrickCollision();
	gameOver();
	levelUp();
}

// GAME LOOP
function loop() {
	// CLEAR THE CANVAS
	ctx.drawImage(backgroundImg, 0, 0);
	draw();
	update();
	if (!GAME_OVER) {
		requestAnimationFrame(loop);
	}
}

loop();

// Sounds
const soundElement = document.getElementById("sound");

soundElement.addEventListener("click", audioManager); // turn sound on/off

function audioManager() {
	let imgSrc = soundElement.getAttribute("src"); // change the sound image when clicked
	let SOUND_IMG =	imgSrc == "img/sound.png" ? "img/no-sound.png" : "images/sound.png";

	soundElement.setAttribute("src", SOUND_IMG);

	// MUTE AND UNMUTE SOUNDS
	wallHit.muted = wallHit.muted ? false : true;
	paddleHit.muted = paddleHit.muted ? false : true;
	brickHit.muted = brickHit.muted ? false : true;
	win.muted = win.muted ? false : true;
	lifeLost.muted = lifeLost.muted ? false : true;
}

// GAME OVER MESSAGE
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

// PLAY AGAIN BUTTON
restart.addEventListener("click", function () {
	location.reload(); // reload the page
});

// YOU win
function showYouwin() {
	gameover.style.display = "block";
	youwon.style.display = "block";
}

// YOU LOSE
function showYouLose() {
	gameover.style.display = "block";
	youlose.style.display = "block";
}
