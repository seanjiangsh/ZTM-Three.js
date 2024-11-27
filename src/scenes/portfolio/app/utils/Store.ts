import { createStore } from "zustand/vanilla";

// Define types for size state values and actions
type SizeState = {
  width: number;
  height: number;
  aspect: number;
  pixelRatio: number;
};

type SizeActions = {
  reset: () => void;
};

// Define the initial size state
const initialSizeState: SizeState = {
  width: window.innerWidth,
  height: window.innerHeight,
  aspect: window.innerWidth / window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// Create size store
export const sizeStore = createStore<SizeState & SizeActions>()((set) => ({
  ...initialSizeState,
  reset: () => set(initialSizeState),
}));

// Define types for app state values and actions
type AppState = {
  physicsReady: boolean;
  assetsReady: boolean;
};

type AppActions = {
  reset: () => void;
};

// Define the initial app state
const initialAppState: AppState = {
  physicsReady: false,
  assetsReady: false,
};

// Create app store
export const appStateStore = createStore<AppState & AppActions>()((set) => ({
  ...initialAppState,
  reset: () => set(initialAppState),
}));

// Define types for input state values and actions
export type InputState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

type InputActions = {
  reset: () => void;
};

// Define the initial input state
const initialInputState: InputState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

// Create input store
export const inputStore = createStore<InputState & InputActions>()((set) => ({
  ...initialInputState,
  reset: () => set(initialInputState),
}));
