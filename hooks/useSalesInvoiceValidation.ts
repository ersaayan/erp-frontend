/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';
import { salesInvoiceSchema, productSchema, paymentSchema } from '@/lib/validations/salesInvoice';
import { useToast } from '@/hooks/use-toast';
import { InvoiceFormData, StockItem } from '@/components/SalesInvoice/types';
import { PaymentDetails } from '@/components/SalesInvoice/PaymentSection/types';
import { ZodError } from 'zod';

export const useSalesInvoiceValidation = () => {
    const { toast } = useToast();

    const validateForm = useCallback((
        invoiceData: InvoiceFormData,
        products: StockItem[],
        payments: PaymentDetails[]
    ): boolean => {
        try {
            // Validate invoice form data
            salesInvoiceSchema.parse(invoiceData);

            // Validate products
            if (products.length === 0) {
                throw new Error("En az bir ürün eklemelisiniz");
            }

            products.forEach((product, index) => {
                try {
                    productSchema.parse(product);
                } catch (error) {
                    throw new Error(`Ürün ${index + 1}: ${(error as Error).message}`);
                }
            });

            // Validate payments
            if (payments.length === 0) {
                throw new Error("En az bir ödeme eklemelisiniz");
            }

            // Calculate totals
            const totalAmount = products.reduce((sum, product) => sum + product.totalAmount, 0);
            const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
            const remainingAmount = totalAmount - totalPaid;

            if (Math.abs(remainingAmount) > 0.01) { // Using 0.01 for floating point comparison
                throw new Error(`Kalan tutar (${remainingAmount.toFixed(2)}) sıfır olmalıdır`);
            }

            return true;
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.map(err => `${err.path.join('.')} - ${err.message}`).join(', ');
                toast({
                    variant: "destructive",
                    title: "Doğrulama Hatası",
                    description: formattedErrors,
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Doğrulama Hatası",
                    description: (error as Error).message,
                });
            }
            return false;
        }
    }, [toast]);

    return { validateForm };
};