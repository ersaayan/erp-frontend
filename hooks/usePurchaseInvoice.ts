import { useState, useCallback } from 'react';
import { InvoiceFormData, StockItem } from '@/components/PurchaseInvoice/types';
import { PaymentDetails } from '@/components/PurchaseInvoice/PaymentSection/types';
import { useToast } from '@/hooks/use-toast';

interface ValidationErrors {
    invoiceForm?: {
        [key: string]: string;
    };
    products?: string;
    payments?: string;
}

export const usePurchaseInvoice = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const validateForm = useCallback((
        invoiceData: InvoiceFormData,
        products: StockItem[],
        payments: PaymentDetails[]
    ): ValidationErrors | null => {
        const errors: ValidationErrors = {};

        // Validate invoice form
        const formErrors: { [key: string]: string } = {};
        if (!invoiceData.invoiceNo) formErrors.invoiceNo = 'Fatura numarası zorunludur';
        if (!invoiceData.gibInvoiceNo) formErrors.gibInvoiceNo = 'GİB numarası zorunludur';
        if (!invoiceData.branchCode) formErrors.branchCode = 'Şube seçimi zorunludur';
        if (!invoiceData.warehouseId) formErrors.warehouseId = 'Depo seçimi zorunludur';
        if (!invoiceData.current) formErrors.current = 'Cari seçimi zorunludur';

        if (Object.keys(formErrors).length > 0) {
            errors.invoiceForm = formErrors;
        }

        // Validate products
        if (products.length === 0) {
            errors.products = 'En az bir ürün eklenmeli';
        }

        // Validate payments
        if (payments.length === 0) {
            errors.payments = 'En az bir ödeme eklenmeli';
        }

        return Object.keys(errors).length > 0 ? errors : null;
    }, []);

    const handleSubmit = useCallback(async (
        invoiceData: InvoiceFormData,
        products: StockItem[],
        payments: PaymentDetails[]
    ) => {
        try {
            setLoading(true);

            // Validate form data
            const errors = validateForm(invoiceData, products, payments);
            if (errors) {
                console.error('Validation errors:', errors);
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: "Please check the form for errors",
                });
                return { success: false, errors };
            }

            // Calculate totals
            const totalAmount = products.reduce((sum, product) => sum + product.totalAmount, 0);
            const totalVat = products.reduce((sum, product) => sum + product.vatAmount, 0);
            const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

            // Prepare invoice data
            const invoicePayload = {
                invoiceNo: invoiceData.invoiceNo,
                gibInvoiceNo: invoiceData.gibInvoiceNo,
                invoiceDate: invoiceData.invoiceDate.toISOString(),
                paymentDate: invoiceData.paymentDate.toISOString(),
                paymentDay: invoiceData.paymentTerm,
                branchCode: invoiceData.branchCode,
                warehouseId: invoiceData.warehouseId,
                description: invoiceData.description,
                currentCode: invoiceData.current?.currentCode,
                priceListId: invoiceData.current?.priceList?.id,
                totalAmount,
                totalVat,
                totalPaid,
                totalDebt: totalAmount - totalPaid,
                items: products.map(product => ({
                    stockCardId: product.stockId,
                    quantity: product.quantity,
                    unitPrice: product.unitPrice,
                    vatRate: product.vatRate,
                    vatAmount: product.vatAmount,
                    totalAmount: product.totalAmount,
                    priceListId: product.priceListId,
                    currency: product.currency,
                })),
                payments: payments.map(payment => ({
                    method: payment.method,
                    accountId: payment.accountId,
                    amount: payment.amount,
                    currency: payment.currency,
                    description: payment.description,
                })),
            };

            // Send request to API
            const response = await fetch(`${process.env.BASE_URL}/invoices/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                credentials: 'include',
                body: JSON.stringify(invoicePayload),
            });

            if (!response.ok) {
                throw new Error('Failed to save invoice');
            }

            toast({
                title: "Success",
                description: "Invoice saved successfully",
            });

            return { success: true };
        } catch (error) {
            console.error('Error saving invoice:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save invoice",
            });
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, [toast, validateForm]);

    return {
        loading,
        handleSubmit,
        validateForm,
    };
};