//Create var for the contenair, the webGL 3D scene, uniforms to bind into shader and timer

var container;
var camera, scene, renderer;
var uniforms;
var startTime;


var cols = 30.0;
var rows  = 30.0;

init(); //init scene
animate(); //updateScene

function init() {
	//get contenaire
	container = document.getElementById('container');
	
	//Create THREE.JS scene and timer
	startTime = Date.now();
	camera = new THREE.Camera();
	camera.position.z = 1.0;
	scene = new THREE.Scene();
	
	//create a simple plance
	var geometry = new THREE.PlaneBufferGeometry(16, 9);
	
	//create uniform table which provide all our GLSL binding
	uniforms = {
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2() },
		colsrows: {type: "v2", value: new THREE.Vector2()},
		mouse: {type: "v2", value: new THREE.Vector2()}
	};
	
	//create THREE.JS material
	var material = new THREE.ShaderMaterial( {
	//set shaders and uniforms into material
		uniforms: uniforms,
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent
	} );

	//create mesh, add it to the scene
	var mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);
	
	//create renderer and add it to the DOM
	renderer = new THREE.WebGLRenderer();
	container.appendChild(renderer.domElement);
	
	//check window for resize This will give us the proper resolution values to bind
	onWindowResize();
	window.addEventListener('resize', onWindowResize, false);
	
}

function onWindowResize(event) {
	container.style.height = window.innerHeight+"px";
	container.style.width = window.innerWidth+"px";
	
	canvasWidth = container.offsetWidth;
	canvasHeight = container.offsetHeight;
	//send new size value to the shader and resize the window
	uniforms.resolution.value.x = canvasWidth;
	uniforms.resolution.value.y = canvasHeight;
	
	//var res = canvasWidth / cols;
	//rows = canvasHeight / res;
	uniforms.colsrows.value.x = cols;
	uniforms.colsrows.value.y = rows;//rows;
	
	renderer.setSize(canvasWidth, canvasHeight);
}

function animate() {
	render();
	requestAnimationFrame(animate);
}

function render() {
	var currentTime = Date.now();
	var elaspedSeconds =  (currentTime - startTime) / 6000.;
	var maxTime = 4.0;
	var normTime = (elaspedSeconds % maxTime) / maxTime;
	uniforms.time.value = elaspedSeconds * 2.2;

	renderer.render(scene, camera);
}


function move(ev){
 	mx = ev.clientX
  	my = ev.clientY;
	// console.log(mx+" , "+my);
	
	uniforms.mouse.value.x = mx;
	uniforms.mouse.value.y = my;
}

document.addEventListener('mousemove', move)