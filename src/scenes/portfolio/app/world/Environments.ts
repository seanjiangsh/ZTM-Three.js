import * as THREE from "three";
import { GLTF } from "three/addons/loaders/GLTFLoader.js";

import App from "../App.js";
import assetStore from "../utils/Asset-store.js";

export default class Environment {
  app: App;
  assetStore: ReturnType<typeof assetStore.getState>;
  environment!: GLTF;
  directionalLight!: THREE.DirectionalLight;

  constructor() {
    this.app = new App();

    this.assetStore = assetStore.getState();
    this.environment = this.assetStore.loadedAssets.environment as GLTF;

    this.loadEnvironment();
    this.addLights();

    this.addGround();
    // this.addWalls();
    // this.addStairs();
    // this.addMeshes();
    // this.addPhysicDemoMeshes();
  }

  private loadEnvironment() {
    const { app, environment } = this;
    const { scene, world, gui } = app;
    const { physics } = world;

    const envScene = environment.scene;
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

    // Loop through top level children of the environment scene (all of the named objects in blender)
    for (const child of envScene.children) {
      const { name } = child;
      // console.log({ name, child });

      // Check if the name of the object contains any of the strings in the physicalObjects array
      const isPhysicalObject = physicalObjects.some((keyword) =>
        name.includes(keyword)
      );

      // If the object is a physical object, loop through all of the children meshes and add them to the physics world
      if (isPhysicalObject) {
        child.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            physics.add(obj, "fixed", "cuboid");
          }
        });
      }

      const isShadowCaster = shadowCasters.some((keyword) =>
        name.includes(keyword)
      );
      if (isShadowCaster) {
        child.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.castShadow = true;
          }
        });
      }

      const isShadowReceiver = shadowReceivers.some((keyword) =>
        name.includes(keyword)
      );
      if (isShadowReceiver) {
        child.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.receiveShadow = true;
          }
        });
      }
    }

    scene.add(envScene);
  }

  addLights() {
    const { scene } = this.app;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    const { shadow } = directionalLight;
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    shadow.camera.top = 30;
    shadow.camera.right = 30;
    shadow.camera.left = -30;
    shadow.camera.bottom = -30;
    shadow.bias = -0.002;
    shadow.normalBias = 0.072;
    this.directionalLight = directionalLight;
    scene.add(directionalLight);
  }

  private addGround() {
    const size = 9999;
    const groundGeometry = new THREE.BoxGeometry(size, 0.01, size);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: "turquoise",
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.position.set(0, -0.01, 0);

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
}
