export interface PaymentDetails {
    id: string;
    method: "cash" | "card" | "wire" | "openAccount";
    accountId: string;
    amount: number;
    currency: string;
    description?: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    currency: string;
    balance?: string;
}

export interface PaymentSummary {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    currency: string;
}