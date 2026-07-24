import { LoginForm } from "@/features/auth/components/login-form";
import { getActiveAuthProviders } from "@/features/auth/constants";

export const metadata = {
  title: "Login",
  description: "Sign in to your Ledgr account",
};

export default async function LoginPage() {
  const activeProviders = await getActiveAuthProviders();

  return <LoginForm providers={activeProviders} />;
}
