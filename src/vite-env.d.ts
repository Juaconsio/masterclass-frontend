/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_BACKEND_API_URL: string;
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
