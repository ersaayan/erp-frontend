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
    priceListId: string;
    priceList?: {
        id: string;
        priceListName: string;
        currency: string;
        isVatIncluded: boolean;
    }
}

export interface Payment {
    method: 'cash' | 'card' | 'bank' | 'openAccount';
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
    branchCode: string;
    warehouseId: string;
}