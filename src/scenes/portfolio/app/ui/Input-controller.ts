import { inputStore } from "../utils/Store";

export default class InputController {
  private keyPressed: { [keyCode: string]: boolean };

  constructor() {
    this.keyPressed = {};
    this.startListening();
  }

  private startListening() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown = ({ code }: KeyboardEvent) => {
    if (this.keyPressed[code]) return;

    switch (code) {
      case "KeyW":
      case "ArrowUp":
        inputStore.setState({ forward: true });
        // console.log("forward");
        break;
      case "KeyA":
      case "ArrowLeft":
        inputStore.setState({ left: true });
        break;
      case "KeyS":
      case "ArrowDown":
        inputStore.setState({ backward: true });
        break;
      case "KeyD":
      case "ArrowRight":
        inputStore.setState({ right: true });
        break;
    }

    this.keyPressed[code] = true;
  };

  private onKeyUp = ({ code }: KeyboardEvent) => {
    switch (code) {
      case "KeyW":
      case "ArrowUp":
        inputStore.setState({ forward: false });
        // console.log("forward released");
        break;
      case "KeyA":
      case "ArrowLeft":
        inputStore.setState({ left: false });
        break;
      case "KeyS":
      case "ArrowDown":
        inputStore.setState({ backward: false });
        break;
      case "KeyD":
      case "ArrowRight":
        inputStore.setState({ right: false });
        break;
    }

    this.keyPressed[code] = false;
  };

  dispose() {
    console.log("disposing input controller");
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
