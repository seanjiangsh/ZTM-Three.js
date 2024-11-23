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

const textureLoader = new THREE.TextureLoader();

function loadTexture(url: string): Promise<THREE.Texture> {
  return textureLoader.loadAsync(url);
}

async function loadTextures(): Promise<{ [key: string]: LoadedTexture }> {
  const base = "/textures";
  const grass = `${base}/whispy-grass-meadow-bl`;
  const boulder = `${base}/badlands-boulders-bl`;
  const spaceCruiser = `${base}/space-cruiser-panels2-bl`;

  const textures = {
    grass: {
      albedo: await loadTexture(`${grass}/wispy-grass-meadow_albedo.png`),
      ao: await loadTexture(`${grass}/wispy-grass-meadow_ao.png`),
      height: await loadTexture(`${grass}/wispy-grass-meadow_height.png`),
      metallic: await loadTexture(`${grass}/wispy-grass-meadow_metallic.png`),
      normal: await loadTexture(`${grass}/wispy-grass-meadow_normal-ogl.png`),
      roughness: await loadTexture(`${grass}/wispy-grass-meadow_roughness.png`),
    },
    boulder: {
      albedo: await loadTexture(`${boulder}/badlands-boulders_albedo.png`),
      ao: await loadTexture(`${boulder}/badlands-boulders_ao.png`),
      height: await loadTexture(`${boulder}/badlands-boulders_height.png`),
      metallic: await loadTexture(`${boulder}/badlands-boulders_metallic.png`),
      normal: await loadTexture(`${boulder}/badlands-boulders_normal-ogl.png`),
      roughness: await loadTexture(
        `${boulder}/badlands-boulders_roughness.png`
      ),
    },
    spaceCruiser: {
      albedo: await loadTexture(
        `${spaceCruiser}/space-cruiser-panels2_albedo.png`
      ),
      ao: await loadTexture(`${spaceCruiser}/space-cruiser-panels2_ao.png`),
      height: await loadTexture(
        `${spaceCruiser}/space-cruiser-panels2_height.png`
      ),
      metallic: await loadTexture(
        `${spaceCruiser}/space-cruiser-panels2_metallic.png`
      ),
      normal: await loadTexture(
        `${spaceCruiser}/space-cruiser-panels2_normal-ogl.png`
      ),
      roughness: await loadTexture(
        `${spaceCruiser}/space-cruiser-panels2_roughness.png`
      ),
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

function createAmbientLight(scene: THREE.Scene, tweakFolder: FolderApi) {
  const light = new THREE.AmbientLight(0xffffff, 0);

  // * Ambient light does not cast shadow

  scene.add(light);

  const folder = tweakFolder.addFolder({
    title: "Ambient Light",
    expanded: false,
  });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });

  return null; // No helper for AmbientLight
}

function createHemisphereLight(scene: THREE.Scene, tweakFolder: FolderApi) {
  const light = new THREE.HemisphereLight(0x3434eb, 0xe88502, 0);

  // * Hemisphere light does not cast shadow

  scene.add(light);

  const folder = tweakFolder.addFolder({
    title: "Hemisphere Light",
    expanded: false,
  });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "groundColor", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });

  return null; // No helper for HemisphereLight
}

function createDirectionalLight(scene: THREE.Scene, tweakFolder: FolderApi) {
  const light = new THREE.DirectionalLight(0x4ae86f, 10);
  light.position.set(8, 2, 0);

  light.castShadow = true;
  // * higher shadow map size will result in better shadow quality
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  // * set shadow radius helps to reduce jagged shadow edges
  light.shadow.radius = 5;

  scene.add(light);

  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(0, 2, 0);
  light.target = lightTarget;
  scene.add(lightTarget);

  const folder = tweakFolder.addFolder({
    title: "Directional Light",
    expanded: false,
  });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });
  folder.addBinding(light, "position", { min: -10, max: 10, step: 0.2 });

  folder
    .addFolder({ title: "target", expanded: false })
    .addBinding(lightTarget, "position", { min: -10, max: 10, step: 0.2 });

  const helper = new THREE.CameraHelper(light.shadow.camera);
  scene.add(helper);
  // * note the DirectionalLight's shadow camera is OrthographicCamera
  console.log("DirectionalLight shadow camera", light.shadow.camera);
  // * We could narrow the shadow camera frustum to reduce shadow artifacts
  // light.shadow.camera.left = 1;
  // light.shadow.camera.right = -1;
  // light.shadow.camera.top = 1;
  // light.shadow.camera.bottom = -1;

  return helper;
}

