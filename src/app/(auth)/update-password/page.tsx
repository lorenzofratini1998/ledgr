import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";
import { getLocaleDictionary } from "@/i18n/get-dictionary";

export const metadata = {
  title: "Update Password",
  description: "Set a new password for your Ledgr account",
};

export default async function UpdatePasswordPage() {
  const { dictionary } = await getLocaleDictionary();
  return <UpdatePasswordForm dictionary={dictionary} />;
}
