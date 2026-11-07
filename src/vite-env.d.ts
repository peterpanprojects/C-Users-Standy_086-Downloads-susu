/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_PAYSTACK_PUBLIC_KEY?: string;
  readonly VITE_PAYSTACK_SECRET_KEY?: string;
  readonly VITE_SUPER_ADMIN_EMAIL?: string;
  readonly VITE_SUPER_ADMIN_INITIAL_PASSWORD?: string;
  readonly VITE_REZOLV_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
