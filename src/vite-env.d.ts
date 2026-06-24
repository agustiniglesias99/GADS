/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: "https://yzgycahqzjhrfkvcmgrv.supabase.co"
  readonly VITE_SUPABASE_ANON_KEY: "sb_publishable_uOe_6V7P_fB9_2VsJq7zOA_G92Ik1Fe"
  readonly VITE_QR_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
