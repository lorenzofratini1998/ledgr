import { z } from "zod";

export const createTransactionSchema = z
  .object({
    amount: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
      }),
    type: z.enum(["income", "expense", "transfer"]),
    currency_code: z.string().length(3),
    wallet_id: z.uuid("Please select a wallet"),
    destination_wallet_id: z.uuid("Please select a valid destination wallet").or(z.literal("")).optional().nullable(),
    destination_amount: z.string().optional().nullable(),
    fee: z.string().optional().nullable(),
    transfer_id: z.uuid().optional().nullable(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    category_id: z.uuid("Please select a valid category").or(z.literal("")).optional().nullable(),
    description: z.string().min(1, "Description is required"),
    tags: z.array(z.string().uuid()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "transfer") {
      if (!data.destination_wallet_id || data.destination_wallet_id.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["destination_wallet_id"],
          message: "Please select a destination wallet",
        });
      } else if (data.destination_wallet_id === data.wallet_id) {
        ctx.addIssue({
          code: "custom",
          path: ["destination_wallet_id"],
          message: "Source and destination wallets must be different",
        });
      }

      if (data.fee && data.fee.trim() !== "") {
        const feeNum = Number(data.fee);
        if (isNaN(feeNum) || feeNum < 0) {
          ctx.addIssue({
            code: "custom",
            path: ["fee"],
            message: "Fee must be a valid non-negative number",
          });
        }
      }

      if (data.destination_amount && data.destination_amount.trim() !== "") {
        const destNum = Number(data.destination_amount);
        if (isNaN(destNum) || destNum <= 0) {
          ctx.addIssue({
            code: "custom",
            path: ["destination_amount"],
            message: "Destination amount must be a positive number",
          });
        }
      }
    }
  });

export type CreateTransactionPayload = z.infer<typeof createTransactionSchema>;
