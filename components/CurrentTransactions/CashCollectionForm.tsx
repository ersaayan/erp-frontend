import { z } from "zod";

export const formSchema = z.object({
  paymentDate: z.date({
    required_error: "Ödeme tarihi zorunludur",
  }),
  amount: z
    .string()
    .min(1, "Tutar zorunludur")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      {
        message: "Tutar pozitif bir sayı olmalıdır",
      }
    ),
  vaultId: z.string().min(1, "Kasa seçimi zorunludur"),
  branchCode: z.string().min(1, "Şube seçimi zorunludur"),
  description: z.string().optional(),
});
