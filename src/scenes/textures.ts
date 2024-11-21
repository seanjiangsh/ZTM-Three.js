import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { FolderApi, Pane } from "tweakpane";

function createScene() {
  const scene = new THREE.Scene();
  return scene;
}

type LoadedTexture = {
  albedo: THREE.Texture;
  ao: THREE.Texture;
  height: THREE.Texture;
  metallic: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
};
function loadTextures() {
  const TL = new THREE.TextureLoader();
  const base = "/textures";
  const grass = `${base}/whispy-grass-meadow-bl`;
  const boulder = `${base}/badlands-boulders-bl`;
  const spceCruiser = `${base}/space-cruiser-panels2-bl`;

  const textures = {
    grass: {
      albedo: TL.load(`${grass}/wispy-grass-meadow_albedo.png`),
      ao: TL.load(`${grass}/wispy-grass-meadow_ao.png`),
      height: TL.load(`${grass}/wispy-grass-meadow_height.png`),
      metallic: TL.load(`${grass}/wispy-grass-meadow_metallic.png`),
      normal: TL.load(`${grass}/wispy-grass-meadow_normal-ogl.png`),
      roughness: TL.load(`${grass}/wispy-grass-meadow_roughness.png`),
    },
    boulder: {
      albedo: TL.load(`${boulder}/badlands-boulders_albedo.png`),
      ao: TL.load(`${boulder}/badlands-boulders_ao.png`),
      height: TL.load(`${boulder}/badlands-boulders_height.png`),
      metallic: TL.load(`${boulder}/badlands-boulders_metallic.png`),
      normal: TL.load(`${boulder}/badlands-boulders_normal-ogl.png`),
      roughness: TL.load(`${boulder}/badlands-boulders_roughness.png`),
    },
    spaceCruiser: {
      albedo: TL.load(`${spceCruiser}/space-cruiser-panels2_albedo.png`),
      ao: TL.load(`${spceCruiser}/space-cruiser-panels2_ao.png`),
      height: TL.load(`${spceCruiser}/space-cruiser-panels2_height.png`),
      metallic: TL.load(`${spceCruiser}/space-cruiser-panels2_metallic.png`),
      normal: TL.load(`${spceCruiser}/space-cruiser-panels2_normal-ogl.png`),
      roughness: TL.load(`${spceCruiser}/space-cruiser-panels2_roughness.png`),
    },
  };

  textures.grass.albedo.colorSpace = THREE.SRGBColorSpace;
  textures.boulder.albedo.colorSpace = THREE.SRGBColorSpace;
  textures.spaceCruiser.albedo.colorSpace = THREE.SRGBColorSpace;

  return textures;
}

function createAmbientLight(tweakFolder: FolderApi) {
  const light = new THREE.AmbientLight(0xffffff, 2.5);

  const folder = tweakFolder.addFolder({ title: "Ambient Light" });
  folder.addBinding(light, "color", { view: "color" });
  folder.addBinding(light, "intensity", { min: 0, max: 5, step: 0.1 });

  return light;
}

function createPointLight(tweakFolder: FolderApi) {
  const light = new THREE.PointLight(0xffffff, 5);
  light.position.set(0, 1, 1);

  const folder = tweakFolder.addFolder({ title: "Point Light" });
  folder.addBinding(light, "color", { view: "color" });
  folder.addBinding(light, "intensity", { min: 0, max: 10, step: 0.1 });
  folder.addBinding(light, "position", { min: -10, max: 10, step: 0.2 });

  return light;
}

function createSphereGeometry(
  name: string,
  tweakFolder: FolderApi,
  texture: LoadedTexture
) {
  const geometry = new THREE.SphereGeometry(0.7, 32, 32);

  // set uv2 attribute for AO (Ambient Occlusion) map
  const { uv } = geometry.attributes;
  const uv2Geometry = new THREE.BufferAttribute(uv.array, 2);
  geometry.setAttribute("uv2", uv2Geometry);

  const material = new THREE.MeshStandardMaterial();
  const { albedo, metallic, normal, roughness, ao, height } = texture;
  material.map = albedo;
  material.metalnessMap = metallic;
  material.normalMap = normal;
  material.roughnessMap = roughness;
  material.aoMap = ao;
  material.displacementMap = height;
  material.displacementScale = 0.1;

  const sphere = new THREE.Mesh(geometry, material);

  const folder = tweakFolder.addFolder({ title: name });
  const tweakCfg = { min: 0, max: 1, step: 0.01 };
  folder.addBinding(material, "metalness", tweakCfg);
  folder.addBinding(material, "roughness", tweakCfg);
  folder.addBinding(material, "displacementScale", tweakCfg);
  folder.addBinding(material, "aoMapIntensity", tweakCfg);

  return sphere;
}

