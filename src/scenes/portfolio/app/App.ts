import * as THREE from "three";

import Camera from "./Camera";
import Renderer from "./Renderer";

import AssetLoader from "./utils/Asset-loader";
import Preloader from "./ui/Preloader";

import World from "./world/World";
import InputController from "./ui/Input-controller";
import ModalManager from "./ui/Modal-manager";

import Resize from "./utils/Resize";
import Loop from "./utils/Loop";
import GUI from "./utils/GUI";
import { appStateStore } from "./utils/Store";
import { Content } from "./ui/Modal-content-provider";

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

  gui!: GUI;

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
    this.assetLoader = new AssetLoader();
    this.preloader = new Preloader();

    // * Camera and renderer
    this.camera = new Camera();
    this.renderer = new Renderer();

    // * UI and World
    this.inputController = new InputController();
    this.world = new World();

    // * Utils
    this.resize = new Resize();
    this.loop = new Loop();

    // * Tweakpane GUI
    // this.gui = new GUI();

    // * Shows the game instruction in modal
    if (import.meta.env.PROD) this.showGameInstruction();
  }

  private showGameInstruction() {
    const modalManager = ModalManager.getInstance();
    const gameInstruction: Content = {
      title: "Game Instruction",
      description:
        "Use the WASD, arrow keys or press for joystick to move the character.",
    };
    modalManager.openModal(gameInstruction);
  }

  dispose() {
    this.loop.dispose();
    this.preloader.dispose();
    this.assetLoader.dispose();
    this.resize.dispose();
    this.camera.dispose();
    this.renderer.dispose();
    this.inputController.dispose();
    this.world.dispose();
    this.scene.clear();
    this.canvas.remove();
    instance = null;

    appStateStore.getState().reset();
  }
}
