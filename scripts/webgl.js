import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
const modelContainer = document.querySelector('#section-two-model-container');
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const width = modelContainer.clientWidth;
const height = modelContainer.clientHeight;
let model;

const renderer = new THREE.WebGLRenderer();
const loader = new GLTFLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);

camera.position.setZ(26)  
 
// Generate a neutral environment texture
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

const ambientLight = new THREE.AmbientLight(new THREE.Color(1.0, 1.0, 1.0), 1.0)
scene.add(ambientLight);

renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

modelContainer.appendChild(renderer.domElement);

// Draw Loop
function animate(time) {

  renderer.render(scene, camera);
  renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0), 0.0);
  if (window.scrollY > 800 && window.scrollY < 1600 && model) {
    model.rotation.y = (Math.PI * 0.40) - Math.sin(((window.scrollY - 800) / 1600) * Math.PI) * 0.3; 
  }
}
renderer.setAnimationLoop(animate);


const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }
  
})

resizeObserver.observe(modelContainer);

async function loadModel() {
  try {
    const gltf = await loader.loadAsync('/models/wb.glb');
    model = gltf.scene;

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    model.position.sub(center);
    model.position.set(-10.0, -14.0, 0); 
    
    const maxDim = Math.max(size.x, size.y, size.z);    
    const targetSize = 14.0;  
    const scaleFactor = targetSize / maxDim;
    model.scale.multiplyScalar(scaleFactor);
    model.rotation.z = Math.PI * 0.40;
    model.rotation.y = (Math.PI * 0.40)
    scene.add(model);
    
    console.log('Model loaded and rendered successfully!');
  } catch (error) {
    console.error(`An error occured while loading the GLB: ${error}`);
  }
}

loadModel();

