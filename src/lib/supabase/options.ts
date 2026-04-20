import type { CookieOptionsWithName } from "@supabase/ssr";

export const supabaseCookieOptions: CookieOptionsWithName = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  // 90 days — must match "Refresh Token Expiry" in Supabase Dashboard → Auth → JWT Settings
  maxAge: 90 * 24 * 60 * 60,
};

export const supabaseAuthOptions = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: false,
  flowType: "pkce" as const,
};
