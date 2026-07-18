"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  FileType2,
  PlayCircle,
  UploadCloud
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Step structure
const STEPS = [
  { id: 1, title: "Upload", description: "Select your CSV file", icon: UploadCloud },
  { id: 2, title: "Map Columns", description: "Match CSV columns to system fields", icon: FileType2 },
  { id: 3, title: "Reconcile", description: "Fix unknown categories or wallets", icon: Database },
  { id: 4, title: "Review", description: "Preview and confirm import", icon: CheckCircle2 },
];

export function CsvImportWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const handleConfirm = () => {
    alert("CSV Import Coming Soon!");
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-12 pt-8">
      {/* Header & Stepper */}
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Import your historical data</h1>
        <p className="text-muted-foreground">
          Bring in transactions from your bank or previous tracking tool. This step is completely optional.
        </p>
      </div>

      <div className="relative mb-12 mt-8 hidden sm:block">
        <div className="absolute left-0 top-1/2 flex w-full -translate-y-1/2 items-center justify-between px-8 sm:px-12">
          <div className="h-0.5 w-full bg-muted" />
        </div>
        <div className="relative flex justify-between">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center gap-3">
                <div
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : isCompleted
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-background text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="absolute top-14 text-center">
                  <div className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Card */}
      <Card className="shadow-lg border-muted/50 overflow-hidden">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold sm:hidden">
              {currentStep}
            </span>
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] p-0 sm:p-6">
          <div className="p-4 sm:p-0 h-full">
            {currentStep === 1 && <Step1Upload />}
            {currentStep === 2 && <Step2Mapping />}
            {currentStep === 3 && <Step3Reconciliation />}
            {currentStep === 4 && <Step4Review />}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row items-center sm:justify-between border-t bg-muted/10 px-6 py-4">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={handleNext} className="w-full sm:w-auto">
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleConfirm} size="default" className="w-full sm:w-auto">
              Confirm & Import Data
              <PlayCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Skip Button */}
      <div className="flex justify-center pt-2">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
          Skip this step & Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

// -- Sub-components for each step --

function Step1Upload() {
  return (
    <div className="flex h-full min-h-[350px] flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex w-full max-w-xl flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/10 px-6 py-16 text-center transition-colors hover:border-primary/50 hover:bg-muted/20 cursor-pointer">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <UploadCloud className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Drag & Drop your CSV file here</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Supports .csv files up to 5MB. Make sure it contains headers.
        </p>
        <Button type="button" variant="secondary" className="pointer-events-none">
          Browse Files
        </Button>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 text-center">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Your data remains completely private and is only processed locally before import.</span>
      </div>
    </div>
  );
}

function Step2Mapping() {
  const fields = ["Date", "Amount", "Payee", "Category", "Note", "Wallet"];
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="rounded-md border border-muted bg-background shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 border-b bg-muted/40 p-4 text-sm font-medium">
          <div className="text-muted-foreground">System Field</div>
          <div className="text-muted-foreground">Your CSV Column</div>
        </div>
        <div className="divide-y divide-muted">
          {fields.map((field, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-0 items-start sm:items-center p-4 hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{field}</span>
                {i < 2 && <span className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">*Required</span>}
              </div>
              <div className="flex items-center gap-4 w-full">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Reconciliation() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-6">
        <div className="flex items-start sm:items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm font-medium leading-relaxed">
            We found 3 unknown categories and 1 unknown wallet in your import. Please map them below.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="h-px flex-1 bg-muted"></span>
            Unmapped Categories
            <span className="h-px flex-1 bg-muted"></span>
          </h4>
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-3 gap-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24 sm:w-32" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Map to:</span>
                  <Skeleton className="h-9 w-full sm:w-[200px] rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="h-px flex-1 bg-muted"></span>
            Unmapped Wallets
            <span className="h-px flex-1 bg-muted"></span>
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-3 gap-4 hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-4 w-20 sm:w-28" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Map to:</span>
              <Skeleton className="h-9 w-full sm:w-[200px] rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4Review() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Data Preview</h3>
          <p className="text-sm text-muted-foreground">Review the first few rows of your parsed data before importing.</p>
        </div>
        <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full inline-flex self-start sm:self-auto">
          Ready to import 142 rows
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Payee</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <tr key={i} className="bg-background hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap"><Skeleton className="h-4 w-20" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-32 sm:w-48" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </td>
                <td className="px-4 py-3 flex justify-end whitespace-nowrap"><Skeleton className="h-4 w-16" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
