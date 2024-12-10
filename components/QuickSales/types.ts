export interface CartItem {
    id: string;
    productId: string;
    name: string;
    code: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    discountRate: number;
    discountAmount: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    unit: string;
    currency: string;
}

export interface Customer {
    id: string;
    name: string;
    code: string;
    taxNumber?: string;
    taxOffice?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface Payment {
    method: 'cash' | 'card' | 'transfer';
    amount: number;
    accountId: string;
    currency: string;
    description?: string;
}

export interface Sale {
    id: string;
    date: Date;
    customer?: Customer | null;
    items: CartItem[];
    subtotal: number;
    totalDiscount: number;
    totalVat: number;
    total: number;
    payments: Payment[];
    status: 'pending' | 'completed' | 'cancelled';
    reference?: string;
}