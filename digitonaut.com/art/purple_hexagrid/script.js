console.clear();
import * as THREE from "./three.module.js";
import {OrbitControls} from "./OrbitControls.js";

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 1, 1000);
camera.position.set(5, -3, 0).setLength(5);
let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(new THREE.Color(1, 0.875, 0.75));
document.body.appendChild(renderer.domElement);

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minPolarAngle = THREE.MathUtils.degToRad(75);
controls.maxPolarAngle = THREE.MathUtils.degToRad(105);
controls.minAzimuthAngle = THREE.MathUtils.degToRad(75);
controls.maxAzimuthAngle = THREE.MathUtils.degToRad(105);
controls.minDistance = 5;
controls.maxDistance = 10;

let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(13, 8, 0);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

const circleCount = 50;
let baseG = new THREE.CylinderGeometry(0.5, 0.5, 1, 6);
baseG.translate(0, 0.5, 0);
for(let i = 0; i < baseG.attributes.uv.count; i++){
  baseG.attributes.uv.setY(i, baseG.attributes.position.getY(i));
}
baseG.translate(0, -0.5, 0);
baseG.scale(1, 10, 1);
baseG.rotateX(Math.PI * 0.5);
let g = new THREE.InstancedBufferGeometry().copy(baseG);
g.instanceCount = ((circleCount * (circleCount + 1)) / 2) * 6 + 1;
console.log(g.instanceCount);
let iPos = hexagridFormation(circleCount);
g.setAttribute("instPos", new THREE.InstancedBufferAttribute(iPos, 3));
let moveData = []; //phase, speed
for(let i = 0; i < g.instanceCount; i++){
  moveData.push(
    Math.PI * 2 * Math.random(),
    Math.random() * 0.5 + 0.5
  );
}
g.setAttribute("moveData", new THREE.InstancedBufferAttribute(new Float32Array(moveData), 2));
let uniforms = {
  time: {value: 0}
}
let m = new THREE.MeshStandardMaterial({
  color: 0x222244,
  roughness: 0.6,
  metalness: 0.8,
  onBeforeCompile: shader => {
    shader.uniforms.time = uniforms.time;
    shader.vertexShader = `
      uniform float time;
      attribute vec3 instPos;
      attribute vec2 moveData;
      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
        transformed += instPos;
        transformed.z += sin(time * moveData.y + moveData.x) * 0.5 + sin((instPos.y + time) * 0.2);
      `
    );
    shader.fragmentShader = `
      ${shader.fragmentShader}
    `.replace(
      `#include <dithering_fragment>`,
      `#include <dithering_fragment>
      
        vec3 col = vec3(gl_FragColor);
        
        col = mix(col, vec3(1, 0.125, 1), smoothstep(0.995, 0.975, vUv.y));
        col = mix(col, vec3(1, 0.875, 0.75), smoothstep(0.975, 0.9, vUv.y));
        
        gl_FragColor.rgb = col;
      
      `
    );
    //console.log(shader.fragmentShader);
  }
});
m.defines = {"USE_UV": ""};
let o = new THREE.Mesh(g, m);
o.rotation.y = Math.PI * 0.5;
scene.add(o);

let mouseX = 0, mouseY = 0;

let screenDivisor = 2;
let windowHalfX = window.innerWidth / screenDivisor;
let windowHalfY = window.innerHeight / screenDivisor;

window.addEventListener( 'resize', onWindowResize );

let clock = new THREE.Clock();

renderer.setAnimationLoop( _ => {
  controls.update();
  uniforms.time.value = clock.getElapsedTime();
  renderer.render(scene, camera);
});

function hexagridFormation(circleCount){
  let pts = [];
  let unit = Math.sqrt(3) * 0.5 * 1.1;

  let angle = Math.PI / 3;
  let axis = new THREE.Vector3(0, 0, 1);

  let axisVector = new THREE.Vector3(0, -unit, 0);
  let sideVector = new THREE.Vector3(0, unit, 0).applyAxisAngle(axis, -angle);
  let vec3 = new THREE.Vector3(); // temp vector
  let counter = 0;
  for (let seg = 0; seg < 6; seg++) {
    for (let ax = 1; ax <= circleCount; ax++) {
      for (let sd = 0; sd < ax; sd++) {

        vec3.copy(axisVector)
          .multiplyScalar(ax)
          .addScaledVector(sideVector, sd)
          .applyAxisAngle(axis, (angle * seg) + (Math.PI / 6));
        pts.push(vec3.x, vec3.y, -5);
      }
    }
  }
  pts.push(0, 0, -5);
  
  return new Float32Array(pts);
  
}

function onWindowResize() {

  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( innerWidth, innerHeight );

}