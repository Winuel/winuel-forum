/// <reference lib="dom" />
/// <reference lib="esnext" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_CORS_ORIGINS?: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}