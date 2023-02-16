function initialize() {
  let uniforms = {
    u_resolution: {
      type: "vec2",
      value: [window.innerWidth, window.innerHeight] },

    u_mouse: {
      type: "vec2",
      value: [0, 0] },

    u_time: {
      type: "float",
      value: -100.0 } };



  window.addEventListener('resize', e => {
    uniforms.u_resolution.value = [window.innerWidth, window.innerHeight];
  });

  document.addEventListener('pointermove', e => {
    let ratio = window.innerHeight / window.innerWidth;
    uniforms.u_mouse.value = [(e.pageX - window.innerWidth / 2) / window.innerWidth / ratio, (e.pageY - window.innerHeight / 2) / window.innerHeight * -1];

    e.preventDefault();
  });

  function render({ u_time, u_resolution }) {
    u_time.value += 0.01;
  }

  const fragment = document.querySelector("#fragmentShader").textContent;
  console.log(fragment);

  wrapper({ uniforms, render, fragment });
}

/**
 * Pixel shader wrapper based on Phenomenon.
 */
function wrapper({ uniforms, render, fragment }) {
  const phenomenon = new Phenomenon({ devicePixelRatio: 1 });

  const vertex = `
    attribute vec3 aPosition;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;

    void main(){
      gl_Position = uProjectionMatrix * uModelMatrix * uViewMatrix * vec4(aPosition, 1.0);
    }
  `;

  phenomenon.add("magic", {
    vertex,
    fragment,
    uniforms,
    mode: 4,
    multiplier: 1,
    attributes: [],
    willRender: p => render(p.uniforms),
    geometry: {
      vertices: [
      { x: -100.0, y: 100.0, z: 0.0 },
      { x: -100.0, y: -100.0, z: 0.0 },
      { x: 100.0, y: 100.0, z: 0.0 },
      { x: 100.0, y: -100.0, z: 0.0 },
      { x: -100.0, y: -100.0, z: 0.0 },
      { x: 100.0, y: 100.0, z: 0.0 }] } });



}

initialize();