function createPointLight(scene: THREE.Scene, tweakFolder: FolderApi) {
  const light = new THREE.PointLight(0xffffff, 50, 10, 2);
  light.position.set(0, 2, 2);

  light.castShadow = true;
  // * higher shadow map size will result in better shadow quality
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  // * set shadow radius helps to reduce jagged shadow edges
  light.shadow.radius = 5;

  scene.add(light);

  const folder = tweakFolder.addFolder({
    title: "Point Light",
    expanded: false,
  });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });
  folder.addBinding(light, "distance", { min: 0, max: 50, step: 0.1 });
  folder.addBinding(light, "position", { min: -10, max: 10, step: 0.2 });
  folder.addBinding(light, "decay", { min: 0, max: 10, step: 0.01 });

  const helper = new THREE.CameraHelper(light.shadow.camera);
  scene.add(helper);
  // * note the PointLight's shadow camera is Perspective
  console.log("PointLight shadow camera", light.shadow.camera);
  // * Adjust near and far plane of the shadow camera to reduce shadow artifacts
  // light.shadow.camera.near = 1;
  // light.shadow.camera.far = 1;

  return helper;
}

function createSpotLight(scene: THREE.Scene, tweakFolder: FolderApi) {
  const light = new THREE.SpotLight(0xffffff, 20, 10);
  light.position.set(-5, 5, 0);
  light.angle = 0.5;
  light.decay = 1;

  light.castShadow = true;
  // * higher shadow map size will result in better shadow quality
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  // * set shadow radius helps to reduce jagged shadow edges
  light.shadow.radius = 5;

  scene.add(light);

  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(-5, 0, 0);
  light.target = lightTarget;
  scene.add(lightTarget);

  const folder = tweakFolder.addFolder({
    title: "Spot Light",
    expanded: false,
  });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });
  folder.addBinding(light, "distance", { min: 0, max: 50, step: 0.1 });
  folder.addBinding(light, "angle", { min: 0, max: Math.PI, step: 0.01 });
  folder.addBinding(light, "penumbra", { min: 0, max: 1, step: 0.01 });
  folder.addBinding(light, "position", { min: -10, max: 10, step: 0.2 });
  folder.addBinding(light, "decay", { min: 0, max: 10, step: 0.01 });

  // * note we are using CameraHelper for SpotLight
  const helper = new THREE.CameraHelper(light.shadow.camera);
  scene.add(helper);
  // * note the SpotLight's shadow camera is PerspectiveCamera
  console.log("SpotLight shadow camera", light.shadow.camera);

  return helper;
}

function createRectAreaLight(scene: THREE.Scene, tweakFolder: FolderApi) {
  const light = new THREE.RectAreaLight(0x30fff1, 0, 5, 5);
  light.position.set(0, 5, 0);
  light.lookAt(0, 0, 0);

  // * RectAreaLight does not cast shadow

  scene.add(light);

  const folder = tweakFolder.addFolder({
    title: "Rect Area Light",
    expanded: false,
  });
  folder.addBinding(light, "color", { color: { type: "float" } });
  folder.addBinding(light, "intensity", { min: 0, max: 100, step: 0.1 });
  folder.addBinding(light, "width", { min: 0, max: 50, step: 0.1 });
  folder.addBinding(light, "height", { min: 0, max: 50, step: 0.1 });
  folder.addBinding(light, "position", { min: -10, max: 10, step: 0.2 });

  const helper = new RectAreaLightHelper(light);
  scene.add(helper);

  return helper;
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
  // * Enable shadow
  plane.receiveShadow = true;

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
  // * Enable shadow
  sphere.castShadow = true;
  sphere.receiveShadow = true;

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
  // * Enable shadow
  cube.castShadow = true;
  cube.receiveShadow = true;

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
  // * Enable shadow
  cone.castShadow = true;
  cone.receiveShadow = true;

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
  // * Enable shadow
  torusKnot.castShadow = true;
  torusKnot.receiveShadow = true;

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
  // * Enable shadow
  tetrahedron.castShadow = true;
  tetrahedron.receiveShadow = true;

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

function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // * Enable shadow mapping
  renderer.shadowMap.enabled = true;
  // * there are 3 types of shadow map: BasicShadowMap, PCFShadowMap, PCFSoftShadowMap
  // * PCFSoftShadowMap is the best quality, but ignores the radius property of the shadow
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
  const lightFolder = tweakFolder.addFolder({ title: "Light" });
  createAmbientLight(scene, lightFolder);
  createHemisphereLight(scene, lightFolder);
  const directionalLightHelper = createDirectionalLight(scene, lightFolder);
  const pointLightHelper = createPointLight(scene, lightFolder);
  const spotLightHelper = createSpotLight(scene, lightFolder);
  const rectAreaLightHelper = createRectAreaLight(scene, lightFolder);

  const updateLightHelpers = () => {
    directionalLightHelper.update();
    pointLightHelper.update();
    spotLightHelper.update();
  };

  // * Load textures
  const textures = await loadTextures();

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
  cube.position.x = 2;
  cone.position.x = -2;
  torusKnot.position.x = 4;
  tetrahedron.position.x = -4;

  const group = new THREE.Group();
  group.add(sphere, cube, cone, torusKnot, tetrahedron);
  group.position.y = 1;

  scene.add(plane, group);

  const camera = createCamera();
  const canvas = document.querySelector("canvas.threejs") as HTMLCanvasElement;
  const renderer = createRenderer(canvas);
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
    scene.clear();
    renderer.dispose();
    controls.dispose();
  };
}