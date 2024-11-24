import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
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
function loadTextures(): { [key: string]: LoadedTexture } {
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

function getClonedTextures(textures: { [key: string]: LoadedTexture }) {
  const clonedTextures: { [key: string]: LoadedTexture } = {};
  for (const [key, value] of Object.entries(textures)) {
    clonedTextures[key] = {
      albedo: value.albedo.clone(),
      ao: value.ao.clone(),
      height: value.height.clone(),
      metallic: value.metallic.clone(),
      normal: value.normal.clone(),
      roughness: value.roughness.clone(),
    };
  }

  return clonedTextures;
}

function createAmbientLight(tweakFolder: FolderApi) {
  const light = new THREE.AmbientLight(0xffffff, 1);
  const folder = tweakFolder.addFolder({
    title: "Ambient Light",
    expanded: false,
  });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });

  return light;
}

function createHemisphereLight(tweakFolder: FolderApi) {
  const light = new THREE.HemisphereLight(0x3434eb, 0xe88502, 5);
  const folder = tweakFolder.addFolder({ title: "Hemisphere Light" });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "groundColor", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });

  return light;
}

function createDirectionalLight(
  tweakFolder: FolderApi
): [THREE.DirectionalLight, THREE.Object3D] {
  const light = new THREE.DirectionalLight(0x4ae86f, 1);
  light.position.set(8, 0, 0);

  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(0, 10, 0);
  light.target = lightTarget;

  const folder = tweakFolder.addFolder({ title: "Directional Light" });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });
  folder.addBinding(light, "position", { min: -10, max: 10, step: 0.2 });
  folder.addBinding(lightTarget, "position", { min: -10, max: 10, step: 0.2 });

  return [light, lightTarget];
}

function createPointLight(tweakFolder: FolderApi) {
  const light = new THREE.PointLight(0xffffff, 5, 10, 2);
  light.position.set(0, 2, 2);

  const folder = tweakFolder.addFolder({ title: "Point Light" });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });
  folder.addBinding(light, "distance", { min: 0, max: 50, step: 0.1 });
  folder.addBinding(light, "position", { min: -10, max: 10, step: 0.2 });
  folder.addBinding(light, "decay", { min: 0, max: 10, step: 0.01 });

  return light;
}

function createSpotLight(
  tweakFolder: FolderApi
): [THREE.SpotLight, THREE.Object3D] {
  const light = new THREE.SpotLight(0xffffff, 20, 10);
  light.position.set(-5, 5, 0);
  light.angle = 0.5;
  light.decay = 1;

  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(-5, 0, 0);
  light.target = lightTarget;

  const folder = tweakFolder.addFolder({ title: "Spot Light" });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });
  folder.addBinding(light, "distance", { min: 0, max: 50, step: 0.1 });
  folder.addBinding(light, "angle", { min: 0, max: Math.PI, step: 0.01 });
  folder.addBinding(light, "penumbra", { min: 0, max: 1, step: 0.01 });
  folder.addBinding(light, "position", { min: -10, max: 10, step: 0.2 });
  folder.addBinding(light, "decay", { min: 0, max: 10, step: 0.01 });

  return [light, lightTarget];
}

function createRectAreaLight(tweakFolder: FolderApi) {
  const light = new THREE.RectAreaLight(0x30fff1, 5, 5, 5);
  light.position.set(0, 5, 0);
  light.lookAt(0, 0, 0);

  const folder = tweakFolder.addFolder({ title: "Rect Area Light" });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });
  folder.addBinding(light, "width", { min: 0, max: 50, step: 0.1 });
  folder.addBinding(light, "height", { min: 0, max: 50, step: 0.1 });
  folder.addBinding(light, "position", { min: -10, max: 10, step: 0.2 });

  return light;
}

function createPlaneGeometry(
  name: string,
  tweakFolder: FolderApi,
  texture: LoadedTexture
) {
  const geometry = new THREE.PlaneGeometry(1000, 1000);
  const material = new THREE.MeshStandardMaterial();
  const { albedo, metallic, normal, roughness, ao, height } = texture;

  // Apply the grass texture to the material
  material.map = albedo;
  material.metalnessMap = metallic;
  material.normalMap = normal;
  material.roughness = 0.3; // Set roughness to 0.3
  material.roughnessMap = roughness;
  material.aoMap = ao;
  material.displacementMap = height;
  material.displacementScale = 0.1;

  // Adjust texture properties to make it look natural
  albedo.wrapS = THREE.RepeatWrapping;
  albedo.wrapT = THREE.RepeatWrapping;
  albedo.repeat.set(50, 50);

  normal.wrapS = THREE.RepeatWrapping;
  normal.wrapT = THREE.RepeatWrapping;
  normal.repeat.set(50, 50);

  roughness.wrapS = THREE.RepeatWrapping;
  roughness.wrapT = THREE.RepeatWrapping;
  roughness.repeat.set(50, 50);

  ao.wrapS = THREE.RepeatWrapping;
  ao.wrapT = THREE.RepeatWrapping;
  ao.repeat.set(50, 50);

  height.wrapS = THREE.RepeatWrapping;
  height.wrapT = THREE.RepeatWrapping;
  height.repeat.set(50, 50);

  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2; // Rotate the plane to lie on the XZ plane

  const folder = tweakFolder.addFolder({ title: name, expanded: false });
  const tweakCfg = { min: 0, max: 1, step: 0.01 };
  folder.addBinding(material, "metalness", tweakCfg);
  folder.addBinding(material, "roughness", tweakCfg);
  folder.addBinding(material, "displacementScale", tweakCfg);
  folder.addBinding(material, "aoMapIntensity", tweakCfg);

  return plane;
}

