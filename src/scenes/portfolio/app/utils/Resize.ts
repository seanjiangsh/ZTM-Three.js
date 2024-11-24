import { sizeStore } from "./Store";

export default class Resize {
  constructor() {
    this.setSizes();
    this.addEventListeners();
  }

  private setSizes() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    sizeStore.setState({ width, height, aspect, pixelRatio });
  }

  addEventListeners() {
    window.addEventListener("resize", this.setSizes);
  }

  dispose() {
    window.removeEventListener("resize", this.setSizes);
  }
}
