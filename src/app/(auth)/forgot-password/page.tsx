import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getLocaleDictionary } from "@/i18n/get-dictionary";

export const metadata = {
  title: "Forgot Password",
  description: "Reset the password for your Ledgr account",
};

export default async function ForgotPasswordPage() {
  const { dictionary } = await getLocaleDictionary();
  return <ForgotPasswordForm dictionary={dictionary} />;
}
