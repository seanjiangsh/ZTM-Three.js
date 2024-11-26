import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d";

import App from "../App.js";
import { appStateStore } from "../utils/Store.js";

type RigidBodyType = "dynamic" | "fixed" | "kinematic";
type ColliderType = "cuboid" | "ball" | "trimesh";

/**
 * Class representing a physics simulation
 * Note: We need "vite-plugin-top-level-await" and "vite-plugin-wasm"
 * to use top-level await and import wasm files from rapier3d
 */
export default class Physics {
  app: App;
  rapier!: typeof RAPIER;
  rapierWorld!: RAPIER.World;

  private rapierLoaded: boolean = false;
  private meshMap: Map<THREE.Mesh, RAPIER.RigidBody>;

  constructor() {
    this.app = new App();
    // setting the physics map
    this.meshMap = new Map();

    // setting the physics world
    import("@dimforge/rapier3d").then((RAPIER) => {
      const gravity = { x: 0, y: -9.81, z: 0 };
      this.rapierWorld = new RAPIER.World(gravity);
      this.rapier = RAPIER;
      this.rapierLoaded = true;
      appStateStore.setState({ physicsReady: true });
    });
  }

  /**
   * Adds a mesh to the physics simulation with a given rigid body type and collider type
   * @param {THREE.Mesh} mesh - The mesh to add to the physics simulation
   * @param {string} type - The rigid body type ("dynamic" or "fixed")
   * @param {string} collider - The collider type ("cuboid", "ball", or "trimesh")
   */
  add(mesh: THREE.Mesh, type: RigidBodyType, collider: ColliderType) {
    // defining the rigid body type
    const { rapier, rapierWorld } = this;
    const { ColliderDesc, RigidBodyDesc } = rapier;

    let rigidBodyType: RAPIER.RigidBodyDesc;
    switch (type) {
      case "dynamic":
        rigidBodyType = RigidBodyDesc.dynamic();
        break;
      case "fixed":
        rigidBodyType = RigidBodyDesc.fixed();
        break;
      case "kinematic":
        rigidBodyType = RigidBodyDesc.kinematicPositionBased();
        break;
      default:
        throw new Error("Invalid rigid body type");
    }
    const rigidBody = rapierWorld.createRigidBody(rigidBodyType);

    switch (collider) {
      case "cuboid":
        {
          const dimensions = this.computeCuboidDimensions(mesh);
          const type = ColliderDesc.cuboid(
            dimensions.x / 2,
            dimensions.y / 2,
            dimensions.z / 2
          );
          rapierWorld.createCollider(type, rigidBody);
        }
        break;
      case "ball":
        {
          const radius = this.computeBallDimensions(mesh);
          const type = ColliderDesc.ball(radius);
          rapierWorld.createCollider(type, rigidBody);
        }
        break;
      case "trimesh": {
        const { scaledVertices, indices } = this.computeTrimeshDimensions(mesh);
        const type = ColliderDesc.trimesh(scaledVertices, indices);
        rapierWorld.createCollider(type, rigidBody);
        break;
      }
    }

    // setting the rigid body position and rotation
    const worldPosition = mesh.getWorldPosition(new THREE.Vector3());
    const worldRotation = mesh.getWorldQuaternion(new THREE.Quaternion());
    rigidBody.setTranslation(worldPosition, true);
    rigidBody.setRotation(worldRotation, true);

    this.meshMap.set(mesh, rigidBody);
    return rigidBody;
  }

  /**
   * Computes the dimensions of a cuboid collider for a given mesh
   * @param {THREE.Mesh} mesh - The mesh to compute the dimensions for
   * @returns {THREE.Vector3} The dimensions of the cuboid collider
   */
  private computeCuboidDimensions(mesh: THREE.Mesh): THREE.Vector3 {
    mesh.geometry.computeBoundingBox();
    const size =
      mesh.geometry.boundingBox?.getSize(new THREE.Vector3()) ||
      new THREE.Vector3();
    const worldScale = mesh.getWorldScale(new THREE.Vector3());
    size.multiply(worldScale);
    return size;
  }

  /**
   * Computes the radius of a sphere collider for a given mesh
   * @param {THREE.Mesh} mesh - The mesh to compute the radius for
   * @returns {number} The radius of the sphere collider
   */
  private computeBallDimensions(mesh: THREE.Mesh): number {
    mesh.geometry.computeBoundingSphere();
    const radius = mesh.geometry.boundingSphere?.radius || 0;
    const worldScale = mesh.getWorldScale(new THREE.Vector3());
    const { x, y, z } = worldScale;
    const maxScale = Math.max(x, y, z);
    return radius * maxScale;
  }

  /**
   * Computes the scaled vertices and indices of a trimesh collider for a given mesh
   * @param {THREE.Mesh} mesh - The mesh to compute the scaled vertices and indices for
   * @returns {{scaledVertices: Float32Array, indices: Uint32Array}} The scaled vertices and indices of the trimesh collider
   */
  private computeTrimeshDimensions(mesh: THREE.Mesh) {
    const { attributes, index } = mesh.geometry || {};
    let scaledVertices = new Float32Array();
    let indices = new Uint32Array();

    if (!attributes.position) return { scaledVertices, indices };

    const worldScale = mesh.getWorldScale(new THREE.Vector3());
    const vertices = attributes.position.array.map(
      (vertex, index) => vertex * worldScale.getComponent(index % 3)
    );

    if (index) {
      indices = new Uint32Array(index.array);
    } else {
      // Generate indices for non-indexed geometry
      const vertexCount = attributes.position.count;
      indices = new Uint32Array(vertexCount);
      for (let i = 0; i < vertexCount; i++) {
        indices[i] = i;
      }
    }

    scaledVertices = new Float32Array(vertices);
    return { scaledVertices, indices };
  }

  /**
   * The loop function that updates the physics simulation and the mesh positions and rotations
   */
  loop() {
    if (!this.rapierLoaded) return;
    this.rapierWorld.step();

    this.meshMap.forEach((rigidBody, mesh) => {
      // extracting the position and rotation from the rigid body
      const position = new THREE.Vector3().copy(rigidBody.translation());
      const rotation = new THREE.Quaternion().copy(rigidBody.rotation());

      // transforming the position to the parent mesh's local space
      const { matrixWorld } = mesh.parent || {};
      if (!matrixWorld) return;

      const newMatrix = new THREE.Matrix4().copy(matrixWorld).invert();
      position.applyMatrix4(newMatrix);

      // transforming the rotation to the parent mesh's local space
      const inverseParentMatrix = new THREE.Matrix4()
        .extractRotation(matrixWorld)
        .invert();
      const inverseParentRotation =
        new THREE.Quaternion().setFromRotationMatrix(inverseParentMatrix);
      rotation.premultiply(inverseParentRotation);

      mesh.position.copy(position);
      mesh.quaternion.copy(rotation);
    });
  }
}