function createSphereGeometry(
  name: string,
  tweakFolder: FolderApi,
  texture: LoadedTexture
) {
  const geometry = new THREE.SphereGeometry(0.7, 64, 64);

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

  const folder = tweakFolder.addFolder({ title: name, expanded: false });
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
  const geometry = new THREE.ConeGeometry(1, 1, 64, 64);

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

  const cone = new THREE.Mesh(geometry, material);

  const folder = tweakFolder.addFolder({ title: name, expanded: false });
  const tweakCfg = { min: 0, max: 1, step: 0.01 };
  folder.addBinding(material, "metalness", tweakCfg);
  folder.addBinding(material, "roughness", tweakCfg);
  folder.addBinding(material, "displacementScale", tweakCfg);
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
  camera.position.set(-10, 5, 10);
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

function addAxesHelper(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
  // * Add axes helper, x-axis is red, y-axis is green, z-axis is blue
  // Create a separate scene for the AxesHelper
  const axesScene = new THREE.Scene();
  const axesHelper = new THREE.AxesHelper(2);
  axesScene.add(axesHelper);

  // Create an orthographic camera for the AxesHelper
  const axesCamera = new THREE.OrthographicCamera(-5, 5, 5);
  axesCamera.position.set(0, 5, 10);
  axesCamera.lookAt(axesHelper.position);

  // * return the animation function
  return () => {
    // * Synchronize the AxesHelper's camera with the main camera
    axesCamera.position.copy(camera.position);
    axesCamera.quaternion.copy(camera.quaternion);
    axesCamera.updateMatrixWorld();

    // * Render the AxesHelper scene
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.setViewport(-100, 50, width / 4, height / 4);
    renderer.render(axesScene, axesCamera);
    renderer.setViewport(0, 0, width, height);
    renderer.autoClear = true;
  };
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

export default async function initScene() {
  const scene = createScene();

  const pane = new Pane();
  const tweakFolder = pane.addFolder({ title: "Controls" });

  // * Light
  const lightFolder = tweakFolder.addFolder({
    title: "Light",
    expanded: true,
  });
  const ambientLight = createAmbientLight(lightFolder);
  scene.add(ambientLight);

  const hemisphereLight = createHemisphereLight(lightFolder);
  scene.add(hemisphereLight);

  const [directionalLight, directionalLightTarget] =
    createDirectionalLight(lightFolder);
  scene.add(directionalLight);
  scene.add(directionalLightTarget);

  const pointLight = createPointLight(lightFolder);
  scene.add(pointLight);

  const [spotLight, spotLightTarget] = createSpotLight(lightFolder);
  scene.add(spotLight);
  scene.add(spotLightTarget);

  const rectAreaLight = createRectAreaLight(lightFolder);
  scene.add(rectAreaLight);

  // * Light Helpers
  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    0.2
  );
  scene.add(directionalLightHelper);

  const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
  scene.add(pointLightHelper);

  const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotLightHelper);

  const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
  scene.add(rectAreaLightHelper);

  const updateLightHelpers = () => {
    directionalLightHelper.update();
    pointLightHelper.update();
    spotLightHelper.update();
  };

  // * Load textures
  const textures = loadTextures();

  // * Fog
  // Fog will gradually fade out objects as they move further away
  // default material has fog property set to true, set to false to disable fog
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 15, 100);

  // * Plane
  const textureForPlane = getClonedTextures(textures);
  const meshFolder = tweakFolder.addFolder({ title: "Mesh", expanded: false });
  const plane = createPlaneGeometry(
    "Ground Plane",
    meshFolder,
    textureForPlane.boulder
  );

  // * Geometry
  const textureForGeometry = getClonedTextures(textures);
  const { grass, boulder, spaceCruiser } = textureForGeometry;
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
  group.position.y = 1;

  scene.add(plane, group);

  const camera = createCamera();
  const { canvas, renderer } = createRenderer();
  const controls = createControls(camera, renderer);
  const updateCtrlAndRender = () => {
    controls.update();
    renderer.render(scene, camera);
  };

  // * Axis Helper
  const updateAxesHelper = addAxesHelper(camera, renderer);

  // * Animation
  const animateClock = new THREE.Clock();
  let previouseElapsedTime = 0;
  function animate() {
    // * Rotate meshes
    const elapsedTime = animateClock.getElapsedTime();
    const deltaTime = elapsedTime - previouseElapsedTime;
    previouseElapsedTime = elapsedTime;
    animateMeshesRotate(group, deltaTime, "y", 30);

    // * Update light helpers
    updateLightHelpers();

    // * Update controls and render
    updateCtrlAndRender();

    // * Update axes helper
    updateAxesHelper();

    return requestAnimationFrame(animate);
  }
  const animateHandle = animate();

  handleResize(camera, renderer);

  const { devicePixelRatio } = window;
  console.log({ scene, canvas, OrbitControls, devicePixelRatio });

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
