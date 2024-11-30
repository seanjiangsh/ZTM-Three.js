import * as THREE from "three";
import { GLTF } from "three/addons/loaders/GLTFLoader.js";

import App from "../App.js";
import Portal from "./Portal.js";
import ModalContentProvider from "../ui/Modal-content-provider.js";
import assetStore from "../utils/Asset-store.js";

export default class Environment {
  app: App;

  private assetStore: ReturnType<typeof assetStore.getState>;
  private environment!: GLTF;
  private portals!: Array<Portal>;

  constructor() {
    this.app = new App();

    this.assetStore = assetStore.getState();
    const { loadedAssets } = this.assetStore;
    this.environment = loadedAssets.environment as GLTF;

    this.addGround();
    this.addSky();

    this.loadEnvironment();
    this.addLights();

    this.addPortals();

    // this.addWalls();
    // this.addStairs();
    // this.addMeshes();
    // this.addPhysicDemoMeshes();
  }

  addSky() {
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `;

    const uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 },
    };

    const skyMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: THREE.DoubleSide,
    });

    // Increase the size of the sphere geometry
    const skyGeometry = new THREE.SphereGeometry(500, 32, 15);
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);

    const { scene } = this.app;
    scene.add(sky);

    // Add fog as well
    scene.fog = new THREE.Fog(0x87ceeb, 15, 100);
  }

  private loadEnvironment() {
    const { app, environment } = this;
    const { scene, world } = app;
    const { physics } = world;

    const envScene = environment.scene;
    scene.add(envScene);

    envScene.position.set(-4.8, 0, -7.4);
    envScene.rotation.set(0, -0.6, 0);
    envScene.scale.setScalar(1.3);

    const physicalObjects = [
      "trees",
      "terrain",
      "rocks",
      "stairs",
      "gates",
      "floor",
      "bushes",
    ];

    const shadowCasters = [
      "trees",
      "terrain",
      "rocks",
      "stairs",
      "gates",
      "bushes",
    ];

    const shadowReceivers = ["floor", "terrain"];

    for (const child of envScene.children) {
      child.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          // Set shadow casting and receiving properties
          obj.castShadow = shadowCasters.some((keyword) =>
            child.name.includes(keyword)
          );
          obj.receiveShadow = shadowReceivers.some((keyword) =>
            child.name.includes(keyword)
          );
          // Add physics to objects
          if (physicalObjects.some((keyword) => child.name.includes(keyword))) {
            physics.add(obj, "fixed", "cuboid");
          }
        }
      });
    }
  }

  addLights() {
    const { scene } = this.app;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    const { shadow } = directionalLight;
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    shadow.camera.top = 60;
    shadow.camera.right = 60;
    shadow.camera.left = -60;
    shadow.camera.bottom = -60;
    shadow.bias = -0.002;
    shadow.normalBias = 0.072;
    scene.add(directionalLight);
  }

  private addPortals() {
    const { scene } = this.environment;
    const mesh1 = scene.getObjectByName("portals") as THREE.Mesh;
    const mesh2 = scene.getObjectByName("portals001") as THREE.Mesh;
    const mesh3 = scene.getObjectByName("portals002") as THREE.Mesh;

    const contentProvider = new ModalContentProvider();
    const content1 = contentProvider.getModalInfo("aboutMe");
    const content2 = contentProvider.getModalInfo("projects");
    const content3 = contentProvider.getModalInfo("contactMe");

    const portal1 = new Portal(mesh1, content1);
    const portal2 = new Portal(mesh2, content2);
    const portal3 = new Portal(mesh3, content3);
    this.portals = [portal1, portal2, portal3];
  }

  private addGround() {
    const size = 9999;
    const groundGeometry = new THREE.BoxGeometry(size, 0.01, size);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: "turquoise",
      // wireframe: true,
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.position.set(0, -0.01, 0);
    groundMesh.receiveShadow = true;

    const {
      scene,
      world: { physics },
    } = this.app;
    scene.add(groundMesh);
    physics.add(groundMesh, "fixed", "cuboid");
  }

  private addWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: "lightgreen",
    });

    const wallGeometry = new THREE.BoxGeometry(100, 10, 1);

    type WallPosition = {
      x: number;
      y: number;
      z: number;
      rotation?: { x?: number; y?: number; z?: number };
    };

    const wallPositions: Array<WallPosition> = [
      { x: 0, y: 5, z: 50 },
      { x: 0, y: 5, z: -50 },
      { x: 50, y: 5, z: 0, rotation: { y: Math.PI / 2 } },
      { x: -50, y: 5, z: 0, rotation: { y: Math.PI / 2 } },
    ];

    const {
      scene,
      world: { physics },
    } = this.app;

    wallPositions.forEach((position) => {
      const { x, y, z, rotation } = position;
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      wallMesh.position.set(x, y, z);

      const rotationX = rotation?.x || 0;
      const rotationY = rotation?.y || 0;
      const rotationZ = rotation?.z || 0;
      if (rotation) wallMesh.rotation.set(rotationX, rotationY, rotationZ);

      scene.add(wallMesh);
      physics.add(wallMesh, "fixed", "cuboid");
    });
  }

  private addStairs() {
    const stairMaterial = new THREE.MeshStandardMaterial({
      color: "orange",
    });

    const stairGeometry = new THREE.BoxGeometry(10, 1, 100);

    const stairPositions = [
      { x: 5, y: 1, z: 0 },
      { x: 15, y: 2, z: 0 },
      { x: 25, y: 3, z: 0 },
      { x: 35, y: 4, z: 0 },
      { x: 45, y: 5, z: 0 },
    ];

    const {
      scene,
      world: { physics },
    } = this.app;

    stairPositions.forEach((position) => {
      const stairMesh = new THREE.Mesh(stairGeometry, stairMaterial);
      stairMesh.position.set(position.x, position.y, position.z);
      scene.add(stairMesh);
      physics.add(stairMesh, "fixed", "cuboid");
    });
  }

  private addMeshes() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: "blue",
    });

    const {
      scene,
      world: { physics },
    } = this.app;

    for (let i = 0; i < 100; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() + 5) * 10,
        (Math.random() - 0.5) * 10
      );
      mesh.scale.setScalar(Math.random() + 0.5);
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(mesh);
      physics.add(mesh, "dynamic", "ball");
    }
  }

  private addPhysicDemoMeshes() {
    // const geometry = new THREE.BoxGeometry(1, 1, 1); // cube
    // const geometry = new THREE.SphereGeometry(1, 32, 32); // ball
    // const geometry = new THREE.TetrahedronGeometry(1); // trimesh

    // trimesh (complex and slow), cube (fast and acceptable), ball (fast but not accurate)
    const geometry = new THREE.TorusKnotGeometry(1);

    const {
      scene,
      world: { physics },
    } = this.app;

    const material = new THREE.MeshStandardMaterial({ color: "blue" });
    const collider = "cuboid";
    const count = 30;

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() + 5) * 10,
        (Math.random() - 0.5) * 10
      );
      // mesh.scale.set(
      //   Math.random() + 0.5,
      //   Math.random() + 0.5,
      //   Math.random() + 0.5
      // );
      mesh.scale.setScalar(Math.random() + 0.5);
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(mesh);
      physics.add(mesh, "dynamic", collider);
    }
  }

  loop() {
    this.portals.forEach((portal) => portal.loop());
  }
}
