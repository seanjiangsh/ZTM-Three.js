import * as THREE from "three";

import App from "../App.js";
import Physics from "./Physics.js";

export default class Environment {
  app: App;
  directionalLight!: THREE.DirectionalLight;
  groundMesh!: THREE.Mesh;

  constructor() {
    this.app = new App();

    this.loadEnvironment();
    this.addGround();
    this.addMeshes();
  }

  loadEnvironment() {
    // lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.app.scene.add(ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(1, 1, 1);
    this.directionalLight.castShadow = true;
    this.app.scene.add(this.directionalLight);
  }

  addGround() {
    const groundGeometry = new THREE.BoxGeometry(50, 1, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: "turquoise",
    });
    this.groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    this.app.scene.add(this.groundMesh);
    this.app.world.physics.add(this.groundMesh, "fixed", "cuboid");
  }

  addMeshes() {
    // const geometry = new THREE.BoxGeometry(1, 1, 1); // cube
    // const geometry = new THREE.SphereGeometry(1, 32, 32); // ball
    // const geometry = new THREE.TetrahedronGeometry(1); // trimesh

    // trimesh (complex and slow), cube (fast and acceptable), ball (fast but not accurate)
    const geometry = new THREE.TorusKnotGeometry(1);

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
      this.app.scene.add(mesh);
      this.app.world.physics.add(mesh, "dynamic", collider);
    }
  }
}
