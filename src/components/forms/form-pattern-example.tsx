'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ActionResponse } from "@/types/actions";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";

// 1. Define the Zod schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(["income", "expense"], {
    message: "Please select a category type.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// 2. Mock Server Action to simulate the pattern
async function createCategoryAction(
  values: FormValues
): Promise<ActionResponse<{ id: string }>> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Simulate server-side validation failure
  if (values.name.toLowerCase() === "error") {
    return {
      success: false,
      message: "Server validation failed.",
      errors: {
        name: ["This name is reserved and cannot be used."],
      },
    };
  }

  // Simulate unexpected error
  if (values.name.toLowerCase() === "fail") {
    return {
      success: false,
      message: "An unexpected database error occurred.",
    };
  }

  return {
    success: true,
    message: "Category created successfully.",
    data: { id: "cat_123" },
  };
}

export function FormPatternExample() {
  const [isPending, startTransition] = useTransition();

  // 3. Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "expense",
    },
  });

  // 4. Handle Submit
  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const response = await createCategoryAction(values);

        if (response.success) {
          toast.success(response.message || "Operation successful");
          form.reset();
        } else {
          // Handle field-specific errors returned from the server
          if (response.errors) {
            Object.entries(response.errors).forEach(([field, messages]) => {
              form.setError(field as keyof FormValues, {
                type: "server",
                message: messages[0], // Display the first error message
              });
            });
          }
          // Display global error toast
          toast.error(response.message || "Operation failed");
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  }

  return (
    <div className="max-w-md w-full p-6 border border-border/50 rounded-xl shadow-sm bg-card">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Create Category</h2>
        <p className="text-sm text-muted-foreground">Add a new category to organize your transactions.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Groceries" 
                    {...field} 
                    disabled={isPending} 
                    className="shadow-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger className="shadow-sm">
                      <SelectValue placeholder="Select a category type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isPending} 
            className="w-full mt-2"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Creating..." : "Create Category"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
