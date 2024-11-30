import process from "process";

import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

if (process.env.NODE_ENV !== "development") {
  console.log(process.env);
}

export default {
  base: process.env.VITE_BASE || "/",
  plugins: [wasm(), topLevelAwait()],
  build: { rollupOptions: { treeshake: false } },
};
