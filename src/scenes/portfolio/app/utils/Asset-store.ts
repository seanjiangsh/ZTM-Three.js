import * as THREE from "three";
import { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { createStore } from "zustand/vanilla";

export type Asset =
  | {
      id: string;
      path: string;
      type: "texture" | "model";
    }
  | {
      id: string;
      paths: Array<string>;
      type: "cubeTexture";
    };

const { VITE_BASE } = import.meta.env;
const base = VITE_BASE || "";

const models = `${base}/models/portfolio`;
// const textureBackground = "textures/portfolio-background";
const assetsToLoad: Array<Asset> = [
  {
    id: "avatar",
    path: `${models}/avatar.glb`,
    type: "model",
  },
  {
    id: "environment",
    path: `${models}/environment.glb`,
    type: "model",
  },
  // {
  //   id: "background",
  //   paths: [
  //     `${textureBackground}/px.png`,
  //     `${textureBackground}/nx.png`,
  //     `${textureBackground}/py.png`,
  //     `${textureBackground}/ny.png`,
  //     `${textureBackground}/pz.png`,
  //     `${textureBackground}/nz.png`,
  //   ],
  //   type: "cubeTexture",
  // },
];

type LoadedAsset = THREE.Texture | GLTF | THREE.CubeTexture;
type AssetStoreState = {
  assetsToLoad: Array<Asset>;
  loadedAssets: { [key: string]: LoadedAsset };
  addLoadedAsset: (asset: LoadedAsset, id: string) => void;
};
type AssetActions = {
  reset: () => void;
};

const assetStore = createStore<AssetStoreState & AssetActions>((set) => ({
  assetsToLoad,
  loadedAssets: {},
  addLoadedAsset: (asset, id) =>
    set((state) => ({ loadedAssets: { ...state.loadedAssets, [id]: asset } })),
  reset: () => set({ assetsToLoad, loadedAssets: {} }),
}));

export default assetStore;
