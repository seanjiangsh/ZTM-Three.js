/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
