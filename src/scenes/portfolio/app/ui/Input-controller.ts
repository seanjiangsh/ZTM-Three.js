import JoystickController, {
  JoystickOptions,
  JoystickOnMove,
} from "joystick-controller";

import { inputStore } from "../utils/Store";

const joystickConfig: JoystickOptions = {
  dynamicPosition: true,
  maxRange: 30,
};

export default class InputController {
  private keyPressed: { [keyCode: string]: boolean };
  private joyStick: JoystickController;

  constructor() {
    this.keyPressed = {};
    this.startListening();
    this.joyStick = new JoystickController(joystickConfig, this.joyStickOnMove);
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

  private getDirectionFromJoystick(data: JoystickOnMove) {
    const threshold = 10;
    const { x, y } = data;

    return {
      forward: y > threshold,
      backward: y < -threshold,
      left: x < -threshold,
      right: x > threshold,
    };
  }

  private joyStickOnMove = (data: JoystickOnMove) => {
    const input = this.getDirectionFromJoystick(data);
    inputStore.setState(input);
  };

  dispose() {
    // console.log("disposing input controller");
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.joyStick.destroy();
    inputStore.getState().reset();
  }
}
