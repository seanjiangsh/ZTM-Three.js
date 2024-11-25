import * as THREE from "three";

import App from "../App.js";

export default class Environment {
  app: App;
  directionalLight!: THREE.DirectionalLight;
  groundMesh!: THREE.Mesh;

  constructor() {
    this.app = new App();

    this.loadEnvironment();
    this.addGround();
    // this.addWalls();
    // this.addStairs();
    this.addMeshes();
    // this.addPhysicDemoMeshes();
  }

  private loadEnvironment() {
    // lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.app.scene.add(ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(1, 1, 1);
    this.directionalLight.castShadow = true;
    this.app.scene.add(this.directionalLight);
  }

  private addGround() {
    const groundGeometry = new THREE.BoxGeometry(100, 1, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: "turquoise",
    });
    this.groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);

    const {
      scene,
      world: { physics },
    } = this.app;
    scene.add(this.groundMesh);
    physics.add(this.groundMesh, "fixed", "cuboid");
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
