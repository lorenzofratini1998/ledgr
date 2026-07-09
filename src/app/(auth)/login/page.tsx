import { LoginForm } from "@/components/auth/login-form";
import { getLocaleDictionary } from "@/i18n/get-dictionary";
import { getActiveAuthProviders } from "@/data/auth-providers";

export const metadata = {
  title: "Login",
  description: "Sign in to your Ledgr account",
};

export default async function LoginPage() {
  const activeProviders = await getActiveAuthProviders();
  const { dictionary } = await getLocaleDictionary();

  return <LoginForm providers={activeProviders} dictionary={dictionary} />;
}
