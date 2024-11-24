import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { Pane } from "tweakpane";

function getResources() {
  const textureBackground = "textures/models-background/";
  const models = "models/";
  const modelGLTF = `${models}boom-box/glTF/`;
  const modelGLTFBinary = `${models}boom-box/glTF-Binary/`;
  const modelGLTFDraco = `${models}boom-box/glTF-Draco/`;
  const modelMilkTruck = `${models}milk-truck-GLB/`;

  return {
    textureBackground: [
      `${textureBackground}px.png`,
      `${textureBackground}nx.png`,
      `${textureBackground}py.png`,
      `${textureBackground}ny.png`,
      `${textureBackground}pz.png`,
      `${textureBackground}nz.png`,
    ],
    modelBoomBoxGLTF: [`${modelGLTF}BoomBox.gltf`],
    modelBoomBoxGLTFBinary: [`${modelGLTFBinary}BoomBox.glb`],
    modelBoomBoxGLTFDraco: [`${modelGLTFDraco}BoomBox.gltf`],
    modelMilkTruck: [`${modelMilkTruck}CesiumMilkTruck.glb`],
  };
}

function createLoadingManager() {
  const loadingManager = new THREE.LoadingManager();

  // Get references to the loading screen, progress bar, and progress text elements
  const loadingScreen = document.getElementById("loading-screen");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");

  // Initialize counts
  const resources = getResources();

  loadingManager.onStart = () => {
    if (progressText) {
      progressText.textContent = "0%";
    }
    if (loadingScreen) {
      loadingScreen.style.display = "flex";
    }
  };

  loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = (itemsLoaded / itemsTotal) * 100;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    if (progressText) {
      progressText.textContent = `${Math.round(progress)}%`;
    }
    console.log(`Loading: ${url} (${itemsLoaded}/${itemsTotal}), ${progress}%`);
  };

  loadingManager.onLoad = () => {
    if (progressBar) {
      progressBar.style.width = `100%`;
    }
    if (progressText) {
      progressText.textContent = `100%`;
    }
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.style.display = "none";
      }
    }, 500);
  };

  loadingManager.onError = (url) => {
    console.error(`Error loading: ${url}`);
  };

  return { resources, loadingManager };
}

function getLoaders(loadingManager: THREE.LoadingManager) {
  const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
  const gltfLoader = new GLTFLoader(loadingManager);
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("draco/");
  gltfLoader.setDRACOLoader(dracoLoader);

  return { cubeTextureLoader, gltfLoader };
}

function loadCubeTextures(loader: THREE.CubeTextureLoader, urls: string[]) {
  return new Promise<THREE.CubeTexture>((resolve, reject) => {
    loader.load(
      urls,
      (texture) => {
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error("Error loading cube textures:", error);
        reject(error);
      }
    );
  });
}

function loadGLTFModel(loader: GLTFLoader, url: string) {
  return new Promise<GLTF>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        resolve(gltf);
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", url, error);
        reject(error);
      }
    );
  });
}

async function loadAllResources() {
  // * Loading Manager and resources in current scene
  const { resources, loadingManager } = createLoadingManager();
  const {
    textureBackground,
    modelBoomBoxGLTF,
    modelBoomBoxGLTFBinary,
    modelBoomBoxGLTFDraco,
    modelMilkTruck,
  } = resources;

  // * Load resources
  const { cubeTextureLoader, gltfLoader } = getLoaders(loadingManager);
  const loadEnvMap = loadCubeTextures(cubeTextureLoader, textureBackground);
  const loadBoomBox1 = loadGLTFModel(gltfLoader, modelBoomBoxGLTF[0]);
  const loadBoomBox2 = loadGLTFModel(gltfLoader, modelBoomBoxGLTFBinary[0]);
  const loadBoomBoxDraco = loadGLTFModel(gltfLoader, modelBoomBoxGLTFDraco[0]);
  const loadMilkTruck = loadGLTFModel(gltfLoader, modelMilkTruck[0]);

  const loadPromises = [
    loadEnvMap,
    loadBoomBox1,
    loadBoomBox2,
    loadBoomBoxDraco,
    loadMilkTruck,
  ];
  const [cubeTexture, ...models] = await Promise.all(loadPromises);
  const envMap = cubeTexture as THREE.CubeTexture;
  const [boomBox1, boomBox2, boomBoxDraco, milkTruck] = models as Array<GLTF>;

  const boomBox1_scene = boomBox1.scene;
  const boomBox2_scene = boomBox2.scene;
  const boomBoxDraco_scene = boomBoxDraco.scene;
  const milkTruck_scene = milkTruck.scene;

  return {
    envMap,
    boomBox1_scene,
    boomBox2_scene,
    boomBoxDraco_scene,
    milkTruck_scene,
  };
}

