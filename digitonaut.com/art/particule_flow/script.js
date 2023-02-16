const PI = Math.PI,
TAU = PI * 2,
RAND = Math.random,
SIN = Math.sin,
COS = Math.cos,
lib = {
  v2: Vector2,
  noise: noise
};


class Config {
  constructor(opts) {
    this.merge(opts);
  }
  merge(opts) {
    for (let opt in opts) {
      this.set(opt, opts[opt]);
    }
  }
  set(key, value) {
    if (!key || !value) return;else
    this[key] = value;
  }}


class Canvas {
  constructor(selector, context, dimensions) {
    let self = this;

    if (selector) {
      this.el = document.querySelector(selector);
    } else {
      this.el = document.createElement("canvas");
      document.body.appendChild(this.el);
    }
    this.ctx = this.el.getContext(context) || this.el.getContext("2d");
    this.dimensions = dimensions || { x: 0, y: 0 };
    this.center = new lib.v2();
    this.resize();
    window.addEventListener("resize", self.resize.bind(self));
  }
  fill(color) {
    this.ctx.fillStyle = color || "rgba(0,0,0,1)";
    this.ctx.fillRect(0, 0, this.dimensions.x, this.dimensions.y);
  }
  drawLine(x1, y1, x2, y2, stroke, strokeWidth) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = stroke || "rgba(255,255,255,1)";
    this.ctx.lineWidth = strokeWidth || "2";
    this.ctx.stroke();
    this.ctx.closePath();
  }
  resize() {
    this.el.width = this.dimensions.x = window.innerWidth;
    this.el.height = this.dimensions.y = window.innerHeight;
    this.center.x = this.dimensions.x * 0.5;
    this.center.y = this.dimensions.y * 0.5;
  }}


class Points {
  constructor(opts, bounds) {
    this.config = new Config(opts ? opts : {});
    this.bounds = bounds || {
      x: window.innerWidth,
      y: window.innerHeight };

    this.tick = 0;
    this.currentPoint = {
      position: new lib.v2(),
      lastPosition: new lib.v2(),
      velocity: new lib.v2(),
      theta: 0,
      noise: new lib.v2() };

    this.populate();

  }
  populate() {
    this.vertices = {
      x: new Float32Array(this.config.count),
      y: new Float32Array(this.config.count) };

    this.velocities = {
      x: new Float32Array(this.config.count),
      y: new Float32Array(this.config.count) };

    for (let i = 0; i < this.config.count; i++) {
      let x = RAND() * this.bounds.x,y = RAND() * this.bounds.y;
      this.setVertex(i, x, y);
    }
  }
  getNoise(x, y, t) {
    return lib.noise.simplex3(x, y, t);
  }
  setVertex(i, x, y) {
    this.vertices.x[i] = x;
    this.vertices.y[i] = y;
  }
  setVelocity(i, x, y) {
    this.velocities.x[i] = x;
    this.velocities.y[i] = y;
  }
  updatePoint(i) {
    this.currentPoint.position.x = this.vertices.x[i];
    this.currentPoint.position.y = this.vertices.y[i];

    this.currentPoint.lastPosition.x = this.vertices.x[i];
    this.currentPoint.lastPosition.y = this.vertices.y[i];

    this.currentPoint.velocity.x = this.velocities.x[i];
    this.currentPoint.velocity.y = this.velocities.y[i];

    this.currentPoint.theta =
    this.getNoise(
    this.currentPoint.position.x * this.config.noise.xOff,
    this.currentPoint.position.y * this.config.noise.yOff,
    this.tick * this.config.noise.zOff) *
    TAU;
    this.currentPoint.noise.x = COS(this.currentPoint.theta) * this.config.speed.x;
    this.currentPoint.noise.y = SIN(this.currentPoint.theta) * this.config.speed.y;

    this.currentPoint.velocity.lerp(this.currentPoint.noise, this.config.speed.lerp);
    this.currentPoint.position.add(this.currentPoint.velocity);

    this.setVertex(
    i,
    this.currentPoint.position.x,
    this.currentPoint.position.y);

    this.setVelocity(
    i,
    this.currentPoint.velocity.x,
    this.currentPoint.velocity.y);

  }
  checkBounds(i) {
    let x = this.vertices.x[i],y = this.vertices.y[i];
    if (x > this.bounds.x) this.vertices.x[i] = 0;
    if (x < 0) this.vertices.x[i] = this.bounds.x;
    if (y > this.bounds.y) this.vertices.y[i] = 0;
    if (y < 0) this.vertices.y[i] = this.bounds.y;
  }
}


class App {
  constructor() {
    this.canvas = new Canvas(".canvas", "2d");

    this.points = new Points({
      count: 5000,
      particleColor: "rgba(0,255,230,1)",
      size: 1,
      speed: {
        x: 8,
        y: 8,
        lerp: 0.07 },

      noise: {
        xOff: 0.01,
        yOff: 0.01,
        zOff: 0.01 } },

    this.canvas.dimensions);
    this.render();
  }
  update() {
    this.points.tick++;
    for (let i = this.points.config.count - 1; i > 0; i--) {
      this.points.checkBounds(i);
      this.points.updatePoint(i);
      this.canvas.drawLine(
      this.points.currentPoint.lastPosition.x,
      this.points.currentPoint.lastPosition.y,
      this.points.currentPoint.position.x,
      this.points.currentPoint.position.y,
      this.points.config.particleColor,
      this.points.config.size);

    }
  }
  render() {
    let self = this;

    self.canvas.fill("rgba(0,0,0,0.5)");
    self.update();
    window.requestAnimationFrame(self.render.bind(self));

  }}


window.requestAnimationFrame = (() => {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    });

})();

window.onload = () => {
  let app = new App();
};