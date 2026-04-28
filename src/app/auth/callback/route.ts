import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/boards";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Email is confirmed, but we want to force manual login
      await supabase.auth.signOut();
      
      // Override 'next' to always redirect to login after confirmation
      const redirectTo = next.startsWith("/login") ? next : "/login?confirmed=true";
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL("/login?error=Invalid+or+expired+link", requestUrl.origin));
}
