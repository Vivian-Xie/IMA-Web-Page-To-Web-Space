console.log("three.js Version: " + THREE.REVISION);

let container, gui, stats;
let scene, camera, renderer;
let controls;
let time, frame = 0;


function initThree() {
  scene = new THREE.Scene();

  const fov = 75;
  const aspectRatio = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  container = document.getElementById("container-three");
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  gui = new dat.GUI();

  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.domElement);

  setupThree();

  renderer.setAnimationLoop(animate); // Necessary for WebXR!!!
}

function animate() {
  // requestAnimationFrame(animate);
  stats.update();
  time = performance.now();
  frame++;

  updateThree();

  renderer.render(scene, camera);
}

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
// Add a mouse listener for removing cards
window.addEventListener('mousedown', () => {
  flashActive = true; // Activate the flash
  flashOpacity = 0; // Start from transparent
  flashTimer = 0; // Reset the timer
  if(doorFullyOpen1&&!doorFullyOpen2){
    doorFullyOpen2=true;
    scene.remove(sceneElementsGroup);
    cardsArray = [];
  } 
  if(!doorFullyOpen1){
    scene.add(sceneElementsGroup);
    console.log("print this is the first open");
    doorFullyOpen1=true;
  } 
  console.log("All cards have been removed from the scene!");
  // console.log("turn");
  // cardsArray.forEach((card) => {
  //   scene.remove(card);
  // });
  
  // Clear the cardsArray
});
