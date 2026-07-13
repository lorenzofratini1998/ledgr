import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6 border border-border/50">
        <MapPinOff className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-muted-foreground max-w-[300px] mb-8 leading-relaxed">
        We couldn't find the page you were looking for. It might have been removed, renamed, or didn't exist in the first place.
      </p>
      <Link 
        href="/"
        className={cn(buttonVariants({ variant: "default" }), "rounded-full shadow-sm px-8")}
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
