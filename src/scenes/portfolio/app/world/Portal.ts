import * as THREE from "three";

import App from "../App";
import { Content } from "../ui/Model-content-provider";
import ModalManager from "../ui/Model-manager";

export default class Portal {
  app: App;
  private mesh: THREE.Mesh;
  private modalContent: Content;
  private modalManager: ModalManager;
  private prevIsNear: boolean;
  private portalNearMaterial: THREE.MeshBasicMaterial;
  private portalFarMaterial: THREE.MeshBasicMaterial;

  constructor(portalMesh: THREE.Mesh, modalContent: Content) {
    this.app = new App();
    this.mesh = portalMesh;
    this.modalContent = modalContent;
    this.modalManager = new ModalManager();
    this.prevIsNear = false;

    this.portalNearMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    this.portalFarMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
    });
    this.mesh.material = this.portalFarMaterial;
  }

  loop() {
    const { app, modalContent, modalManager, prevIsNear } = this;
    const { mesh, portalNearMaterial, portalFarMaterial } = this;

    const character = app.world.character?.instance;
    if (!character) return;

    const portalPosition = new THREE.Vector3();
    mesh.getWorldPosition(portalPosition);
    const distance = character.position.distanceTo(portalPosition);

    const isNear = distance < 1;
    if (isNear) {
      if (!prevIsNear) {
        const { title, description } = modalContent;
        modalManager.openModal(title, description);
        mesh.material = portalNearMaterial;
        // console.log("open modal");
      }
      this.prevIsNear = true;
    } else {
      if (prevIsNear) {
        modalManager.closeModal();
        mesh.material = portalFarMaterial;
        // console.log("close modal");
      }
      this.prevIsNear = false;
    }
  }
}
