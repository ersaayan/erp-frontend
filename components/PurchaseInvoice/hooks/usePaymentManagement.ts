import { useState, useCallback } from 'react';
import { PaymentDetails } from '../PaymentSection/types';
import { useToast } from '@/hooks/use-toast';

export const usePaymentManagement = () => {
    const [payments, setPayments] = useState<PaymentDetails[]>([]);
    const { toast } = useToast();

    const addPayment = useCallback((payment: PaymentDetails) => {
        setPayments(currentPayments => [...currentPayments, payment]);
    }, []);

    const removePayment = useCallback((paymentId: string) => {
        setPayments(currentPayments =>
            currentPayments.filter(payment => payment.id !== paymentId)
        );
    }, []);

    const calculateTotalPaid = useCallback(() => {
        return payments.reduce((total, payment) => total + payment.amount, 0);
    }, [payments]);

    const validatePayments = useCallback((totalAmount: number) => {
        const totalPaid = calculateTotalPaid();
        if (totalPaid > totalAmount) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Total payments cannot exceed invoice amount",
            });
            return false;
        }
        return true;
    }, [calculateTotalPaid, toast]);

    return {
        payments,
        addPayment,
        removePayment,
        calculateTotalPaid,
        validatePayments,
    };
};