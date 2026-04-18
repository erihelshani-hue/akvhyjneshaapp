import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<(typeof cookies extends (...args: never[]) => Promise<infer T> ? T : never)["set"]>[2];
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const nextParam = searchParams.get("next");
  let next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  // Verhindere Redirects auf veraltete Locale-Pfade
  if (["/de", "/sq", "/al"].some((prefix) => next === prefix || next.startsWith(`${prefix}/`))) {
    next = "/";
  }

  if (code || (tokenHash && type)) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {}
          },
        },
      }
    );

    const authResult = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: type as "email" | "recovery" | "invite" | "email_change",
        });

    const {
      data: { user },
      error,
    } = authResult;

    if (!error && user) {
      // Sicheres Upsert, um Abstürze bei existierenden Nutzern (Unique Constraint) zu vermeiden
      const profileInsert: Database["public"]["Tables"]["profiles"]["Insert"] = {
        id: user.id,
        full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Member",
        email: user.email!,
        role: "member",
        language_preference: "de",
        avatar_url: null,
      };

      await (supabase.from("profiles") as any).upsert(profileInsert, {
        onConflict: "id",
        ignoreDuplicates: true
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
