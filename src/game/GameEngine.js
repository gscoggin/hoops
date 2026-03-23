import { Ball } from './Ball.js';
import { Player } from './Player.js';
import { Court } from './Court.js';

const GAME_DURATION  = 120; // seconds
const SCORED_PAUSE   = 1.2; // seconds to show "scored" before jump ball
const BLOCK_RANGE    = 65;  // px — max distance for a block/steal

// Game states
const STATE = {
  COUNTDOWN: 'countdown', // 3-second tip-off countdown (game start only)
  JUMPBALL:  'jumpball',  // ball tossed in air, players grab it
  PLAYING:   'playing',   // normal gameplay
  SCORED:    'scored',    // brief pause after a basket
};

export class GameEngine {
  constructor(canvas, player1Data, player2Data, onScore, onGameEnd) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this.onScore   = onScore;
    this.onGameEnd = onGameEnd;

    this.court   = new Court(canvas);
    this.floorY  = this.court.floorY;

    this.score    = { 1: 0, 2: 0 };
    this.timeLeft = GAME_DURATION;
    this.running  = false;
    this.animId   = null;
    this.lastTime = null;

    this.keys = {};

    // State machine
    this.gameState      = STATE.COUNTDOWN;
    this.countdownTimer = 3.5; // counts from 3.5 → 0; ball launches at 0
    this.scoredTimer    = 0;
    this.scoredText     = '';
    this.scoreEffect    = null; // floating score label

    // Players
    this.p1 = new Player(1, player1Data, 'left',  180,                  this.floorY);
    this.p2 = new Player(2, player2Data, 'right', canvas.width - 220,  this.floorY);

    // Ball — starts at center, not in play yet (countdown)
    this.ball = new Ball(canvas.width / 2, this.floorY - 20);

