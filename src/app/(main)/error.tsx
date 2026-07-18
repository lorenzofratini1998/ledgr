'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-in fade-in zoom-in-95 duration-300">
      <Card className="w-full max-w-md shadow-sm border-border/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-4 border border-destructive/20">
            <AlertCircle className="h-7 w-7 text-destructive" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">Unexpected Error</CardTitle>
          <CardDescription className="text-sm">
            We encountered a problem while trying to load this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our systems have registered the issue. You can try refreshing the page to see if the problem resolves itself.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={reset} 
            variant="default" 
            className="w-full sm:w-auto rounded-full gap-2 px-8 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
