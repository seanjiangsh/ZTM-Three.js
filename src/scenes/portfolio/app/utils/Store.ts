import { createStore } from "zustand/vanilla";

export const sizeStore = createStore(() => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    aspect: window.innerWidth / window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  };
});

export const appStateStore = createStore(() => ({
  physicsReady: false,
}));

export const inputStore = createStore(() => ({
  forward: false,
  backward: false,
  left: false,
  right: false,
}));
