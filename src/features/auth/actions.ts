"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { ActionResponse } from "@/types/actions";

export async function signInWithEmail(payload: Record<string, string>): Promise<ActionResponse> {
  const email = payload.email;
  const password = payload.password;

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Logged in successfully" };
}

export async function signUpWithEmail(payload: Record<string, string>): Promise<ActionResponse> {
  const email = payload.email;
  const password = payload.password;
  const confirmPassword = payload.confirmPassword;
  const firstName = payload.firstName;
  const lastName = payload.lastName;

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match." };
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || undefined,
      }
    }
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Registered successfully" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  const cookieStore = await cookies();
  cookieStore.delete("ONBOARDING_COMPLETED");

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function requestPasswordReset(payload: Record<string, string>): Promise<ActionResponse> {
  const email = payload.email;

  if (!email) {
    return { success: false, message: "Email is required." };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Password reset email sent." };
}

export async function updateUserPassword(payload: Record<string, string>): Promise<ActionResponse> {
  const password = payload.password;
  const confirmPassword = payload.confirmPassword;

  if (!password || !confirmPassword) {
    return { success: false, message: "Password is required." };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Password updated successfully" };
}
