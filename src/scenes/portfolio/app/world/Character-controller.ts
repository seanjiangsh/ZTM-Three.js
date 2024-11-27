import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d";

import App from "../App.js";
import { inputStore } from "../utils/Store.js";

export default class CharacterController {
  app: App;

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

    // Subscribe to input store and update movement values
    inputStore.subscribe((state) => {
      this.forward = state.forward;
      this.backward = state.backward;
      this.left = state.left;
      this.right = state.right;
    });

    // Instantiate controller and create rigid body and collider
    this.instantiateController();
  }

  private instantiateController() {
    const character = this.app.world.character?.instance;
    if (!character) return;

    // Create a kinematic rigid body
    const { rapier, rapierWorld } = this.app.world.physics;
    const ridgeBodyType = rapier.RigidBodyDesc.kinematicPositionBased();
    const rigidBody = rapierWorld.createRigidBody(ridgeBodyType);
    this.rigidBody = rigidBody;

    // Create a cuboid collider
    const colliderType = rapier.ColliderDesc.cuboid(1, 2.5, 1);
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
    const character = this.app.world.character?.instance;
    if (!character) return;

    const { rigidBody, collider, characterController } = this;
    const { forward, backward, left, right } = this;

    const movement = new THREE.Vector3();

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

    // Rotate the character based on the movement direction
    if (movement.length() !== 0) {
      const angle = Math.atan2(movement.x, movement.z) + Math.PI;
      const rotateQuaternion = new THREE.Quaternion();
      const asix = new THREE.Vector3(0, 1, 0); // rotate around y-axis
      const characterRotation = rotateQuaternion.setFromAxisAngle(asix, angle);
      character.quaternion.slerp(characterRotation, 0.1);
    }

    // normalize movement (diagonal movement is not faster)
    movement.normalize();
    // sync movement speed with frame rate (25 is arbitrary ratio)
    movement.multiplyScalar(deltaTime * 25);
    // y=(negative value) will create a gravity effect
    movement.y = -1;

    // Compute the movement
    characterController.computeColliderMovement(collider, movement);

    const newPosition = new THREE.Vector3()
      .copy(rigidBody.translation())
      // use computed movement to move the character (can't get through walls)
      .add(characterController.computedMovement());

    rigidBody.setNextKinematicTranslation(newPosition);
    character.position.lerp(rigidBody.translation(), 0.2);
  }

  dispose() {
    this.unsubscribeInput();
  }
}
