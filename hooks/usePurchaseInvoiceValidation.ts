/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';
import { purchaseInvoiceSchema, productSchema, paymentSchema } from '@/lib/validations/purchaseInvoice';
import { useToast } from '@/hooks/use-toast';
import { InvoiceFormData, StockItem, ExpenseItem } from '@/components/PurchaseInvoice/types';
import { PaymentDetails } from '@/components/PurchaseInvoice/PaymentSection/types';
import { ZodError } from 'zod';
import { currencyService } from '@/lib/services/currency';

export const usePurchaseInvoiceValidation = () => {
    const { toast } = useToast();

    const validateForm = useCallback(async (
        invoiceData: InvoiceFormData,
        products: StockItem[],
        expenses: ExpenseItem[],
        payments: PaymentDetails[]
    ): Promise<boolean> => {
        try {
            // Get exchange rates
            const exchangeRates = await currencyService.getExchangeRates();

            // Validate invoice form data
            purchaseInvoiceSchema.parse(invoiceData);

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

            // Validate expenses
            expenses.forEach((expense, index) => {
                if (!expense.expenseCode || !expense.expenseName || expense.price <= 0) {
                    throw new Error(`Masraf ${index + 1}: Tüm alanlar doldurulmalı ve tutar 0'dan büyük olmalıdır`);
                }
            });

            // Validate payments
            if (payments.length === 0) {
                throw new Error("En az bir ödeme eklemelisiniz");
            }

            // Calculate totals including expenses
            const totalProducts = products.reduce((sum, product) => {
                // Tüm ürünlerin tutarını USD'ye çevir
                let amount = product.totalAmount;
                if (product.currency === "TRY") {
                    amount = amount / exchangeRates.USD_TRY;
                } else if (product.currency === "EUR") {
                    amount = (amount * exchangeRates.EUR_TRY) / exchangeRates.USD_TRY;
                }
                return sum + amount;
            }, 0);

            const totalExpenses = expenses.reduce((sum, expense) => {
                // Tüm masrafları USD'ye çevir
                let amount = expense.price;
                if (expense.currency === "TRY") {
                    amount = amount / exchangeRates.USD_TRY;
                } else if (expense.currency === "EUR") {
                    amount = (amount * exchangeRates.EUR_TRY) / exchangeRates.USD_TRY;
                }
                return sum + amount;
            }, 0);

            const totalAmount = totalProducts + totalExpenses;

            const totalPaid = payments.reduce((sum, payment) => {
                // Tüm ödemeleri USD'ye çevir
                let amount = payment.amount;
                if (payment.currency === "TRY") {
                    amount = amount / exchangeRates.USD_TRY;
                } else if (payment.currency === "EUR") {
                    amount = (amount * exchangeRates.EUR_TRY) / exchangeRates.USD_TRY;
                }
                return sum + amount;
            }, 0);

            const remainingAmount = totalAmount - totalPaid;

            if (Math.abs(remainingAmount) > 0.01) { // Using 0.01 for floating point comparison
                throw new Error(`Kalan tutar (${remainingAmount.toFixed(2)} USD) sıfır olmalıdır`);
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