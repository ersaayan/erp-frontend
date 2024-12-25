import { z } from "zod";

export const purchaseInvoiceSchema = z.object({
    invoiceNo: z.string().min(1, "Fatura numarası zorunludur"),
    gibInvoiceNo: z.string().optional(),
    invoiceDate: z.date({
        required_error: "Fatura tarihi zorunludur",
    }),
    paymentDate: z.date({
        required_error: "Vade tarihi zorunludur",
    }),
    paymentTerm: z.number().min(0, "Vade günü 0'dan küçük olamaz"),
    branchCode: z.string().min(1, "Şube seçimi zorunludur"),
    warehouseId: z.string().min(1, "Depo seçimi zorunludur"),
    description: z.string().optional(),
    current: z.object({
        id: z.string(),
        currentCode: z.string(),
        currentName: z.string(),
        priceList: z.object({
            id: z.string(),
            priceListName: z.string(),
            currency: z.string(),
            isVatIncluded: z.boolean(),
        }).nullable(),
    }, {
        required_error: "Cari seçimi zorunludur",
        invalid_type_error: "Geçerli bir cari seçmelisiniz",
    }).nullable().refine(val => val !== null, {
        message: "Cari seçimi zorunludur"
    }),
});

export const productSchema = z.object({
    quantity: z.number().min(0.01, "Miktar 0'dan büyük olmalıdır"),
    unitPrice: z.number().min(0.01, "Birim fiyat 0'dan büyük olmalıdır"),
    vatRate: z.number().min(0, "KDV oranı 0'dan küçük olamaz"),
});

export const paymentSchema = z.object({
    amount: z.number().min(0.01, "Ödeme tutarı 0'dan büyük olmalıdır"),
    accountId: z.string().min(1, "Hesap seçimi zorunludur"),
});

export type PurchaseInvoiceFormData = z.infer<typeof purchaseInvoiceSchema>;