import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { Pane } from "tweakpane";

function createScene() {
  const scene = new THREE.Scene();
  return scene;
}

function createPhysicalMaterial(tweakPane: Pane) {
  const params = {
    color: 0x049ef4,
    transparent: true,
    opacity: 1,
    metalness: 0.5,
    roughness: 0.5,
    reflectivity: 0.5,
    clearcoat: 0.5,
  };

  const material = new THREE.MeshPhysicalMaterial(params);

  const tweakFolder = tweakPane.addFolder({ title: "Material Properties" });
  tweakFolder.addBinding(params, "color", { view: "color" });
  tweakFolder.addBinding(params, "opacity", { min: 0, max: 1, step: 0.1 });
  tweakFolder.addBinding(params, "metalness", { min: 0, max: 1, step: 0.1 });
  tweakFolder.addBinding(params, "roughness", { min: 0, max: 1, step: 0.1 });
  tweakFolder.addBinding(params, "reflectivity", { min: 0, max: 1, step: 0.1 });
  tweakFolder.addBinding(params, "clearcoat", { min: 0, max: 1, step: 0.1 });
  tweakFolder.on("change", () => {
    material.color.set(params.color);
    material.opacity = params.opacity;
    material.metalness = params.metalness;
    material.roughness = params.roughness;
    material.reflectivity = params.reflectivity;
    material.clearcoat = params.clearcoat;
  });

  return material;
}

function createAmbientLight(tweakPane: Pane) {
  const light = new THREE.AmbientLight(0xffffff, 0.5);

  const tweakFolder = tweakPane.addFolder({ title: "Ambient Light" });
  tweakFolder.addBinding(light, "color", { view: "color" });
  tweakFolder.addBinding(light, "intensity", { min: 0, max: 5, step: 0.1 });

  return light;
}

function createPointLight(tweakPane: Pane) {
  const light = new THREE.PointLight(0xffffff, 5);
  light.position.set(0, 1, -1);

  const tweakFolder = tweakPane.addFolder({ title: "Point Light" });
  tweakFolder.addBinding(light, "color", { view: "color" });
  tweakFolder.addBinding(light, "intensity", { min: 0, max: 10, step: 0.1 });
  tweakFolder.addBinding(light, "position", { min: -10, max: 10, step: 0.2 });

  return light;
}

function createCubeGeometry(
  tweakPane: Pane,
  material: THREE.MeshPhysicalMaterial
) {
  const params = { width: 1, height: 1, depth: 1 };
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const cube = new THREE.Mesh(geometry, material);

  const tweakFolder = tweakPane.addFolder({ title: "Cube" });
  tweakFolder.addBinding(params, "width", { min: 0.1, max: 5, step: 0.1 });
  tweakFolder.addBinding(params, "height", { min: 0.1, max: 5, step: 0.1 });
  tweakFolder.addBinding(params, "depth", { min: 0.1, max: 5, step: 0.1 });
  tweakFolder.on("change", () => {
    cube.geometry.dispose();
    cube.geometry = new THREE.BoxGeometry(
      params.width,
      params.height,
      params.depth
    );
  });
  tweakFolder.expanded = false; // Collapse the folder

  return cube;
}

function createSphereGeometry(
  tweakPane: Pane,
  material: THREE.MeshPhysicalMaterial
) {
  const params = {
    radius: 0.7,
    widthSegments: 32,
    heightSegments: 32,
    phiStart: 0,
    phiLength: Math.PI * 2,
    thetaStart: 0,
    thetaLength: Math.PI,
  };
  const geometry = new THREE.SphereGeometry(
    params.radius,
    params.widthSegments,
    params.heightSegments
  );
  const sphere = new THREE.Mesh(geometry, material);

  const tweakFolder = tweakPane.addFolder({ title: "Sphere" });
  tweakFolder.addBinding(params, "radius", { min: 0.1, max: 5, step: 0.1 });
  tweakFolder.addBinding(params, "widthSegments", { min: 3, max: 64, step: 1 });
  tweakFolder.addBinding(params, "heightSegments", {
    min: 2,
    max: 64,
    step: 1,
  });
  tweakFolder.addBinding(params, "phiStart", {
    min: 0,
    max: Math.PI * 2,
    step: 0.1,
  });
  tweakFolder.addBinding(params, "phiLength", {
    min: 0,
    max: Math.PI * 2,
    step: 0.1,
  });
  tweakFolder.addBinding(params, "thetaStart", {
    min: 0,
    max: Math.PI,
    step: 0.1,
  });
  tweakFolder.addBinding(params, "thetaLength", {
    min: 0,
    max: Math.PI,
    step: 0.1,
  });
  tweakFolder.on("change", () => {
    sphere.geometry.dispose();
    sphere.geometry = new THREE.SphereGeometry(
      params.radius,
      params.widthSegments,
      params.heightSegments,
      params.phiStart,
      params.phiLength,
      params.thetaStart,
      params.thetaLength
    );
  });
  tweakFolder.expanded = false; // Collapse the folder

  return sphere;
}

