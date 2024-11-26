import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d";

import App from "../App.js";
import { inputStore } from "../utils/Store";

export default class Character {
  app: App;

  character!: THREE.Mesh;
  rigidBody!: RAPIER.RigidBody;
  collider!: RAPIER.Collider;
  characterController!: RAPIER.KinematicCharacterController;

  forward: boolean = false;
  backward: boolean = false;
  left: boolean = false;
  right: boolean = false;

  unsubscribeInput: () => void = () => {};

  constructor() {
    this.app = new App();
    this.unsubscribeInput = inputStore.subscribe((state) => {
      this.forward = state.forward;
      this.backward = state.backward;
      this.left = state.left;
      this.right = state.right;
    });

    this.instantiateCharacter();
  }

  private instantiateCharacter() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    const character = new THREE.Mesh(geometry, material);
    this.character = character;
    character.position.set(0, 2.5, 0);
    this.app.scene.add(character);

    // Create a rigid body
    const { rapier, rapierWorld } = this.app.world.physics;
    const ridgeBodyType = rapier.RigidBodyDesc.kinematicPositionBased();
    const rigidBody = rapierWorld.createRigidBody(ridgeBodyType);
    this.rigidBody = rigidBody;

    // Create a collider
    const colliderType = rapier.ColliderDesc.cuboid(1, 1, 1);
    this.collider = rapierWorld.createCollider(colliderType, rigidBody);

    // Set rigid body position to character position
    const worldPosition = character.getWorldPosition(new THREE.Vector3());
    const worldRotation = character.getWorldQuaternion(new THREE.Quaternion());
    rigidBody.setTranslation(worldPosition, true);
    rigidBody.setRotation(worldRotation, true);

    // Create a character controller
    const characterController = rapierWorld.createCharacterController(0.01);
    this.characterController = characterController;

    // Apply inpulse to other objects when colliding
    characterController.setApplyImpulsesToDynamicBodies(true);

    // Set auto step (climbing stairs, current stair height is 1)
    characterController.enableAutostep(3, 0.1, false);

    // Enable stick to ground (different from the gravity effect)
    characterController.enableSnapToGround(1);
  }

  loop(deltaTime: number) {
    const { character, rigidBody, collider, characterController } = this;
    const { forward, backward, left, right } = this;

    const movement = new THREE.Vector3(0);

    if (forward) {
      movement.z -= 1;
    }
    if (backward) {
      movement.z += 1;
    }
    if (left) {
      movement.x -= 1;
    }
    if (right) {
      movement.x += 1;
    }

    // normalize movement (diagonal movement is not faster)
    movement.normalize();
    // sync movement speed with frame rate (25 is arbitrary ratio)
    movement.multiplyScalar(deltaTime * 25);
    // y=-1 will create a gravity effect
    movement.y = -1;

    // Compute the movement
    characterController.computeColliderMovement(collider, movement);

    const newPosition = new THREE.Vector3()
      .copy(rigidBody.translation())
      // use computed movement to move the character (can't get through walls)
      .add(characterController.computedMovement());

    rigidBody.setNextKinematicTranslation(newPosition);
    character.position.copy(rigidBody.translation());
  }

  dispose() {
    this.unsubscribeInput();
  }
}
