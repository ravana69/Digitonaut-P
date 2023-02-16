// Inspired on incredible work of @zhestkov - https://www.instagram.com/p/BowwXcsHtbz/

// settings
var isMobile = typeof window.orientation !== 'undefined';
var isIOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
var width = window.innerWidth;
var height = window.innerHeight;
var icoQuality = isMobile ? 6 : 7;

var palleteRed = {
  colors: [
  { c: "#3D0000", l: 1 },
  { c: "#F94A4A", l: 1 },
  { c: "#E80000", l: 1 },
  { c: "#FFCCCC", l: 1 },
  { c: "#7C0B0B", l: 1 }],

  topColor: "#FFCCCC",
  topColorL: 5,
  repeat: 20,
  shuffle: true };


var palleteBlack = {
  colors: [
  { c: "#111111", l: 10 },
  { c: "#ed254e", l: 1 },
  { c: "#f9dc5c", l: 1 },
  { c: "#c2eabd", l: 1 },
  { c: "#011936", l: 1 },
  { c: "#465362", l: 1 }],

  topColor: "#111111",
  topColorL: 5,
  repeat: 20,
  shuffle: true };


var themes = [
{
  name: "#1",
  nameColor: "#E80000",
  pallete: palleteRed,
  bg: "bg_red",
  roughness: isIOS ? 0.3 : 0.5,
  metalness: 0.1,
  mapIntensity: isMobile ? isIOS ? 2 : 6 : 12 },

{
  name: "#2",
  nameColor: "#111111",
  pallete: palleteBlack,
  bg: "bg_black",
  roughness: isIOS ? 0.3 : 0.5,
  metalness: 0.5,
  mapIntensity: isMobile ? isIOS ? 2 : 5 : 8 }];


var tParam = new URLSearchParams(window.location.search).get("t");
var themeIndex = tParam ? tParam : 1;
var theme = themes[themeIndex];


var scene, camera, renderer;
var start;
var mouse = { x: 0, y: 0, sx: 0, sy: 0, dx: 0, dy: 0 };
var textureLoader;
var cubemap;
var cubeRenderTarget;
var cubeTexture;
var capturer;
var timeToStopRecord;
var mousePos = [];
var clock;
var loading;
var palleteObj;


var palleteImg;
var palleteTexture;

function init() {
  console.clear();

  loading = document.querySelector(".loading");

  start = performance.now();

  textureLoader = new THREE.TextureLoader();

  // menuThemes()

  palleteObj = theme.pallete;
  palleteImg = createPalleteImg(palleteObj);
  palleteTexture = textureLoader.load(palleteImg);


  setup();
  elements();


  render();


}

function menuThemes() {
  var menuEl = document.createElement("div");
  menuEl.className = "theme_menu";
  document.body.appendChild(menuEl);
  for (var i = 0; i < themes.length; i++) {
    var el = document.createElement("a");
    el.className = "theme_btn";
    el.innerHTML = "<span>" + themes[i].name + "</span>";
    el.style.background = themes[i].nameColor;
    el.setAttribute("href", window.location.origin + window.location.pathname + "?t=" + i);
    menuEl.appendChild(el);
  }
}

function setup() {
  clock = new THREE.Clock(true);

  document.body.className = theme.bg;
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
  camera.position.z = 60;

  ambLight = new THREE.AmbientLight(0xaaaaaa, 2);
  scene.add(ambLight);


  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.autoClear = false;
  renderer.setPixelRatio = devicePixelRatio;
  renderer.setSize(width, height);


  document.body.appendChild(renderer.domElement);

  /*
  if (isMobile) {
    window.addEventListener("touchstart", inputstart, { passive: false });
    window.addEventListener("touchmove", inputmove, { passive: false });
    window.addEventListener("touchend", inputend, { passive: false });
  } else
  {
    window.addEventListener("mousedown", inputstart);
    window.addEventListener("mousemove", inputmove);
    window.addEventListener("mouseup", inputend);
  }
*/
  window.addEventListener("resize", resize);
  resize();
}

function createPalleteImg(palleteObj) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");

  var pallete = expandPallete(palleteObj);

  var texH = 1024;
  var colorH = texH / pallete.length;

  canvas.width = 1;
  canvas.height = texH;

  for (var i = 0; i < pallete.length; i++) {
    ctx.fillStyle = pallete[i];
    ctx.fillRect(0, colorH * i, canvas.width, colorH);

  }

  return canvas.toDataURL();

}

function expandPallete(palleteObj) {
  var pallete = [];
  for (var x = 0; x < palleteObj.repeat; x++) {
    for (var i = 0; i < palleteObj.colors.length; i++) {
      var colors = palleteObj.shuffle ? shuffle(palleteObj.colors.slice()) : palleteObj.colors;
      var c = colors[i];
      for (var j = 0; j < c.l; j++) {
        pallete.push(c.c);
      }
    }
  }
  if (palleteObj.topColor) {
    for (var i = 0; i < palleteObj.topColorL; i++)
    pallete.push(palleteObj.topColor);
  }
  return pallete;
}

