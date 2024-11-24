import * as THREE from "three";

import App from "../App";

export default class World {
  app: App;
  cube!: THREE.Group;

  constructor() {
    this.app = new App();
    this.setCube();
  }

  private setCube() {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(cube.geometry),
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    const group = new THREE.Group();
    group.add(cube);
    group.add(edge);

    this.cube = group;
    this.app.scene.add(this.cube);
  }

  loop() {
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
  }
}