function createScene() {
  // * Create the scene
  const scene = new THREE.Scene();
  return scene;
}

function createCamera() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(45, aspectRatio);
  camera.position.set(15, 5, 15);
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

function createControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.maxDistance = 200;
  // controls.minDistance = 20;
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

  const updateAxesHelper = () => {
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

  const cleanAxesHelper = () => {
    axesHelper.clear();
    axesCamera.clear();
    axesScene.clear();
  };

  // * return the animation function
  return { updateAxesHelper, cleanAxesHelper };
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
  // * Load resources
  const {
    envMap,
    boomBox1_scene,
    boomBox2_scene,
    boomBoxDraco_scene,
    milkTruck_scene,
  } = await loadAllResources();

  boomBox1_scene.scale.set(200, 200, 200);
  // Tweaking the material like other PBR materials
  const firstMesh = boomBox1_scene.children[0] as THREE.Mesh;
  const firstMaterial = firstMesh.material as THREE.MeshStandardMaterial;
  // console.log(model1Scene, firstMaterial);
  const pane = new Pane();
  const folder = pane.addFolder({ title: "Boom Box 1" });
  folder.addBinding(firstMaterial, "roughness", { min: 0, max: 1 });

  boomBox2_scene.scale.set(200, 200, 200);
  boomBox2_scene.position.x = -5;

  boomBoxDraco_scene.scale.set(200, 200, 200);
  boomBoxDraco_scene.position.x = -10;

  milkTruck_scene.traverse((child) => {
    if (child.name === "Wheels" || child.name === "Wheels001") {
      // do nothing here, we can change the material of the wheels
      // const wheel = child as THREE.Mesh;
      // wheel.material = new THREE.MeshBasicMaterial({ color: 0x333333 });
    } else if (child instanceof THREE.Mesh) {
      // make the milk truck shiny
      child.material.envMap = envMap;
      child.material.roughness = 0;
      child.material.metalness = 1;
    }
  });
  milkTruck_scene.position.set(5, -1.6, 0);

  // * Create the scene and add textures and models
  const scene = createScene();
  scene.background = envMap;
  scene.environment = envMap;
  scene.add(boomBox1_scene);
  scene.add(boomBox2_scene);
  scene.add(boomBoxDraco_scene);
  scene.add(milkTruck_scene);

  // * Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  // * Camera
  const camera = createCamera();

  // * Renderer
  const { canvas, renderer } = createRenderer();
  renderer.shadowMap.enabled = true;

  // * Controls
  const controls = createControls(camera, renderer);
  const updateCtrlAndRender = () => {
    controls.update();
    renderer.render(scene, camera);
  };

  // * Axis Helper
  const { updateAxesHelper } = addAxesHelper(camera, renderer);

  // * Animation
  function animate() {
    // * Update controls and render
    updateCtrlAndRender();

    // * Update AxesHelper
    updateAxesHelper();

    return requestAnimationFrame(animate);
  }
  const animateHandle = animate();

  // * Resize listener
  handleResize(camera, renderer);

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