    this._bindKeys();
  }

  // ── Key bindings ──────────────────────────────────────────────────────────

  _bindKeys() {
    this._onKeyDown = (e) => {
      this.keys[e.code] = true;
      e.preventDefault();

      if (this.gameState !== STATE.PLAYING && this.gameState !== STATE.JUMPBALL) return;

      // P1 shoot
      if (e.code === 'Space' && this.p1.hasBall && !this.p1.isCharging) {
        this.p1.startCharge();
      }
      // P2 shoot
      if (e.code === 'Enter' && this.p2.hasBall && !this.p2.isCharging) {
        this.p2.startCharge();
      }
      // P1 block (F key)
      if (e.code === 'KeyF') this.p1.tryBlock();
      // P2 block (Right Shift)
      if (e.code === 'ShiftRight') this.p2.tryBlock();
    };

    this._onKeyUp = (e) => {
      this.keys[e.code] = false;

      if (this.gameState !== STATE.PLAYING) return;

      // P1 release shoot
      if (e.code === 'Space' && this.p1.isCharging) {
        const shot = this.p1.releaseShoot(this.court.rightHoop.x, this.court.rightHoop.y);
        if (shot) {
          this.ball.x = this.p1.x + this.p1.width / 2;
          this.ball.y = this.p1.y + 10;
          this.ball.shoot(shot.vx, shot.vy);
        }
      }
      // P2 release shoot
      if (e.code === 'Enter' && this.p2.isCharging) {
        const shot = this.p2.releaseShoot(this.court.leftHoop.x, this.court.leftHoop.y);
        if (shot) {
          this.ball.x = this.p2.x + this.p2.width / 2;
          this.ball.y = this.p2.y + 10;
          this.ball.shoot(shot.vx, shot.vy);
        }
      }
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
  }

  _unbindKeys() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
  }

  // ── Input handling ────────────────────────────────────────────────────────

  _handleInput() {
    // P1: WASD
    if      (this.keys['KeyA']) this.p1.moveLeft();
    else if (this.keys['KeyD']) this.p1.moveRight();
    else                        this.p1.stopHorizontal();
    if (this.keys['KeyW']) this.p1.jump();

    // P2: Arrow keys
    if      (this.keys['ArrowLeft'])  this.p2.moveLeft();
    else if (this.keys['ArrowRight']) this.p2.moveRight();
    else                              this.p2.stopHorizontal();
    if (this.keys['ArrowUp']) this.p2.jump();
  }

  // ── Jump ball ─────────────────────────────────────────────────────────────

  _launchJumpBall() {
    this.ball.x        = this.canvas.width / 2;
    this.ball.y        = this.floorY - 20;
    this.ball.vx       = 0;
    this.ball.vy       = -12; // strong upward toss — peaks well above hoops
    this.ball.inFlight = true;
    this.ball.isJumpBall = true;
    this.ball.owner    = null;
    this.ball.scored   = false;
    this.ball.trail    = [];
    this.p1.hasBall    = false;
    this.p2.hasBall    = false;
    this.p1.isCharging = false;
    this.p2.isCharging = false;
  }

  // ── Ball interaction ──────────────────────────────────────────────────────

  _pickUpBall(player) {
    if (this.ball.owner !== null) return;
    // During a shot, neither player can pick up the ball
    if (this.ball.inFlight && !this.ball.isJumpBall) return;

    const px = player.x + player.width  / 2;
    const py = player.y + player.height / 2;
    const dx = this.ball.x - px;
    const dy = this.ball.y - py;
    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      player.hasBall       = true;
      this.ball.owner      = player.id;
      this.ball.inFlight   = false;
      this.ball.isJumpBall = false;
    }
  }

  _attachBallToHolder() {
    if (this.ball.owner === 1 && this.p1.hasBall) {
      this.ball.x = this.p1.x + this.p1.width  / 2 + (this.p1.facingRight ? 14 : -14);
      this.ball.y = this.p1.y + 22;
    } else if (this.ball.owner === 2 && this.p2.hasBall) {
      this.ball.x = this.p2.x + this.p2.width  / 2 + (this.p2.facingRight ? 14 : -14);
      this.ball.y = this.p2.y + 22;
    }
  }

  // ── Block logic ───────────────────────────────────────────────────────────

  _checkBlock(blocker, other) {
    if (!blocker.isBlocking) return;

    const bx = blocker.x + blocker.width  / 2;
    const by = blocker.y + blocker.height / 2;

    // Block a ball in flight
    if (this.ball.inFlight && !this.ball.isJumpBall) {
      const dx   = this.ball.x - bx;
      const dy   = this.ball.y - by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < BLOCK_RANGE) {
        // Knock ball downward and slow it laterally
        this.ball.vy  = Math.abs(this.ball.vy) * 0.8 + 2;
        this.ball.vx *= 0.25;
        this.ball.vx += (Math.random() - 0.5) * 3;
        blocker.blockTimer = 0; // consume block window
      }
    }

    // Knock ball out of opponent's hands (steal)
    if (other.hasBall) {
      const ox   = other.x + other.width  / 2;
      const oy   = other.y + other.height / 2;
      const dx   = ox - bx;
      const dy   = oy - by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 48) {
        other.hasBall    = false;
        other.isCharging = false;
        this.ball.owner  = null;
        // Knock ball away from the blocker's side
        this.ball.vx = (blocker.side === 'left' ? 1 : -1) * (2 + Math.random() * 3);
        this.ball.vy = -4;
        this.ball.inFlight = true;
        blocker.blockTimer = 0;
      }
    }
  }

  // ── Scoring ───────────────────────────────────────────────────────────────

  _checkScore() {
    if (!this.ball.inFlight || this.ball.isJumpBall) return;
    const scorer = this.court.checkScore(this.ball);
    if (!scorer) return;

    this.score[scorer] += 2;
    this.onScore({ ...this.score });

    // Floating score label at the hoop
    const hoop = scorer === 1 ? this.court.rightHoop : this.court.leftHoop;
    this.scoreEffect = { text: `+2`, x: hoop.x, y: hoop.y - 30, alpha: 1, timer: 70 };

    // Brief pause then jump ball
    this.scoredText  = `PLAYER ${scorer} SCORES! +2`;
    this.scoredTimer = SCORED_PAUSE;
    this.gameState   = STATE.SCORED;

    // Clear ball immediately so it doesn't re-score
    this.ball.inFlight = false;
    this.ball.owner    = null;
    this.p1.hasBall    = false;
    this.p2.hasBall    = false;
  }

  // ── Game loop ─────────────────────────────────────────────────────────────

  start() {
    this.running  = true;
    this.lastTime = performance.now();
    this._loop(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    this._unbindKeys();
  }

  _loop(timestamp) {
    if (!this.running) return;
    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap delta
    this.lastTime = timestamp;

    this._update(delta);
    this._draw();

    this.animId = requestAnimationFrame((t) => this._loop(t));
  }

  _update(delta) {
    // ── Countdown (game start) ────────────────────────────────────────────
    if (this.gameState === STATE.COUNTDOWN) {
      this.countdownTimer -= delta;
      if (this.countdownTimer <= 0) {
        this.gameState = STATE.JUMPBALL;
        this._launchJumpBall();
      }
      return; // players frozen during countdown
    }

    // ── Scored pause ──────────────────────────────────────────────────────
    if (this.gameState === STATE.SCORED) {
      this.scoredTimer -= delta;
      if (this.scoredTimer <= 0) {
        this.gameState = STATE.JUMPBALL;
        this._launchJumpBall();
      }
      return; // players frozen during scored pause
    }

    // ── Timer (only ticks during jumpball + playing) ──────────────────────
    this.timeLeft = Math.max(0, this.timeLeft - delta);
    if (this.timeLeft <= 0) {
      this.stop();
      this.onGameEnd({ ...this.score });
      return;
    }

    // ── Player input + physics ────────────────────────────────────────────
    this._handleInput();

    const bounds = { left: 0, right: this.canvas.width };
    this.p1.update(this.canvas.width, this.floorY, bounds);
    this.p2.update(this.canvas.width, this.floorY, bounds);

    // Block checks
    this._checkBlock(this.p1, this.p2);
    this._checkBlock(this.p2, this.p1);

    // Ball pickup
    this._pickUpBall(this.p1);
    this._pickUpBall(this.p2);
    if (!this.ball.inFlight) this._attachBallToHolder();

    this.ball.update(this.canvas.width, this.floorY);

    // Jump ball → playing transition
    if (this.gameState === STATE.JUMPBALL && this.ball.owner !== null) {
      this.gameState = STATE.PLAYING;
    }

    // Score check only during playing
    if (this.gameState === STATE.PLAYING) this._checkScore();

    // Score effect float
    if (this.scoreEffect) {
      this.scoreEffect.timer--;
      this.scoreEffect.y    -= 0.6;
      this.scoreEffect.alpha = this.scoreEffect.timer / 70;
      if (this.scoreEffect.timer <= 0) this.scoreEffect = null;
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────────────

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.court.draw(ctx);
    this.p1.draw(ctx);
    this.p2.draw(ctx);
    this.ball.draw(ctx);

    this._drawHUD(ctx);

    // Floating +2 label
    if (this.scoreEffect) {
      ctx.save();
      ctx.globalAlpha = this.scoreEffect.alpha;
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 8;
      ctx.fillText(this.scoreEffect.text, this.scoreEffect.x, this.scoreEffect.y);
      ctx.restore();
    }

    // Countdown overlay
    if (this.gameState === STATE.COUNTDOWN) {
      this._drawCountdown(ctx);
    }

    // Scored overlay
    if (this.gameState === STATE.SCORED) {
      this._drawScoredOverlay(ctx);
    }

    // Jump ball indicator
    if (this.gameState === STATE.JUMPBALL) {
      this._drawJumpBallIndicator(ctx);
    }
  }

  _drawHUD(ctx) {
    const w = this.canvas.width;

    // HUD bar
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, w, 48);

    // Timer
    const mins    = Math.floor(this.timeLeft / 60);
    const secs    = Math.floor(this.timeLeft % 60);
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    ctx.fillStyle = this.timeLeft < 30 ? '#FF4444' : '#FFFFFF';
    ctx.font      = 'bold 28px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, w / 2, 34);

    // P1 score panel
    ctx.textAlign = 'left';
    ctx.fillStyle = this.p1.data.color;
    ctx.fillRect(10, 6, 180, 36);
    ctx.fillStyle = this.p1.data.accentColor;
    ctx.font = 'bold 13px Arial';
    ctx.fillText(this.p1.data.name, 18, 21);
    ctx.font = 'bold 22px Arial';
    ctx.fillText(this.score[1], 18, 40);

    // P2 score panel
    ctx.textAlign = 'right';
    ctx.fillStyle = this.p2.data.color;
    ctx.fillRect(w - 190, 6, 180, 36);
    ctx.fillStyle = this.p2.data.accentColor;
    ctx.font = 'bold 13px Arial';
    ctx.fillText(this.p2.data.name, w - 18, 21);
    ctx.font = 'bold 22px Arial';
    ctx.fillText(this.score[2], w - 18, 40);

    // Controls hint
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, this.canvas.height - 28, w, 28);
    ctx.fillStyle = '#aaa';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('P1: WASD=move  SPACE=shoot  F=block', 12, this.canvas.height - 10);
    ctx.textAlign = 'right';
    ctx.fillText('P2: Arrows=move  ENTER=shoot  RSHIFT=block', w - 12, this.canvas.height - 10);
  }

  _drawCountdown(ctx) {
    const w   = this.canvas.width;
    const h   = this.canvas.height;
    const t   = this.countdownTimer; // 3.5 → 0

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur  = 12;

    if (t > 3.0) {
      ctx.fillStyle = '#FFC72C';
      ctx.font = 'bold 28px Arial';
      ctx.fillText('GET READY FOR TIP-OFF!', w / 2, h / 2 - 50);
    }

    // Big countdown number
    let countLabel;
    if      (t > 2.5) countLabel = '3';
    else if (t > 1.5) countLabel = '2';
    else if (t > 0.5) countLabel = '1';
    else              countLabel = 'TIP OFF!';

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${countLabel === 'TIP OFF!' ? 48 : 96}px Arial`;
    ctx.fillText(countLabel, w / 2, h / 2 + 30);

    ctx.restore();
  }

  _drawScoredOverlay(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign  = 'center';
    ctx.fillStyle  = '#FFD700';
    ctx.font       = 'bold 42px Arial';
    ctx.shadowColor = '#000';
    ctx.shadowBlur  = 14;
    ctx.fillText(this.scoredText, w / 2, h / 2);
    ctx.restore();
  }

  _drawJumpBallIndicator(ctx) {
    const w = this.canvas.width;
    ctx.save();
    ctx.fillStyle  = 'rgba(255,255,255,0.7)';
    ctx.font       = 'bold 16px Arial';
    ctx.textAlign  = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur  = 6;
    ctx.fillText('JUMP BALL — race to the center!', w / 2, this.floorY - 10);
    ctx.restore();
  }
}
