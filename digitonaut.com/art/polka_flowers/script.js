// By Roni Kaufman
// inspired by https://twitter.com/beesandbombs/status/1290072545069334530?s=09

let t = 0;
let step = 1.5;

let dotSize = 24;
let dots;

let margin = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 100);
  angleMode(DEGREES);
  
  initDots();
}

function draw() {
  background(60, 75, 15);
  
  for (let dot of dots) {
    dot.draw();
  }
  
  t += step;
}

function initDots() {
  dots = [];
    
  let countLines = 0;
  let xSep = dotSize * 2;
  let ySep = xSep * sqrt(3)/2;
  let x = 0;
  let y = -ySep / 4;
  while (y < height + dotSize) {
    if (countLines % 2 === 0) {
      x = xSep / 4;
    } else {
      x = -xSep / 4;
    }
    while (x < width + dotSize) {
      dots.push(new Dot(x, y));
      x += xSep;
    }
    countLines++;
    y += ySep;
  }
  
}

function Dot(x_, y_) {
  this.x = x_;
  this.y = y_;
	
	let alpha = 0.2;
	this.dist = dist(this.x, this.y, width/2, height/2)*alpha;
  
  this.draw = function() {
		let v = (cos(this.dist - t) + 1)/2;
    let hue = (100*(1-v)/3 + 80)%100;
    stroke(hue, 100, 100);
		strokeWeight((1-v)*2 + 2);
		fill(hue, 100, 100, 50*v + 10);
		let size = map(v, 1, 0, dotSize*2 - margin, dotSize*4 - margin);
    circle(this.x, this.y, size);
  }
}