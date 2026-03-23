// Madison Square Garden court renderer

export class Court {
  constructor(canvas) {
    this.canvas = canvas;
    this.w = canvas.width;
    this.h = canvas.height;
    this.floorY = canvas.height - 80;
    this.hoopHeight = this.floorY - 130;
    this.hoopRadius = 22;
    this.rimThickness = 5;

    // Left hoop (P2 scores here, P1 defends)
    this.leftHoop = { x: 90, y: this.hoopHeight };
    // Right hoop (P1 scores here, P2 defends)
    this.rightHoop = { x: this.w - 90, y: this.hoopHeight };

    this.backboardHeight = 70;
    this.backboardWidth = 8;
  }

  get scoringZones() {
    return [
      // P2 shoots from the right side toward the LEFT hoop → P2 scores
      { hoop: this.leftHoop, scoringPlayer: 2 },
      // P1 shoots from the left side toward the RIGHT hoop → P1 scores
      { hoop: this.rightHoop, scoringPlayer: 1 },
    ];
  }

  checkScore(ball) {
    for (const zone of this.scoringZones) {
      const dx = ball.x - zone.hoop.x;
      const dy = ball.y - zone.hoop.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Ball must pass through from above and be moving downward
      if (dist < this.hoopRadius - ball.radius + 4 && ball.vy > 0 && Math.abs(dy) < 14) {
        return zone.scoringPlayer;
      }
    }
    return null;
  }

  draw(ctx) {
    this._drawBackground(ctx);
    this._drawFloor(ctx);
    this._drawCourtMarkings(ctx);
    this._drawHoops(ctx);
  }

  _drawBackground(ctx) {
    // MSG arena gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, this.h);
    bg.addColorStop(0, '#0a0a1a');
    bg.addColorStop(0.6, '#1a1a2e');
    bg.addColorStop(1, '#16213e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.w, this.h);

    // Scoreboard area top center
    ctx.fillStyle = '#111130';
    ctx.fillRect(this.w / 2 - 100, 0, 200, 60);
    ctx.strokeStyle = '#FFC72C';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.w / 2 - 100, 0, 200, 60);

    // MSG Logo text
    ctx.fillStyle = '#FFC72C';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MADISON SQUARE GARDEN', this.w / 2, 22);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.fillText('HOOPS.IO', this.w / 2, 38);

    // Crowd (rows of colored dots)
    this._drawCrowd(ctx);

    // Arena lights
    const lightPositions = [80, 240, this.w / 2, this.w - 240, this.w - 80];
    lightPositions.forEach(lx => {
      const grd = ctx.createRadialGradient(lx, 0, 0, lx, 0, 90);
      grd.addColorStop(0, 'rgba(255,245,200,0.18)');
      grd.addColorStop(1, 'rgba(255,245,200,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, this.w, 160);
    });
  }

  _drawCrowd(ctx) {
    const crowdColors = ['#e63946','#2a9d8f','#e9c46a','#f4a261','#264653','#8ecae6','#ffffff','#6d6875'];
    const rows = 5;
    const rowHeight = 22;
    const startY = 68;
    for (let row = 0; row < rows; row++) {
      const y = startY + row * rowHeight;
      const cols = Math.floor(this.w / 20);
      for (let col = 0; col < cols; col++) {
        const x = col * 20 + 10;
        // Skip center scoreboard area on top row
        if (row === 0 && x > this.w / 2 - 110 && x < this.w / 2 + 110) continue;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        const ci = (row * cols + col) % crowdColors.length;
        ctx.fillStyle = crowdColors[ci];
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(x, y - 8, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#F4A460';
        ctx.fill();
      }
    }
  }

  _drawFloor(ctx) {
    // Hardwood floor
    const floorGrad = ctx.createLinearGradient(0, this.floorY, 0, this.h);
    floorGrad.addColorStop(0, '#C8934A');
    floorGrad.addColorStop(0.3, '#B8843A');
    floorGrad.addColorStop(1, '#8B6320');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, this.floorY, this.w, this.h - this.floorY);

    // Wood planks
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    const plankH = 14;
    for (let y = this.floorY; y < this.h; y += plankH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.w, y);
      ctx.stroke();
    }

    // Floor edge line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, this.floorY);
    ctx.lineTo(this.w, this.floorY);
    ctx.stroke();
  }

