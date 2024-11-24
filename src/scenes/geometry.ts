import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Pane } from "tweakpane";

function createScene() {
  return new THREE.Scene();
}

function createCustomTriangle(tweakPane: Pane) {
  // * Define the vertices of the triangle
  // * Each vertex is represented by 3 numbers (x, y, z)
  const vertices = new Float32Array([0, 0, 0, 0, 2, 0, 2, 0, 0]);

  // * Define the indices for the faces of the triangle
  const indices = [0, 1, 2];

  // * Create a BufferGeometry and set the position and index attributes
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals(); // Optional: Compute normals for better lighting

  // * Create a material
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide, // Ensure both sides of the triangle are rendered
  });

  // * Create a mesh with the geometry and material
  const triangle = new THREE.Mesh(geometry, material);

  const params = { color: 0xff0000 };
  const tweakFolder = tweakPane.addFolder({ title: "Triangle" });
  tweakFolder.addBinding(params, "color", { view: "color" });
  tweakFolder.on("change", () => {
    triangle.material.color.set(params.color);
  });

  return triangle;
}

function createSphereGeometry(tweakPane: Pane) {
  const geometry = new THREE.SphereGeometry(1, 32, 32); // Radius, widthSegments, heightSegments
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  });
  const sphere = new THREE.Mesh(geometry, material);

  // * Add a folder to tweak the sphere's properties
  const params = {
    radius: 1,
    widthSegments: 32,
    heightSegments: 32,
    color: 0x00ff00,
  };
  const tweakFolder = tweakPane.addFolder({ title: "Sphere" });
  tweakFolder.addBinding(params, "radius", {
    label: "Radius",
    min: 0.1,
    max: 5,
    step: 0.1,
  });
  const segmentParams = { min: 1, max: 64, step: 1 };
  tweakFolder.addBinding(params, "widthSegments", {
    label: "Width Segments",
    ...segmentParams,
  });
  tweakFolder.addBinding(params, "heightSegments", {
    label: "Height Segments",
    ...segmentParams,
  });
  tweakFolder.addBinding(params, "color", { view: "color" });

  tweakFolder.on("change", () => {
    sphere.geometry.dispose();
    const args = Object.values(params);
    sphere.geometry = new THREE.SphereGeometry(...args);
    sphere.material.color.set(params.color);
  });

  return sphere;
}

function createPlaneGeometry(tweakPane: Pane) {
  const geometry = new THREE.PlaneGeometry(2, 2, 1, 1); // Width, height, widthSegments, heightSegments
  const material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);

  const params = {
    width: 2,
    height: 2,
    widthSegments: 1,
    heightSegments: 1,
    color: 0x0000ff,
  };
  const tweakFolder = tweakPane.addFolder({ title: "Plane" });
  tweakFolder.addBinding(params, "width", { min: 1, max: 10, step: 0.1 });
  tweakFolder.addBinding(params, "height", { min: 1, max: 10, step: 0.1 });
  tweakFolder.addBinding(params, "widthSegments", { min: 1, max: 10, step: 1 });
  tweakFolder.addBinding(params, "heightSegments", {
    min: 1,
    max: 10,
    step: 1,
  });
  tweakFolder.addBinding(params, "color", { view: "color" });
  tweakFolder.on("change", () => {
    plane.geometry.dispose();
    plane.geometry = new THREE.PlaneGeometry(
      params.width,
      params.height,
      params.widthSegments,
      params.heightSegments
    );
    plane.material.color.set(params.color);
  });

  return plane;
}

function createTorusGeometry(tweakPane: Pane) {
  const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100); // Radius, tube, radialSegments, tubularSegments
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: true,
  });
  const torus = new THREE.Mesh(geometry, material);

  const params = {
    radius: 0.5,
    tube: 0.2,
    radialSegments: 16,
    tubularSegments: 100,
    color: 0xffff00,
  };
  const tweakFolder = tweakPane.addFolder({ title: "Torus" });
  tweakFolder.addBinding(params, "radius", { min: 0.1, max: 5, step: 0.1 });
  tweakFolder.addBinding(params, "tube", { min: 0.1, max: 5, step: 0.1 });
  tweakFolder.addBinding(params, "radialSegments", {
    min: 1,
    max: 64,
    step: 1,
  });
  tweakFolder.addBinding(params, "tubularSegments", {
    min: 1,
    max: 200,
    step: 1,
  });
  tweakFolder.addBinding(params, "color", { view: "color" });
  tweakFolder.on("change", () => {
    torus.geometry.dispose();
    torus.geometry = new THREE.TorusGeometry(
      params.radius,
      params.tube,
      params.radialSegments,
      params.tubularSegments
    );
    torus.material.color.set(params.color);
  });

  return torus;
}

function createCamera() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 10000);
  camera.position.set(0, 10, 10);
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

export default async function initScene() {
  const scene = createScene();

  const pane = new Pane();
  const triangle = createCustomTriangle(pane);
  const sphere = createSphereGeometry(pane);
  const plane = createPlaneGeometry(pane);
  const torus = createTorusGeometry(pane);

  sphere.position.set(4, 1, 0);
  plane.position.set(-2, 1, 0);
  torus.position.set(-4, 1, 0);

  scene.add(triangle);
  scene.add(sphere);
  scene.add(plane);
  scene.add(torus);

  const camera = createCamera();
  const { canvas, renderer } = createRenderer();
  const controls = createControls(camera, renderer);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    return requestAnimationFrame(animate);
  }
  const animateHandle = animate();

  handleResize(camera, renderer);

  const { devicePixelRatio } = window;
  console.log({ scene, triangle, canvas, OrbitControls, devicePixelRatio });

  return () => {
    cancelAnimationFrame(animateHandle);
    window.onresize = null;
    camera.clear();
    renderer.dispose();
    controls.dispose();
    pane.dispose();
    scene.clear();
    canvas.remove();
  };
}
