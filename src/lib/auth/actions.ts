"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { authenticate, type AuthClient, type AuthResult } from "./authenticate";

export type LoginState = { error?: string } | undefined;

const FRIENDLY_MESSAGES: Partial<Record<AuthResult["status"], string>> = {
  invalid_credentials: "Invalid email or password.",
  unauthorized: "This account is not authorized for admin access.",
  server_error: "Sign-in is temporarily unavailable. Please try again shortly.",
};

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let result: AuthResult;
  try {
    const supabase = await createClient();
    // Cast rather than rely on structural inference: the real client's
    // generics are deep enough to make direct assignability checking
    // here hit TS's instantiation-depth limit.
    result = await authenticate(email, password, supabase as unknown as AuthClient);
  } catch (error) {
    console.error("[auth] login failed", error);
    result = { status: "server_error" };
  }

  if (result.status === "success") {
    redirect("/admin");
  }

  if (result.status === "invalid_input") {
    return { error: result.error };
  }

  return { error: FRIENDLY_MESSAGES[result.status] };
}

export async function logout(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[auth] logout failed", error);
  }
  redirect("/login");
}
