import { useState, useCallback } from 'react';
import { PaymentDetails, PaymentMethod } from './types';

export const usePayments = (total: number) => {
    const [payments, setPayments] = useState<PaymentDetails[]>([]);

    const addPayment = useCallback((payment: PaymentMethod, accountName?: string, accountDetails?: string) => {
        const newPayment: PaymentDetails = {
            id: payment.id,
            type: payment.type,
            amount: payment.amount,
            accountId: payment.accountId,
            accountName,
            accountDetails,
            date: new Date(),
            description: getPaymentDescription(payment.type, accountName)
        };

        setPayments(prev => [...prev, newPayment]);
    }, []);

    const updatePayment = useCallback((paymentId: string, updates: Partial<PaymentDetails>) => {
        setPayments(prev =>
            prev.map(payment =>
                payment.id === paymentId ? { ...payment, ...updates } : payment
            )
        );
    }, []);

    const removePayment = useCallback((paymentId: string) => {
        setPayments(prev => prev.filter(payment => payment.id !== paymentId));
    }, []);

    const getRemainingAmount = useCallback(() => {
        const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        return total - paidAmount;
    }, [payments, total]);

    return {
        payments,
        addPayment,
        updatePayment,
        removePayment,
        getRemainingAmount
    };
};

function getPaymentDescription(type: PaymentDetails['type'], accountName?: string): string {
    switch (type) {
        case 'cash':
            return `Nakit ödeme - ${accountName || 'Kasa'}`;
        case 'card':
            return `Kredi kartı ödemesi - ${accountName || 'POS'}`;
        case 'transfer':
            return `Havale/EFT ödemesi - ${accountName || 'Banka'}`;
        case 'credit':
            return 'Açık hesap ödemesi';
        default:
            return '';
    }
}