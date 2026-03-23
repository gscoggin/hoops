export class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.4;
    this.inFlight = false;
    this.isJumpBall = false; // true during tip-off / center toss
    this.scored = false;
    this.owner = null; // 1 or 2 — which player holds the ball
    this.trail = [];
  }

  reset(x, y, owner) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.inFlight = false;
    this.isJumpBall = false;
    this.scored = false;
    this.owner = owner;
    this.trail = [];
  }

  shoot(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    this.inFlight = true;
    this.owner = null;
  }

  update(canvasWidth, floorY) {
    if (!this.inFlight) return;

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 12) this.trail.shift();

    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off walls
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -0.6;
    }
    if (this.x + this.radius > canvasWidth) {
      this.x = canvasWidth - this.radius;
      this.vx *= -0.6;
    }

    // Bounce off floor
    if (this.y + this.radius > floorY) {
      this.y = floorY - this.radius;
      this.vy *= -0.45;
      this.vx *= 0.85;
      if (this.isJumpBall) {
        // Keep bouncing during jump ball; prevent micro-jitter freeze
        if (Math.abs(this.vy) < 0.8) this.vy = -0.8;
      } else {
        if (Math.abs(this.vy) < 1) {
          this.vy = 0;
          this.vx = 0;
          this.inFlight = false;
        }
      }
    }
  }

  draw(ctx) {
    // Trail
    this.trail.forEach((pos, i) => {
      const alpha = (i / this.trail.length) * 0.4;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.radius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 100, 0, ${alpha})`;
      ctx.fill();
    });

    // Ball
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      this.x - 3, this.y - 3, 2,
      this.x, this.y, this.radius
    );
    gradient.addColorStop(0, '#FF8C00');
    gradient.addColorStop(1, '#CC4400');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Ball lines
    ctx.strokeStyle = '#8B2500';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x - this.radius, this.y);
    ctx.lineTo(this.x + this.radius, this.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI, false);
    ctx.stroke();
  }
}
