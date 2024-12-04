export interface PaymentAccount {
    id: string;
    name: string;
    accountNumber?: string;
    currency: string;
}

export interface PaymentDetails {
    id: string;
    type: 'cash' | 'card' | 'transfer' | 'credit';
    amount: number;
    accountId?: string;
    accountName?: string;
    accountDetails?: string;
    date: Date;
    description?: string;
}

export interface PaymentMethod {
    id: string;
    type: PaymentDetails['type'];
    amount: number;
    accountId?: string;
}