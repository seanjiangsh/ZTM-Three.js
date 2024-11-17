import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function createScene() {
  return new THREE.Scene();
}

function createSphere() {
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  return new THREE.Mesh(sphereGeometry, sphereMaterial);
}

function createCamera() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 10000);
  camera.position.set(0, 5, 5);
  return camera;
}

function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
}

function createControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  return controls;
}

function addAxesHelper(scene: THREE.Scene) {
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}

function handleResize(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) {
  window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
}

export function initScene() {
  const scene = createScene();
  const sphereMesh = createSphere();
  scene.add(sphereMesh);

  const camera = createCamera();
  const canvas = document.querySelector("canvas.threejs") as HTMLCanvasElement;
  const renderer = createRenderer(canvas);
  const controls = createControls(camera, renderer);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
  handleResize(camera, renderer);
  addAxesHelper(scene);

  const { devicePixelRatio } = window;
  console.log({ scene, sphereMesh, canvas, OrbitControls, devicePixelRatio });

  return () => {
    window.onresize = null;
    scene.clear();
    renderer.dispose();
    controls.dispose();
  };
}