  _drawCourtMarkings(ctx) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;

    // Half-court line
    ctx.beginPath();
    ctx.moveTo(this.w / 2, this.floorY);
    ctx.lineTo(this.w / 2, this.h);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(this.w / 2, this.floorY + 30, 50, 0, Math.PI);
    ctx.stroke();

    // Left three-point arc
    ctx.beginPath();
    ctx.arc(this.leftHoop.x, this.floorY + 10, 160, -0.3, Math.PI * 0.5);
    ctx.stroke();

    // Right three-point arc
    ctx.beginPath();
    ctx.arc(this.rightHoop.x, this.floorY + 10, 160, Math.PI * 0.5, Math.PI + 0.3);
    ctx.stroke();

    // Left paint (key)
    ctx.strokeRect(0, this.floorY - 30, 130, 30);
    // Right paint (key)
    ctx.strokeRect(this.w - 130, this.floorY - 30, 130, 30);

    // Knicks logo center (simple K)
    ctx.fillStyle = 'rgba(0,107,182,0.25)';
    ctx.beginPath();
    ctx.arc(this.w / 2, this.floorY + 20, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,122,0,0.6)';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('K', this.w / 2, this.floorY + 34);
  }

  _drawHoops(ctx) {
    [this.leftHoop, this.rightHoop].forEach((hoop, i) => {
      const isLeft = i === 0;
      const backboardX = isLeft ? hoop.x - this.hoopRadius - 4 : hoop.x + this.hoopRadius + 4;
      const poleX = isLeft ? 10 : this.w - 10;

      // Support pole
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(poleX, this.floorY);
      ctx.lineTo(poleX, hoop.y - 20);
      ctx.stroke();

      // Arm connecting pole to backboard
      ctx.beginPath();
      ctx.moveTo(poleX, hoop.y - 20);
      ctx.lineTo(backboardX, hoop.y - 20);
      ctx.stroke();

      // Backboard
      ctx.fillStyle = 'rgba(200,230,255,0.7)';
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 3;
      const bbX = isLeft ? backboardX - this.backboardWidth : backboardX;
      ctx.fillRect(bbX, hoop.y - this.backboardHeight / 2, this.backboardWidth, this.backboardHeight);
      ctx.strokeRect(bbX, hoop.y - this.backboardHeight / 2, this.backboardWidth, this.backboardHeight);

      // Inner box on backboard
      ctx.strokeStyle = '#F44336';
      ctx.lineWidth = 2;
      const innerW = this.backboardWidth - 2;
      ctx.strokeRect(bbX + 1, hoop.y - 16, innerW, 22);

      // Rim
      ctx.strokeStyle = '#FF5500';
      ctx.lineWidth = this.rimThickness;
      ctx.beginPath();
      ctx.moveTo(isLeft ? backboardX : hoop.x - this.hoopRadius, hoop.y);
      ctx.lineTo(isLeft ? hoop.x + this.hoopRadius : backboardX, hoop.y);
      ctx.stroke();

      // Net (simple lines)
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      const netLeft = hoop.x - this.hoopRadius;
      const netRight = hoop.x + this.hoopRadius;
      const netBottom = hoop.y + 30;
      // Side lines
      ctx.beginPath();
      ctx.moveTo(netLeft, hoop.y);
      ctx.lineTo(hoop.x - 6, netBottom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(netRight, hoop.y);
      ctx.lineTo(hoop.x + 6, netBottom);
      ctx.stroke();
      // Inner lines
      for (let j = 1; j <= 3; j++) {
        const t = j / 4;
        ctx.beginPath();
        ctx.moveTo(netLeft + t * (netRight - netLeft), hoop.y);
        ctx.lineTo(hoop.x - 6 + t * 12, netBottom);
        ctx.stroke();
      }
      // Horizontal net lines
      for (let j = 1; j <= 3; j++) {
        const t = j / 4;
        const ny = hoop.y + t * 30;
        const spread = (1 - t * 0.6) * this.hoopRadius;
        ctx.beginPath();
        ctx.moveTo(hoop.x - spread, ny);
        ctx.lineTo(hoop.x + spread, ny);
        ctx.stroke();
      }
    });
  }
}
