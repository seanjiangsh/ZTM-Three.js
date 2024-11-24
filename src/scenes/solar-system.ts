import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function createScene() {
  const scene = new THREE.Scene();
  return scene;
}

async function loadTextures() {
  // add textureLoader
  const base = "/textures/solar-system";
  const textureLoader = new THREE.TextureLoader();
  textureLoader.setPath(base);
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  cubeTextureLoader.setPath(`${base}/cube-map`);

  // adding textures
  const sun = await textureLoader.loadAsync("/2k_sun.jpg");
  sun.colorSpace = THREE.SRGBColorSpace;
  const mercury = await textureLoader.loadAsync("/2k_mercury.jpg");
  mercury.colorSpace = THREE.SRGBColorSpace;
  const venus = await textureLoader.loadAsync("/2k_venus_surface.jpg");
  venus.colorSpace = THREE.SRGBColorSpace;
  const earth = await textureLoader.loadAsync("/2k_earth_daymap.jpg");
  earth.colorSpace = THREE.SRGBColorSpace;
  const mars = await textureLoader.loadAsync("/2k_mars.jpg");
  mars.colorSpace = THREE.SRGBColorSpace;
  const moon = await textureLoader.loadAsync("/2k_moon.jpg");
  moon.colorSpace = THREE.SRGBColorSpace;
  const jupiter = await textureLoader.loadAsync("/2k_jupiter.jpg");
  jupiter.colorSpace = THREE.SRGBColorSpace;
  const saturn = await textureLoader.loadAsync("/2k_saturn.jpg");
  saturn.colorSpace = THREE.SRGBColorSpace;
  const saturnRing = await textureLoader.loadAsync("/2k_saturn_ring_alpha.png");
  saturnRing.colorSpace = THREE.SRGBColorSpace;
  const uranus = await textureLoader.loadAsync("/2k_uranus.jpg");
  uranus.colorSpace = THREE.SRGBColorSpace;
  const neptune = await textureLoader.loadAsync("/2k_neptune.jpg");
  neptune.colorSpace = THREE.SRGBColorSpace;

  const cubes = [
    "/px.png",
    "/nx.png",
    "/py.png",
    "/ny.png",
    "/pz.png",
    "/nz.png",
  ];
  const background = await cubeTextureLoader.loadAsync(cubes);

  return {
    sun,
    mercury,
    venus,
    earth,
    mars,
    moon,
    jupiter,
    saturn,
    saturnRing,
    uranus,
    neptune,
    background,
  };
}

type MoonData = {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color?: number;
};

type PlanetData = {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  tilt: number;
  material: THREE.Material;
  moons: MoonData[];
  ring?: {
    innerRadius: number;
    outerRadius: number;
    texture: THREE.Texture;
  };
};

type Planets = Array<PlanetData>;

function getPlanetData(textures: Awaited<ReturnType<typeof loadTextures>>) {
  const planets: Planets = [
    {
      name: "Sun",
      radius: 5, // Arbitrary large value for the Sun
      distance: 0,
      speed: -0.01,
      tilt: 0,
      material: new THREE.MeshBasicMaterial({ map: textures.sun }),
      moons: [],
    },
    {
      name: "Mercury",
      radius: 0.122, // Scaled radius
      distance: 15, // distance for better visibility
      speed: 0.01,
      tilt: 0.034, // 0.034 degrees
      material: new THREE.MeshStandardMaterial({ map: textures.mercury }),
      moons: [],
    },
    {
      name: "Venus",
      radius: 0.3025, // Scaled radius
      distance: 20, // distance for better visibility
      speed: 0.007,
      tilt: 177.4, // 177.4 degrees
      material: new THREE.MeshStandardMaterial({ map: textures.venus }),
      moons: [],
    },
    {
      name: "Earth",
      radius: 0.3185, // Scaled radius
      distance: 25, // distance for better visibility
      speed: 0.005,
      tilt: 23.5, // 23.5 degrees
      material: new THREE.MeshStandardMaterial({ map: textures.earth }),
      moons: [
        {
          name: "Moon",
          radius: 0.08685, // Scaled radius (1,737 km)
          distance: 0.5, // Scaled distance (384,400 km)
          speed: 0.015,
        },
      ],
    },
    {
      name: "Mars",
      radius: 0.1695, // Scaled radius
      distance: 30, // distance for better visibility
      speed: 0.003,
      tilt: 25.2, // 25.2 degrees
      material: new THREE.MeshStandardMaterial({ map: textures.mars }),
      moons: [
        {
          name: "Phobos",
          radius: 0.0055, // Scaled radius (11 km)
          distance: 0.03, // Scaled distance (6,000 km)
          speed: 0.02,
        },
        {
          name: "Deimos",
          radius: 0.003, // Scaled radius (6 km)
          distance: 0.115, // Scaled distance (23,000 km)
          speed: 0.015,
          color: 0xffffff,
        },
      ],
    },
    {
      name: "Jupiter",
      radius: 3.4955, // Scaled radius
      distance: 35, // distance for better visibility
      speed: 0.002,
      tilt: 3.1, // 3.1 degrees
      material: new THREE.MeshStandardMaterial({ map: textures.jupiter }),
      moons: [],
    },
    {
      name: "Saturn",
      radius: 2.9116, // Scaled radius
      distance: 47.9, // Scaled distance
      speed: 0.0018,
      tilt: 26.7, // 26.7 degrees
      material: new THREE.MeshStandardMaterial({ map: textures.saturn }),
      moons: [],
      ring: {
        innerRadius: 1,
        outerRadius: 2.5,
        texture: textures.saturnRing, // Texture for the rings
      },
    },
    {
      name: "Uranus",
      radius: 1.2681, // Scaled radius
      distance: 96.1, // Scaled distance
      speed: 0.001,
      tilt: 97.8, // 97.8 degrees
      material: new THREE.MeshStandardMaterial({ map: textures.uranus }),
      moons: [],
    },
    {
      name: "Neptune",
      radius: 1.2311, // Scaled radius
      distance: 150.25, // Scaled distance
      speed: 0.0008,
      tilt: 28.3, // 28.3 degrees
      material: new THREE.MeshStandardMaterial({ map: textures.neptune }),
      moons: [],
    },
  ];

  return planets;
}