function shuffle(o) {
  for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

function elements() {
  geometry = new THREE.IcosahedronBufferGeometry(width > height ? 22 : 15, icoQuality);

  if (isMobile)
  loadEnv('https://s3-us-west-2.amazonaws.com/s.cdpn.io/93719/Basic_Studio_wavelet.jpg');else

  loadExrEnv('https://s3-us-west-2.amazonaws.com/s.cdpn.io/93719/Basic_Studio_wavelet.exr');


  icoMaterial = new MeshCustomMaterial({
    roughness: theme.roughness,
    metalness: theme.metalness,
    envMapIntensity: theme.mapIntensity },

  {
    tExplosion: {
      type: "t",
      value: palleteTexture },

    time: {
      type: "f",
      value: 0.0 } },


  document.getElementById("vertex-ico-pbr").textContent,
  document.getElementById("fragment-ico-pbr").textContent);


  icoSphere = new THREE.Mesh(geometry, icoMaterial);
  scene.add(icoSphere);
}


function loadEnv(url) {
  new THREE.TextureLoader().load(url, function (texture) {

    texture.format = THREE.RGBFormat;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    var cubemapGenerator = new THREE.EquirectangularToCubeGenerator(texture, { resolution: 1024 });
    var cubeMapTexture = cubemapGenerator.update(renderer);

    var pmremGenerator = new THREE.PMREMGenerator(cubeMapTexture);
    pmremGenerator.update(renderer);

    var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods);
    pmremCubeUVPacker.update(renderer);

    cubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

    texture.dispose();
    cubemapGenerator.dispose();
    pmremGenerator.dispose();
    pmremCubeUVPacker.dispose();

    envLoaded();

  });
}


function loadExrEnv(url) {
  new THREE.EXRLoader().load(url, function (texture) {

    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.encoding = THREE.LinearEncoding;
    texture.generateMipmaps = true;
    texture.mapping = THREE.UVMapping;

    var cubemapGenerator = new THREE.EquirectangularToCubeGenerator(texture, { resolution: 1024, type: THREE.HalfFloatType });
    var cubeMapTexture = cubemapGenerator.update(renderer);

    var pmremGenerator = new THREE.PMREMGenerator(cubeMapTexture);
    pmremGenerator.update(renderer);


    var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods);
    pmremCubeUVPacker.update(renderer);

    cubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

    texture.dispose();
    cubemapGenerator.dispose();
    pmremGenerator.dispose();
    pmremCubeUVPacker.dispose();

    envLoaded();


  });
}

function envLoaded() {

  scene.remove(ambLight);
  icoMaterial.envMap = cubeRenderTarget.texture;
  icoMaterial.needsUpdate = true;
  loading.style.display = "none";
}


function inputstart(e) {

  inputmove(e);
  mouse.dx = 0;
  mouse.dy = 0;
  mouse.sx = mouse.x;
  mouse.sy = mouse.y;

  prevRotX = rotX;
  prevRotY = rotY;

}

function inputmove(e) {

  if (e.type == "touchmove")
  e.preventDefault();

  var x, y;
  if (e.type.indexOf("mouse") >= 0) {
    x = e.clientX;
    y = e.clientY;
  } else {
    x = e.changedTouches[0].clientX;
    y = e.changedTouches[0].clientY;
  }

  mouse.x = x / window.innerWidth - 0.5;
  mouse.y = y / window.innerHeight - 0.5;

  mouse.dx = mouse.x - mouse.sx;
  mouse.dy = mouse.y - mouse.sy;


}

function inputend(e) {
  // e.preventDefault();

}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

}

var changed = false;
var rotX = 0;
var rotY = 0;
var prevRotX = 0;
var prevRotY = 0;
var rotXEase = 0;
var rotYEase = 0;

function render() {
  requestAnimationFrame(render);

  var dt = clock.getDelta();

  var time = clock.getElapsedTime();

  rotX = mouse.dy * 2 + prevRotX;
  rotY = mouse.dx * 2 + prevRotY;
  rotXEase += (rotX - rotXEase) * 0.1;
  rotYEase += (rotY - rotYEase) * 0.1;
  icoSphere.rotation.x = rotXEase;
  icoSphere.rotation.y = rotYEase;

  icoMaterial.uniforms['time'].value = time * 0.4;
  icoMaterial.uniforms['tExplosion'].value = palleteTexture;

  renderer.render(scene, camera);




}

function MeshCustomMaterial(parameters, uniforms, vertexShader, fragmentShader) {
  THREE.MeshStandardMaterial.call(this);
  this.uniforms = THREE.UniformsUtils.merge([
  THREE.ShaderLib.standard.uniforms,
  uniforms]);

  this.vertexShader = vertexShader;
  this.fragmentShader = fragmentShader;
  this.type = 'MeshCustomMaterial';
  this.setValues(parameters);
}

MeshCustomMaterial.prototype = Object.create(THREE.MeshStandardMaterial.prototype);
MeshCustomMaterial.prototype.constructor = MeshCustomMaterial;
MeshCustomMaterial.prototype.isMeshStandardMaterial = true;



window.onload = init;