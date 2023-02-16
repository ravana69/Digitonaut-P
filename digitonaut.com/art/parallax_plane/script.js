import gsap from 'https://cdn.skypack.dev/gsap';

const BOUNDS = 50;
/*
document.addEventListener('pointermove', ({ x, y }) => {
  const newX = gsap.utils.mapRange(0, window.innerWidth, -BOUNDS, BOUNDS, x);
  const newY = gsap.utils.mapRange(0, window.innerHeight, BOUNDS, -BOUNDS, y);
  gsap.set(document.documentElement, {
    '--rotate-x': newY,
    '--rotate-y': newX });

});
*/

var inc = 0;
setInterval(function() {
	inc+=.01;
  const newX = gsap.utils.mapRange(0, window.innerWidth, -BOUNDS, BOUNDS, Math.sin(inc) * 400 + 400);
  const newY = gsap.utils.mapRange(0, window.innerHeight, BOUNDS, -BOUNDS, Math.cos(inc/3) * 150 + 150);
  gsap.set(document.documentElement, {
    '--rotate-x': newY,
    '--rotate-y': newX });

}, 20);

let CHECKED = false;
document.addEventListener('pointerdown', e => {
  CHECKED = !CHECKED;
  document.documentElement.style.setProperty('--dark', CHECKED ? 1 : 0);
});