import * as THREE from "three";
import { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { createStore } from "zustand/vanilla";

export type Asset = {
  path: string;
  id: string;
  type: "texture" | "model";
};

const solarSystem = "textures/solar-system";
const assetsToLoad: Array<Asset> = [
  {
    path: `${solarSystem}/2k_earth_daymap.jpg`,
    id: "earth",
    type: "texture",
  },
  {
    path: `${solarSystem}/2k_mars.jpg`,
    id: "mars",
    type: "texture",
  },
  {
    path: `${solarSystem}/2k_mercury.jpg`,
    id: "mercury",
    type: "texture",
  },
  {
    path: `${solarSystem}/2k_sun.jpg`,
    id: "sun",
    type: "texture",
  },
];

export type LoadedAsset = THREE.Texture | GLTF;
export type AssetStoreState = {
  assetsToLoad: Array<Asset>;
  loadedAssets: { [key: string]: LoadedAsset };
  addLoadedAsset: (asset: LoadedAsset, id: string) => void;
};

const assetStore = createStore<AssetStoreState>((set) => ({
  assetsToLoad,
  loadedAssets: {},
  addLoadedAsset: (asset, id) =>
    set((state) => ({ loadedAssets: { ...state.loadedAssets, [id]: asset } })),
}));

export default assetStore;