function createConeGeometry(
  tweakPane: Pane,
  material: THREE.MeshPhysicalMaterial
) {
  const params = {
    radius: 1,
    height: 1,
    radialSegments: 32,
    heightSegments: 1,
    openEnded: false,
    thetaStart: 0,
    thetaLength: Math.PI * 2,
  };
  const geometry = new THREE.ConeGeometry(
    params.radius,
    params.height,
    params.radialSegments,
    params.heightSegments,
    params.openEnded,
    params.thetaStart,
    params.thetaLength
  );
  const cone = new THREE.Mesh(geometry, material);

  const tweakFolder = tweakPane.addFolder({ title: "Cone" });
  tweakFolder.addBinding(params, "radius", { min: 0.1, max: 5, step: 0.1 });
  tweakFolder.addBinding(params, "height", { min: 0.1, max: 5, step: 0.1 });
  tweakFolder.addBinding(params, "radialSegments", {
    min: 3,
    max: 64,
    step: 1,
  });
  tweakFolder.addBinding(params, "heightSegments", {
    min: 1,
    max: 64,
    step: 1,
  });
  tweakFolder.addBinding(params, "thetaStart", {
    min: 0,
    max: Math.PI * 2,
    step: 0.1,
  });
  tweakFolder.addBinding(params, "thetaLength", {
    min: 0,
    max: Math.PI * 2,
    step: 0.1,
  });
  tweakFolder.on("change", () => {
    cone.geometry.dispose();
    cone.geometry = new THREE.ConeGeometry(
      params.radius,
      params.height,
      params.radialSegments,
      params.heightSegments,
      params.openEnded,
      params.thetaStart,
      params.thetaLength
    );
  });
  tweakFolder.expanded = false; // Collapse the folder

  return cone;
}

function createTorusKnotGeometry(
  tweakPane: Pane,
  material: THREE.MeshPhysicalMaterial
) {
  const params = {
    radius: 0.5,
    tube: 0.1,
    tubularSegments: 128,
    radialSegments: 32,
    p: 2,
    q: 3,
  };
  const geometry = new THREE.TorusKnotGeometry(
    params.radius,
    params.tube,
    params.tubularSegments,
    params.radialSegments,
    params.p,
    params.q
  );
  const torusKnot = new THREE.Mesh(geometry, material);

  const tweakFolder = tweakPane.addFolder({ title: "Torus Knot" });
  tweakFolder.addBinding(params, "radius", { min: 0.1, max: 5, step: 0.1 });
  tweakFolder.addBinding(params, "tube", { min: 0.1, max: 5, step: 0.1 });
  tweakFolder.addBinding(params, "tubularSegments", {
    min: 3,
    max: 300,
    step: 1,
  });
  tweakFolder.addBinding(params, "radialSegments", {
    min: 3,
    max: 64,
    step: 1,
  });
  tweakFolder.addBinding(params, "p", { min: 1, max: 10, step: 1 });
  tweakFolder.addBinding(params, "q", { min: 1, max: 10, step: 1 });
  tweakFolder.on("change", () => {
    torusKnot.geometry.dispose();
    torusKnot.geometry = new THREE.TorusKnotGeometry(
      params.radius,
      params.tube,
      params.tubularSegments,
      params.radialSegments,
      params.p,
      params.q
    );
  });
  tweakFolder.expanded = false; // Collapse the folder

  return torusKnot;
}

function createTetrahedronGeometry(
  tweakPane: Pane,
  material: THREE.MeshPhysicalMaterial
) {
  const params = { radius: 1 };
  const geometry = new THREE.TetrahedronGeometry(1); // Radius
  const tetrahedron = new THREE.Mesh(geometry, material);

  const tweakFolder = tweakPane.addFolder({ title: "Tetrahedron" });
  tweakFolder.addBinding(params, "radius", { min: 0.1, max: 5, step: 0.1 });
  tweakFolder.on("change", () => {
    tetrahedron.geometry.dispose();
    tetrahedron.geometry = new THREE.TetrahedronGeometry(params.radius);
  });
  tweakFolder.expanded = false; // Collapse the folder

  return tetrahedron;
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

export default function initScene() {
  const scene = createScene();
  const pane = new Pane();
  const material = createPhysicalMaterial(pane);

  // * Light
  const ambientLight = createAmbientLight(pane);
  const pointLight = createPointLight(pane);
  scene.add(ambientLight);
  scene.add(pointLight);

  // * Fog
  // Fog will gradually fade out objects as they move further away
  // default material has fog property set to true, set to false to disable fog
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 5, 20);

  const cube = createCubeGeometry(pane, material);
  const sphere = createSphereGeometry(pane, material);
  const cone = createConeGeometry(pane, material);
  const torusKnot = createTorusKnotGeometry(pane, material);
  const tetrahedron = createTetrahedronGeometry(pane, material);
  sphere.position.x = 2;
  cone.position.x = 4;
  torusKnot.position.x = -2;
  tetrahedron.position.x = -4;

  scene.add(cube);
  scene.add(sphere);
  scene.add(cone);
  scene.add(torusKnot);
  scene.add(tetrahedron);

  addAxesHelper(scene);

  const camera = createCamera();
  const canvas = document.querySelector("canvas.threejs") as HTMLCanvasElement;
  const renderer = createRenderer(canvas);
  const controls = createControls(camera, renderer);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    return requestAnimationFrame(animate);
  }
  const animateHandle = animate();

  handleResize(camera, renderer);

  const { devicePixelRatio } = window;
  console.log({ scene, canvas, OrbitControls, devicePixelRatio });

  return () => {
    cancelAnimationFrame(animateHandle);
    window.onresize = null;
    scene.clear();
    renderer.dispose();
    controls.dispose();
  };
}
