import * as THREE from "three";

import Camera from "./Camera";
import Renderer from "./Renderer";

import AssetLoader from "./utils/AssetLoader";
import Preloader from "./ui/Preloader";

import InputController from "./ui/InputController";
import World from "./world/World";

import Resize from "./utils/Resize";
import Loop from "./utils/Loop";

let instance: App | null = null;

export default class App {
  canvas!: HTMLCanvasElement;

  scene!: THREE.Scene;
  camera!: Camera;
  renderer!: Renderer;

  assetLoader!: AssetLoader;
  preloader!: Preloader;

  inputController!: InputController;
  world!: World;

  resize!: Resize;
  loop!: Loop;

  constructor() {
    if (instance) return instance;
    instance = this;

    // * Three.js elements
    const canvas = document.createElement("canvas");
    canvas.className = "threejs";
    document.body.appendChild(canvas);
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    // * Loaders
    // this.assetLoader = new AssetLoader();
    // this.preloader = new Preloader();

    // * Camera and renderer
    this.camera = new Camera();
    this.renderer = new Renderer();

    // * UI and World
    this.inputController = new InputController();
    this.world = new World();

    // * Utils
    this.resize = new Resize();
    this.loop = new Loop();
  }

  dispose() {
    this.loop.dispose();
    // this.preloader.dispose();
    // this.assetLoader.dispose(); // TODO
    this.resize.dispose();
    this.camera.dispose();
    this.renderer.dispose();
    this.inputController.dispose();
    this.world.dispose();
    this.scene.clear();
    this.canvas.remove();
    instance = null;
  }
}
