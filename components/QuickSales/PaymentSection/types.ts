export interface PaymentDetails {
    id: string;
    method: 'cash' | 'card' | 'bank' | 'openAccount';
    amount: number;
    accountId: string;
    currency: string;
    description?: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

export interface PaymentAccount {
    id: string;
    name: string;
    type: 'vault' | 'pos' | 'bank';
    currency: string;
}

export interface PaymentSectionProps {
    cart: Array<{
        unitPrice: number;
        quantity: number;
        discountAmount: number;
        vatAmount: number;
        totalAmount: number;
        currency: string;
    }>;
    payments: PaymentDetails[];
    onPaymentsChange: (payments: PaymentDetails[]) => void;
    onProcessPayment: (payments: PaymentDetails[]) => Promise<void>;
    loading: boolean;
}