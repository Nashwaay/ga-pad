export class Particle {

    x; y; vx; vy; alpha; sketch;
    constructor(sketch: any, x?, y?) {
      this.sketch = sketch;
      this.x = x;
      this.y = y;
      this.vx = sketch.random(-1, 1);
      this.vy = sketch.random(-5, -1);
      this.alpha = 255;
    }
  
    finished() {
      return this.alpha < 0;
    }
  
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 5;
    }
  
    show() {
      this.sketch.noStroke();
      //stroke(255);
      this.sketch.fill(255, this.alpha);
      this.sketch.ellipse(this.x, this.y, 16);
    }
  
  }