// Rim is this many pixels above the floor in Court.js (floorY - 130)
const RIM_HEIGHT_ABOVE_FLOOR = 130;
const GRAVITY = 0.4; // matches Ball.js

export class Player {
  constructor(id, playerData, side, x, floorY) {
    this.id = id;
    this.data = playerData;
    this.side = side;
    this.floorY = floorY;

    this.heightScale = playerData.heightScale || 1.0;
    this.widthScale  = playerData.widthScale  || 1.0;
    this.height = Math.round(60 * this.heightScale);
    this.width  = Math.round(36 * this.widthScale);

    this.x = x;
    this.y = floorY - this.height;

    this.vx = 0;
    this.vy = 0;
    this.onGround = true;
    this.hasBall   = false;

    // Shooting
    this.shootCharge = 0;
    this.isCharging  = false;
    this.accuracy    = playerData.stats.accuracy / 100;
    // maxArcBonus: extra arc height (px) added at full charge
    this.maxArcBonus = 70 + (playerData.stats.power / 100) * 50;
    // playerMaxVx at full charge — scales with power stat
    this.maxVxAtFullCharge = 14 + (playerData.stats.power / 100) * 4;

    // Blocking
    this.blockTimer = 0; // counts down from 30 when block is active

    // Movement
    this.speed = (playerData.stats.speed / 100) * 5.5;

    // Jump: player top should just reach the rim with a good jump
    const baseTravel = Math.max(20, RIM_HEIGHT_ABOVE_FLOOR - this.height);
    const jumpBonus  = (playerData.stats.jump / 100) * 14;
    this.jumpPower   = -Math.sqrt(2 * 0.55 * (baseTravel + jumpBonus));

    this.facingRight = side === 'left';
    this.animFrame   = 0;
    this.animTimer   = 0;
  }

  // ── Movement ──────────────────────────────────────────────────────────────

  moveLeft()       { this.vx = -this.speed; this.facingRight = false; }
  moveRight()      { this.vx =  this.speed; this.facingRight = true;  }
  stopHorizontal() { this.vx = 0; }

  jump() {
    if (this.onGround) {
      this.vy = this.jumpPower;
      this.onGround = false;
    }
  }

  // ── Shooting ──────────────────────────────────────────────────────────────

  startCharge() {
    if (this.hasBall) this.isCharging = true;
  }

  /**
   * Arc-physics shot model.
   *
   * Charge controls two things simultaneously:
   *   1. arcAboveHoop — how high above the rim the ball peaks (low charge = flat arc)
   *   2. playerMaxVx  — how much horizontal power the player can generate
   *
   * The "perfect" vx to reach the hoop exactly is computed from the arc geometry.
   * If that perfect vx exceeds the player's current max, the shot falls short.
   * Accuracy jitter is large enough for lower-accuracy players to genuinely miss.
   */
  releaseShoot(targetX, targetY) {
    if (!this.hasBall || !this.isCharging) return null;

    const chargeRatio = this.shootCharge / 100; // 0 = quick tap, 1 = full hold

    // Shoot from upper body
    const cx = this.x + this.width  / 2;
    const cy = this.y + this.height * 0.15;

    const dx = targetX - cx; // positive = shooting right
    const dy = targetY - cy; // negative = hoop is above

    // 1. Arc above hoop: grows with charge
    const minArc = 12;
    const arcAboveHoop = minArc + chargeRatio * this.maxArcBonus;

    // 2. Time the ball spends in the air when it passes through hoop height
    const peakHeight = Math.abs(dy) + arcAboveHoop;
    const vy         = -Math.sqrt(2 * GRAVITY * peakHeight);
    const t_up       = Math.abs(vy) / GRAVITY;
    const t_down     = Math.sqrt(2 * arcAboveHoop / GRAVITY);
    const totalTime  = t_up + t_down;

    // 3. The vx that would land the ball exactly in the hoop
    const vx_perfect = dx / totalTime;

    // 4. How much horizontal power the player can actually generate this shot
    //    Low charge → small max → ball falls short if too far from hoop
    const playerMaxVx = 2 + chargeRatio * this.maxVxAtFullCharge;

    let vx;
    if (Math.abs(vx_perfect) > playerMaxVx) {
      // Under-powered: ball visibly falls short of the hoop
      vx = Math.sign(vx_perfect) * playerMaxVx;
    } else {
      vx = vx_perfect;
    }

    // 5. Accuracy jitter — meaningful enough to cause actual misses
    //    Scales with distance so long shots are harder for low-accuracy players
    const jitterBase  = (1 - this.accuracy) * 2.5;
    const jitterRange = (1 - this.accuracy) * Math.abs(dx) * 0.008;
    const jx = (Math.random() - 0.5) * (jitterBase + jitterRange);
    const jy = (Math.random() - 0.5) * (1 - this.accuracy) * 0.4;

    this.isCharging  = false;
    this.shootCharge = 0;
    this.hasBall     = false;

    return { vx: vx + jx, vy: vy + jy };
  }

