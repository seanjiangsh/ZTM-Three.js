import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function createScene() {
  return new THREE.Scene();
}

type CubeOptions = {
  width?: number;
  height?: number;
  depth?: number;
  cubeColor?: THREE.ColorRepresentation;
  edgeColor?: THREE.ColorRepresentation;
  wireframe?: boolean;
};
function createCube(options?: CubeOptions) {
  const width = options?.width || 1;
  const height = options?.height || 1;
  const depth = options?.depth || 1;
  const cubeColor = options?.cubeColor || 0xff0000;
  const edgeColor = options?.edgeColor;
  const wireframe = options?.wireframe || false;

  const cubeGeometry = new THREE.BoxGeometry(width, height, depth);
  const cubeMaterial = new THREE.MeshBasicMaterial({
    color: cubeColor,
    wireframe,
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

  const cubeGroup = new THREE.Group();
  cubeGroup.add(cube);

  if (edgeColor !== undefined) {
    const edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: edgeColor });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    cubeGroup.add(edges);
  }

  return cubeGroup;
}

function createCamera() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 10000);
  camera.position.set(0, 5, 5);
  return camera;
}

function createRenderer() {
  const canvas = document.createElement("canvas");
  canvas.className = "threejs";
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  return { canvas, renderer };
}

function createControls(
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  autoRotate?: boolean
) {
  const controls = new OrbitControls(camera, renderer.domElement);
  if (autoRotate) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
  }
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  return controls;
}

function addAxesHelper(scene: THREE.Scene) {
  // * Add axes helper, x-axis is red, y-axis is green, z-axis is blue
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

function animateMeshRotate(
  mesh: THREE.Object3D,
  deltaTime: number,
  axis: "x" | "y" | "z",
  degreesPerSecond: number
) {
  const fps = 1 / deltaTime;
  const degreesPerFrame = degreesPerSecond / fps;
  mesh.rotation[axis] += THREE.MathUtils.degToRad(degreesPerFrame);
}

function oscillationMeshSize(
  mesh: THREE.Object3D,
  elapsedTime: number,
  axis: "x" | "y" | "z",
  scales: { min: number; max: number },
  frequency = 1
) {
  const { min: minScale, max: maxScale } = scales;
  const angularFrequency = frequency * Math.PI * 2;
  // * the factor is between 0 and 1
  const factor = (Math.sin(elapsedTime * angularFrequency) + 1) / 2;
  const newScale = factor * (maxScale - minScale) + minScale;
  // console.log({ factor, newScale, elapsedTime });
  mesh.scale[axis] = newScale;
}

export default async function initScene() {
  const scene = createScene();

  const cube1 = createCube({ wireframe: true });
  const cube2 = createCube({ cubeColor: 0x00ff00, edgeColor: 0x000000 });
  const cube3 = createCube({ cubeColor: 0x0000ff, edgeColor: 0x000000 });
  cube2.position.x = 2;
  cube3.position.x = -2;

  const cubeGroup = new THREE.Group();
  cubeGroup.add(cube1);
  cubeGroup.add(cube2);
  cubeGroup.add(cube3);

  // * Rotate a cube, default order is XYZ
  cube1.rotation.reorder("YXZ");
  // * set rotation along y-axis to 45 degrees, x-axis to 15 degrees
  cube1.rotation.y = THREE.MathUtils.degToRad(45);
  cube1.rotation.x = THREE.MathUtils.degToRad(-15);
  scene.add(cubeGroup);

  const camera = createCamera();
  const { canvas, renderer } = createRenderer();
  const controls = createControls(camera, renderer);

  const animateClock = new THREE.Clock();
  let previouseElapsedTime = 0;

  function animate() {
    const elapsedTime = animateClock.getElapsedTime();
    const deltaTime = elapsedTime - previouseElapsedTime;
    previouseElapsedTime = elapsedTime;

    // * Animate the cube rotation
    animateMeshRotate(cube2, deltaTime, "z", -90);
    animateMeshRotate(cube2, deltaTime, "y", -90);

    // * Animate the cube size oscillation
    oscillationMeshSize(cube3, elapsedTime, "x", { min: 1, max: 2 });

    controls.update();
    renderer.render(scene, camera);
    return requestAnimationFrame(animate);
  }
  const animateHandle = animate();

  handleResize(camera, renderer);

  // * Add axes helper, x-axis is red, y-axis is green, z-axis is blue
  addAxesHelper(scene);

  const { devicePixelRatio } = window;
  console.log({ scene, cubeGroup, canvas, OrbitControls, devicePixelRatio });

  return () => {
    cancelAnimationFrame(animateHandle);
    window.onresize = null;
    scene.clear();
    camera.clear();
    renderer.dispose();
    controls.dispose();
    canvas.remove();
  };
}
