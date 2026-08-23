/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DUMMYJSON_BASE_URL: string;
  readonly VITE_JSONPLACEHOLDER_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
