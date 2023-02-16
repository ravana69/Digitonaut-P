const EIGHTH_PI = Math.PI * 0.125;
const SIXTEENTH_PI = EIGHTH_PI * 0.5;
const { Engine, World, Bodies, Body, Vector } = Matter;

let engine = Engine.create();
let { world } = engine;
Engine.run(engine);

let canvas, ctx;

let time = null;
let triggerToggle = 1;
let totalTime = 5 * 1000;
let hourTime = totalTime / 12;
let minuteTime = totalTime / 60;
let secondTime = 1000;
let scaleFactor = 1.3;
let textSizes = { hour: [32, 18], minute: [20, 14], second: [16, 10] };

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.drawingContext;

  textAlign(CENTER, CENTER);
  colorMode(HSL);

  let wallOptions = { collisionFilter: { category: 0x001 }, isStatic: true };
  let wallsHeight = 1000;
  let wallsY = -wallsHeight * 0.5 + 100;
  let wallOpts = [wallsY, 25, wallsHeight, wallOptions];
  let walls = [
  Bodies.rectangle(-300, ...wallOpts),
  Bodies.rectangle(-100, ...wallOpts),
  Bodies.rectangle(100, ...wallOpts),
  Bodies.rectangle(300, ...wallOpts)];


  let groundOptions = { collisionFilter: { category: 0x002 }, isStatic: true };
  let groundArgs = [150, 140, 25];
  let groundOpts1 = groundArgs.concat([Object.assign({ angle: QUARTER_PI }, groundOptions)]);
  let groundOpts2 = groundArgs.concat([Object.assign({ angle: -QUARTER_PI }, groundOptions)]);
  let ground = [
  Bodies.rectangle(-247.5, ...groundOpts1),
  Bodies.rectangle(-152.5, ...groundOpts2),
  Bodies.rectangle(-47.5, ...groundOpts1),
  Bodies.rectangle(52.5, ...groundOpts2),
  Bodies.rectangle(247.5, ...groundOpts2),
  Bodies.rectangle(152.5, ...groundOpts1)];


  World.add(world, walls.concat(ground));
}

function mouseDragged() {
  world.bodies.forEach(body => {
    if (body.isStatic || body.velocity.y < -0.5) {
      return;
    }
    let pos = Vector.clone(body.position);
    pos.y += 2;
    Body.applyForce(
    body, pos, {
      x: random(-1, 1) * 0.001,
      y: -0.005 });

  });
}

function draw() {
  background(0);

  translate(width * 0.5, height * 0.5);

  let currentTime = [hour() % 12 || 12, minute(), second()];
  if (!time || time.slice(0, 2).some((n, i) => n !== currentTime[i])) {
    time = currentTime;
    trigger();
  }

  let drawableBodies = world.bodies.slice(10);
  // let drawableBodies = world.bodies; // Debug
  drawableBodies.forEach(body => {
    let { vertices, position: pos, label } = body;
    if (typeof label !== 'string') {
      let { num, side, largest, t, style } = label;
      if ((abs(pos.x) > width || pos.y > height) && !body.isStatic) {
        World.remove(world, body);
        return;
      }
      // let isHourSide = side === 'hour';
      fill(style);
      largest ? stroke(255) : noStroke();
    } else
    {
      fill(32);
      stroke(255);
      point(pos.x, pos.y);
    }
    beginShape();
    vertices.forEach(v => vertex(v.x, v.y));
    endShape(CLOSE);
    if (typeof label !== 'string') {
      let { num, side, largest } = label;
      fill(255);
      noStroke();
      textSize(textSizes[side][1 - largest]);
      text(num, pos.x, pos.y);
    }
  });
}

function createBlock({ x, y, w, h, options = {} }) {
  options.restitution = 0.6;
  let body = Bodies.rectangle(x, y, w, h, options);
  World.add(world, body);
  return body;
}

function createFilteredBlock({ x = 0, y = -height * 0.5 - 60, w = 40, h = 40, label = {} } = {}) {
  let category = triggerToggle ? 0x002 : 0x004;
  let mask = category | 0x001;
  let options = { collisionFilter: { category, mask } };
  let block = createBlock({ x, y, w, h, options });
  Body.applyForce(block, block.position, { x: random(-1, 1) * 0.002, y: 0.005 });
  block.label = label;
  return block;
}

function createHourBlock() {
  let x = random(-125, -275);
  let label = { side: 'hour', timeIndex: 0 };
  return createFilteredBlock({ x, label });
}

function createMinuteBlock() {
  let x = random(-75, 75);
  let w = 30;
  let label = { side: 'minute', timeIndex: 1 };
  return createFilteredBlock({ x, w, h: w, label });
}

function createSecondBlock() {
  let x = random(125, 275);
  let w = 20;
  let label = { side: 'second', timeIndex: 2 };
  return createFilteredBlock({ x, w, h: w, label });
}

function toggle() {
  let cat = triggerToggle ? 0x002 : 0x004;
  world.bodies.slice(3, 10).forEach(body => body.collisionFilter.category = cat);
}

let triggeredBlocks = [];
let _hourOpts = { func: createHourBlock, to: hourTime };
let _minuteOpts = { func: createMinuteBlock, to: minuteTime };
let _secondOpts = { func: createSecondBlock, to: secondTime, side: 'second' };

function trigger() {
  triggerToggle ^= 1;
  toggle();
  triggeredBlocks.forEach(n => clearTimeout(n));
  let hourHue = time[0] / 12 * 360 % 360;
  let minuteHue = time[1] / 60 * 360 % 360;

  function triggerBlock({ func, h, i }) {
    return () => {
      let block = func();
      let { side, timeIndex } = block.label;
      let num = i + 1;
      let largest = timeIndex !== 2 ? num === time[timeIndex] : false;
      if (largest) {
        Body.scale(block, scaleFactor, scaleFactor);
      }
      let t = timeIndex !== 2 ? num / time[timeIndex] : num / 60;
      h = h.toFixed(2);
      let s = (t * 20 + 45).toFixed(2);
      let l = (t * 15 + 10).toFixed(2);
      let style = largest ? [h, 90, 45] : [h, s, l];
      block.label = { num, side, largest, t, style };
    };
  }

  let hourOpts = Object.assign({ h: hourHue }, _hourOpts);
  let minuteOpts = Object.assign({ h: minuteHue }, _minuteOpts);
  let secondOpts = Object.assign({ h: minuteHue, side: 'second' }, _secondOpts);

  for (let i = 0; i < 60; i++) {
    let opts = [
    i < time[0] ? Object.assign({ i }, hourOpts) : null,
    i < time[1] ? Object.assign({ i }, minuteOpts) : null,
    Object.assign({ i }, secondOpts)];

    opts.filter(n => n).forEach(n => {
      let isSecond = n.side === 'second';
      let secondTO = isSecond && (i < time[2] ? 5 * i : n.to * (i - time[2]));
      let timeoutTime = isSecond ? secondTO : n.to * i;
      let timeout = setTimeout(triggerBlock(n), timeoutTime);
      triggeredBlocks.push(timeout);
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}