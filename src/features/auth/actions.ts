"use server";

import { createClient } from "@/lib/supabase/server";
import { executePublicAction } from "@/lib/utils/action-utils";
import { ActionResponse } from "@/types/actions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithEmail(payload: Record<string, string>): Promise<ActionResponse> {
  return executePublicAction(async () => {
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
  });
}

export async function signUpWithEmail(payload: Record<string, string>): Promise<ActionResponse> {
  return executePublicAction(async () => {
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
  });
}

export async function clearSession() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function signOut() {
  await clearSession();
  redirect("/login");
}

export async function requestPasswordReset(payload: Record<string, string>): Promise<ActionResponse> {
  return executePublicAction(async () => {
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
      if (error.status === 429) {
        return {
          success: false,
          message: "You can only request a reset link once per minute. Please check your spam folder or wait before trying again."
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: "Password reset email sent." };
  });
}

export async function updateUserPassword(payload: Record<string, string>): Promise<ActionResponse> {
  return executePublicAction(async () => {
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

    await clearSession();

    return { success: true, message: "Password updated successfully. Please log in with your new password." };
  });
}
