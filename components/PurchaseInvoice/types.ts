export interface PurchaseInvoiceItem {
    id: string;
    productId: string;
    productCode: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    vatRate: number;
    vatAmount: number;
    discountRate: number;
    discountAmount: number;
    totalAmount: number;
    netAmount: number;
}

export interface PaymentPlanItem {
    id: string;
    dueDate: Date;
    amount: number;
    paymentMethod: 'cash' | 'bank' | 'pos';
    accountId?: string;
    description?: string;
}

export interface PurchaseInvoice {
    id: string;
    invoiceNo: string;
    invoiceDate: Date;
    dueDate: Date;
    currentId: string;
    description: string;
    items: PurchaseInvoiceItem[];
    totalAmount: number;
    totalVat: number;
    totalDiscount: number;
    netAmount: number;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    paymentPlan: PaymentPlanItem[];
}