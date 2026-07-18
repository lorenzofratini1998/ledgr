import { CsvImportWizard } from "@/features/onboarding/components/csv-import-wizard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import Data | Ledgr",
  description: "Import your historical transactions into Ledgr",
};

export default function ImportPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-muted/10">
      <CsvImportWizard />
    </div>
  );
}