function createPlanet(
  planet: PlanetData,
  sphereGeometry: THREE.SphereGeometry
) {
  const { radius, distance, material, tilt, ring } = planet;
  const planetMesh = new THREE.Mesh(sphereGeometry, material);
  planetMesh.scale.setScalar(radius);
  planetMesh.rotation.z = THREE.MathUtils.degToRad(tilt); // Apply tilt

  // Set initial position randomly in the orbit
  const initialAngle = Math.random() * Math.PI * 2;
  planetMesh.userData.initialAngle = initialAngle; // Store the initial angle
  planetMesh.position.x = distance * Math.cos(initialAngle);
  planetMesh.position.z = distance * Math.sin(initialAngle);

  // Add rings if the planet has them
  if (ring) {
    const { innerRadius, outerRadius, texture } = ring;
    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    // Access the UV and position attributes of the geometry
    const uv = ringGeometry.attributes.uv;
    const position = ringGeometry.attributes.position;
    const count = uv.count;

    for (let i = 0; i < count; i++) {
      // Get the x and y positions of the vertex
      const x = position.getX(i);
      const y = position.getY(i);

      // Convert Cartesian coordinates (x, y) to polar coordinates (radius, angle)
      const radius = Math.sqrt(x * x + y * y);
      const angle = Math.atan2(y, x);

      // Normalize radius to [0, 1]
      const u = (radius - innerRadius) / (outerRadius - innerRadius);

      // Normalize angle to [0, 1]
      const v = (angle + Math.PI) / (2 * Math.PI);

      // Set the new UV coordinates
      uv.setXY(i, u, v);
    }

    // Notify Three.js that the UVs have been updated
    uv.needsUpdate = true;

    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2; // Rotate the rings to lie on the XZ plane
    planetMesh.add(ringMesh);
  }

  return planetMesh;
}

function createMoon(
  moon: MoonData,
  sphereGeometry: THREE.SphereGeometry,
  moonMaterial: THREE.Material
) {
  const { radius, distance } = moon;
  const mesh = new THREE.Mesh(sphereGeometry, moonMaterial);
  mesh.scale.setScalar(radius);
  mesh.position.x = distance;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Store the type as moon
  mesh.userData.type = "moon";

  return mesh;
}

function createPlanetMeshes(
  planets: Planets,
  sphereGeometry: THREE.SphereGeometry,
  moonMaterial: THREE.Material
) {
  return planets.map((planet) => {
    const planetMesh = createPlanet(planet, sphereGeometry);
    if (planet.name === "Sun") planetMesh.castShadow = false;
    planet.moons.forEach((moon) => {
      const moonMesh = createMoon(moon, sphereGeometry, moonMaterial);
      planetMesh.add(moonMesh);
    });
    return planetMesh;
  });
}

function createCamera() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(35, aspectRatio);
  camera.position.set(20, 20, -100);
  return camera;
}

function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  return renderer;
}

function createControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.maxDistance = 200;
  controls.minDistance = 20;
  return controls;
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

  // * Load textures
  const textures = await loadTextures();
  scene.background = textures.background;

  // * Create planets
  const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
  const moonMaterial = new THREE.MeshStandardMaterial({ map: textures.moon });
  const planetData = getPlanetData(textures);
  const planets = createPlanetMeshes(planetData, sphereGeometry, moonMaterial);
  planets.forEach((planet) => scene.add(planet));

  // * Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 3000);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 4096;
  scene.add(pointLight);

  // * Camera
  const camera = createCamera();

  // * Renderer
  const canvas = document.querySelector("canvas.threejs") as HTMLCanvasElement;
  const renderer = createRenderer(canvas);
  renderer.shadowMap.enabled = true;

  // * Controls
  const controls = createControls(camera, renderer);
  const updateCtrlAndRender = () => {
    controls.update();
    renderer.render(scene, camera);
  };

  // * Animation
  function animate() {
    // * Move and rotate the planets
    planets.forEach((planet, index) => {
      const data = planetData[index];
      const { speed, distance } = data;
      const initialAngle = planet.userData.initialAngle;
      planet.rotation.y += speed;
      planet.position.x = distance * Math.cos(planet.rotation.y + initialAngle);
      planet.position.z = distance * Math.sin(planet.rotation.y + initialAngle);
      planet.children
        .filter((child) => child.userData.type === "moon")
        .forEach((moon, moonIndex) => {
          const moonData = data.moons[moonIndex];
          const { speed, distance } = moonData;
          moon.rotation.y += speed;
          moon.position.x = distance * Math.cos(moon.rotation.y);
          moon.position.z = distance * Math.sin(moon.rotation.y);
        });
    });

    // * Update controls and render
    updateCtrlAndRender();

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
    scene.clear();
  };
}