  // ── Blocking ──────────────────────────────────────────────────────────────

  /** Called on keydown. Sets a 30-frame block window. */
  tryBlock() {
    if (this.blockTimer === 0) {
      this.blockTimer = 30;
    }
  }

  get isBlocking() {
    return this.blockTimer > 0;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(canvasWidth, floorY, boundaries) {
    this.vy += 0.55;
    this.x  += this.vx;
    this.y  += this.vy;

    // Walk animation
    if (this.vx !== 0) {
      this.animTimer++;
      if (this.animTimer > 8) { this.animFrame = (this.animFrame + 1) % 4; this.animTimer = 0; }
    } else {
      this.animFrame = 0;
    }

    // Floor collision
    if (this.y + this.height > floorY) {
      this.y = floorY - this.height;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // Wall boundaries
    if (this.x < boundaries.left)                 this.x = boundaries.left;
    if (this.x > boundaries.right - this.width)   this.x = boundaries.right - this.width;

    // Shoot charge
    if (this.isCharging && this.hasBall) {
      this.shootCharge = Math.min(100, this.shootCharge + 2);
    }

    // Block cooldown
    if (this.blockTimer > 0) this.blockTimer--;
  }

  // ── Draw ──────────────────────────────────────────────────────────────────

  draw(ctx) {
    const s   = this.heightScale;
    const ws  = this.widthScale;
    const cx  = this.x + this.width / 2;
    const topY = this.y;
    const color  = this.data.color;
    const accent = this.data.accentColor;
    const skin   = this.data.skinColor || '#C68642';

    ctx.save();
    if (!this.facingRight) {
      ctx.scale(-1, 1);
      ctx.translate(-2 * cx, 0);
    }

    // Shadow
    ctx.beginPath();
    ctx.ellipse(cx, this.y + this.height + 2, 18 * ws, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fill();

    // Legs
    const legBob = this.onGround ? Math.sin(this.animFrame * Math.PI / 2) * 4 : 0;
    ctx.fillStyle = color;
    ctx.fillRect(cx - 14 * ws, topY + 36 * s, 10 * ws, 22 * s + legBob);
    ctx.fillRect(cx +  4 * ws, topY + 36 * s, 10 * ws, 22 * s - legBob);

    // Shoes
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 16 * ws, topY + 56 * s + legBob, 13 * ws, 6);
    ctx.fillRect(cx +  3 * ws, topY + 56 * s - legBob, 13 * ws, 6);

    // Jersey body
    ctx.fillStyle = color;
    ctx.fillRect(cx - 16 * ws, topY + 20 * s, 32 * ws, 18 * s);

    // Jersey number
    ctx.fillStyle = accent;
    ctx.font = `bold ${Math.round(10 * s)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(this.data.number, cx, topY + 32 * s);

    // Arms — raised higher when blocking
    const armRaise   = this.isBlocking ? -12 : 0;
    const armSwing   = this.onGround && !this.isBlocking ? Math.cos(this.animFrame * Math.PI / 2) * 5 : 0;
    ctx.fillStyle = skin;
    ctx.fillRect(cx - 22 * ws, topY + 20 * s + armSwing + armRaise, 7 * ws, 16 * s);
    ctx.fillRect(cx + 15 * ws, topY + 20 * s - armSwing + armRaise, 7 * ws, 16 * s);

    // Head
    ctx.beginPath();
    ctx.arc(cx, topY + 13 * s, 13 * Math.max(ws, 0.85), 0, Math.PI * 2);
    ctx.fillStyle = skin;
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(cx + 4 * ws, topY + 11 * s, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 4 * ws, topY + 11 * s, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(cx + 2 * ws, topY + 16 * s, 4, 0, Math.PI);
    ctx.strokeStyle = '#5C2E00';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // Block aura
    if (this.isBlocking) {
      ctx.save();
      ctx.globalAlpha = (this.blockTimer / 30) * 0.5;
      ctx.strokeStyle = '#00BFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Shoot charge bar — green → yellow only (no red)
    if (this.isCharging) {
      const barW = 44;
      const barH = 6;
      const bx = this.x + this.width / 2 - barW / 2;
      const by = this.y - 14;
      ctx.fillStyle = '#333';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = this.shootCharge < 65 ? '#4CAF50' : '#FFC107';
      ctx.fillRect(bx, by, (this.shootCharge / 100) * barW, barH);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, barW, barH);
    }

    // Ball indicator dot when holding
    if (this.hasBall) {
      const cx2 = this.x + this.width / 2;
      ctx.beginPath();
      ctx.arc(cx2, topY - 4, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FF8C00';
      ctx.fill();
    }
  }
}
