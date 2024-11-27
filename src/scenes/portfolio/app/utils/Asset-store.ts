import * as THREE from "three";
import { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { createStore } from "zustand/vanilla";

export type Asset = {
  path: string;
  id: string;
  type: "texture" | "model";
};

const models = "models/portfolio";
const assetsToLoad: Array<Asset> = [
  {
    id: "avatar",
    path: `${models}/avatar.glb`,
    type: "model",
  },
];

type LoadedAsset = THREE.Texture | GLTF;
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
