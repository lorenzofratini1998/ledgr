"use client";

import { ResponsiveDrawer } from "@/components/shared/responsive-drawer";
import { Button } from "@/components/ui/button";
import { TagForm } from "./tag-form";
import { Plus } from "lucide-react";
import { useState } from "react";

export function CreateTagTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="hidden md:flex" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add Tag
      </Button>
      
      <Button className="fixed bottom-20 right-4 rounded-full shadow-lg h-14 w-14 p-0 flex md:hidden z-50" onClick={() => setOpen(true)}>
        <Plus className="h-6 w-6" />
      </Button>

      <ResponsiveDrawer
        open={open}
        onOpenChange={setOpen}
        title="Add Tag"
        description="Create a new tag to organize your transactions."
      >
        <TagForm onSuccess={() => setOpen(false)} />
      </ResponsiveDrawer>
    </>
  );
}
