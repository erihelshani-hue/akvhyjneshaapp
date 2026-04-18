import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

function safeNextPath(nextParam: string | null): string {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return "/";
  }

  if (["/de", "/sq", "/al"].some((prefix) => nextParam === prefix || nextParam.startsWith(`${prefix}/`))) {
    return "/";
  }

  return nextParam;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next"));

  if (code || (tokenHash && type)) {
    const cookieStore = await cookies();
    const authCookies: CookieToSet[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            authCookies.push(...cookiesToSet);
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
      data: { user, session },
      error,
    } = authResult;

    if (!error && user && session) {
      const profileInsert: Database["public"]["Tables"]["profiles"]["Insert"] = {
        id: user.id,
        full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Member",
        email: user.email!,
        role: "member",
        language_preference: "de",
        avatar_url: null,
      };

      await supabase.from("profiles").upsert(profileInsert, {
        onConflict: "id",
        ignoreDuplicates: true,
      });

      const redirectResponse = NextResponse.redirect(`${origin}${next}`);
      for (const { name, value, options } of authCookies) {
        redirectResponse.cookies.set(name, value, options);
      }
      redirectResponse.headers.set("Cache-Control", "no-store");
      return redirectResponse;
    }
  }

  const errorResponse = NextResponse.redirect(`${origin}/login?error=auth`);
  errorResponse.headers.set("Cache-Control", "no-store");
  return errorResponse;
}
