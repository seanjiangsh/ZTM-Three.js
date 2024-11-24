import * as THREE from "three";

import Camera from "./Camera";
import Renderer from "./Renderer";

import World from "./world/World";

import Resize from "./utils/Resize";
import Loop from "./utils/Loop";

let instance: App | null = null;

export default class App {
  canvas!: HTMLCanvasElement;

  scene!: THREE.Scene;
  camera!: Camera;
  renderer!: Renderer;

  world!: World;
  resize!: Resize;
  loop!: Loop;

  constructor() {
    if (instance) return instance;
    instance = this;

    // this.canvas = document.querySelector("canvas.threejs")!;
    const canvas = document.createElement("canvas");
    canvas.className = "threejs";
    document.body.appendChild(canvas);
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();
    this.resize = new Resize();
    this.loop = new Loop();
  }

  dispose() {
    this.loop.dispose();
    this.resize.dispose();
    this.camera.dispose();
    this.renderer.dispose();
    this.scene.clear();
    this.canvas.remove();
    instance = null;
  }
}
