import { createStore } from "zustand/vanilla";

export const sizeStore = createStore(() => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    aspect: window.innerWidth / window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  };
});