function createCubeGeometry(
  name: string,
  tweakFolder: FolderApi,
  texture: LoadedTexture
) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  // * add texture to material
  // set uv2 attribute for AO (Ambient Occlusion) map
  const { uv } = geometry.attributes;
  const uv2Geometry = new THREE.BufferAttribute(uv.array, 2);
  geometry.setAttribute("uv2", uv2Geometry);

  const material = new THREE.MeshStandardMaterial();
  const { albedo, metallic, normal, roughness, ao } = texture;
  material.map = albedo;
  material.metalnessMap = metallic;
  material.normalMap = normal;
  material.roughnessMap = roughness;
  material.aoMap = ao;

  // * Displacement map will displace the vertices of the geometry
  // material.displacementMap = grass.height;
  // material.displacementScale = 0.1;

  const cube = new THREE.Mesh(geometry, material);

  const folder = tweakFolder.addFolder({ title: name, expanded: false });
  const tweakCfg = { min: 0, max: 1, step: 0.01 };
  folder.addBinding(material, "metalness", tweakCfg);
  folder.addBinding(material, "roughness", tweakCfg);
  // folder.addBinding(material, "displacementScale", tweakCfg);
  folder.addBinding(material, "aoMapIntensity", tweakCfg);

  return cube;
}

function createConeGeometry(
  name: string,
  tweakFolder: FolderApi,
  texture: LoadedTexture
) {
  const geometry = new THREE.ConeGeometry(1, 1, 32, 1);

  // set uv2 attribute for AO (Ambient Occlusion) map
  const { uv } = geometry.attributes;
  const uv2Geometry = new THREE.BufferAttribute(uv.array, 2);
  geometry.setAttribute("uv2", uv2Geometry);

  const material = new THREE.MeshStandardMaterial();
  const { albedo, metallic, normal, roughness, ao, height } = texture;
  material.map = albedo;
  material.metalnessMap = metallic;
  material.normalMap = normal;
  material.roughnessMap = roughness;
  material.aoMap = ao;
  // material.displacementMap = height;
  // material.displacementScale = 0.1;

  const cone = new THREE.Mesh(geometry, material);

  const folder = tweakFolder.addFolder({ title: name, expanded: false });
  const tweakCfg = { min: 0, max: 1, step: 0.01 };
  folder.addBinding(material, "metalness", tweakCfg);
  folder.addBinding(material, "roughness", tweakCfg);
  // folder.addBinding(material, "displacementScale", tweakCfg);
  folder.addBinding(material, "aoMapIntensity", tweakCfg);

  return cone;
}

function createTorusKnotGeometry(
  name: string,
  tweakFolder: FolderApi,
  texture: LoadedTexture
) {
  const geometry = new THREE.TorusKnotGeometry(0.5, 0.1, 128, 32);

  // set uv2 attribute for AO (Ambient Occlusion) map
  const { uv } = geometry.attributes;
  const uv2Geometry = new THREE.BufferAttribute(uv.array, 2);
  geometry.setAttribute("uv2", uv2Geometry);

  const material = new THREE.MeshStandardMaterial();
  const { albedo, metallic, normal, roughness, ao, height } = texture;
  material.map = albedo;
  material.metalnessMap = metallic;
  material.normalMap = normal;
  material.roughnessMap = roughness;
  material.aoMap = ao;
  material.displacementMap = height;
  material.displacementScale = 0.1;

  const torusKnot = new THREE.Mesh(geometry, material);

  const folder = tweakFolder.addFolder({ title: name, expanded: false });
  const tweakCfg = { min: 0, max: 1, step: 0.01 };
  folder.addBinding(material, "metalness", tweakCfg);
  folder.addBinding(material, "roughness", tweakCfg);
  folder.addBinding(material, "displacementScale", tweakCfg);
  folder.addBinding(material, "aoMapIntensity", tweakCfg);

  return torusKnot;
}

function createTetrahedronGeometry(
  name: string,
  tweakFolder: FolderApi,
  texture: LoadedTexture
) {
  const geometry = new THREE.TetrahedronGeometry(1);

  // set uv2 attribute for AO (Ambient Occlusion) map
  const { uv } = geometry.attributes;
  const uv2Geometry = new THREE.BufferAttribute(uv.array, 2);
  geometry.setAttribute("uv2", uv2Geometry);

  const material = new THREE.MeshStandardMaterial();
  const { albedo, metallic, normal, roughness, ao, height } = texture;
  material.map = albedo;
  material.metalnessMap = metallic;
  material.normalMap = normal;
  material.roughnessMap = roughness;
  material.aoMap = ao;
  // material.displacementMap = height;
  // material.displacementScale = 0.1;

  const tetrahedron = new THREE.Mesh(geometry, material);

  const folder = tweakFolder.addFolder({ title: name, expanded: false });
  const tweakCfg = { min: 0, max: 1, step: 0.01 };
  folder.addBinding(material, "metalness", tweakCfg);
  folder.addBinding(material, "roughness", tweakCfg);
  // folder.addBinding(material, "displacementScale", tweakCfg);
  folder.addBinding(material, "aoMapIntensity", tweakCfg);

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

function animateMeshesRotate(
  group: THREE.Group,
  deltaTime: number,
  axis: "x" | "y" | "z",
  degreesPerSecond: number
) {
  const fps = 1 / deltaTime;
  const degreesPerFrame = degreesPerSecond / fps;
  group.children.forEach((child) => {
    if (child instanceof THREE.Mesh) {
      child.rotation[axis] += THREE.MathUtils.degToRad(degreesPerFrame);
    }
  });
}

export default function initScene() {
  const scene = createScene();

  const pane = new Pane();
  const tweakFolder = pane.addFolder({ title: "Controls" });

  // * Light
  const lightFolder = tweakFolder.addFolder({
    title: "Light",
    expanded: false,
  });
  const ambientLight = createAmbientLight(lightFolder);
  const pointLight = createPointLight(lightFolder);
  scene.add(ambientLight);
  scene.add(pointLight);

  // * Load textures
  const textures = loadTextures();
  const { grass, boulder, spaceCruiser } = textures;

  // * Fog
  // Fog will gradually fade out objects as they move further away
  // default material has fog property set to true, set to false to disable fog
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 5, 20);

  // * Geometry
  const meshFolder = tweakFolder.addFolder({ title: "Mesh" });
  const sphere = createSphereGeometry("Grass Sphere", meshFolder, grass);
  const sphere2 = createSphereGeometry("Boulder Sphere", meshFolder, boulder);
  const sphere3 = createSphereGeometry(
    "Space Cruiser Sphere",
    meshFolder,
    spaceCruiser
  );
  const cube = createCubeGeometry(
    "Space Cruiser Cube",
    meshFolder,
    spaceCruiser
  );
  const cone = createConeGeometry("Boulder Cone", meshFolder, boulder);
  const torusKnot = createTorusKnotGeometry(
    "Grass Torus Knot",
    meshFolder,
    grass
  );
  const tetrahedron = createTetrahedronGeometry(
    "Space Cruiser Tetrahedron",
    meshFolder,
    spaceCruiser
  );
  sphere2.position.x = 2;
  sphere3.position.x = -2;
  cube.position.x = 4;
  cone.position.x = 6;
  torusKnot.position.x = -4;
  tetrahedron.position.x = -6;

  const group = new THREE.Group();
  group.add(sphere, sphere2, sphere3, cube, cone, torusKnot, tetrahedron);

  scene.add(group);

  addAxesHelper(scene);

  const camera = createCamera();
  const canvas = document.querySelector("canvas.threejs") as HTMLCanvasElement;
  const renderer = createRenderer(canvas);
  const controls = createControls(camera, renderer);

  const animateClock = new THREE.Clock();
  let previouseElapsedTime = 0;

  function animate() {
    // // * Rotate meshes
    // const elapsedTime = animateClock.getElapsedTime();
    // const deltaTime = elapsedTime - previouseElapsedTime;
    // previouseElapsedTime = elapsedTime;
    // animateMeshesRotate(group, deltaTime, "y", 30);

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
