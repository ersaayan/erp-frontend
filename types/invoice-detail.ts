export interface InvoiceDetailResponse {
    // Temel Fatura Bilgileri
    id: string;
    invoiceNo: string;
    gibInvoiceNo: string;
    invoiceDate: string;
    paymentDate: string;
    paymentTerm: number;
    branchCode: string;
    warehouseId: string;
    description: string;
    invoiceType: 'Purchase' | 'Sales';
    documentType: 'Invoice' | 'Order' | 'Waybill';

    // Cari Bilgileri
    current: {
        id: string;
        currentCode: string;
        currentName: string;
        priceList?: {
            id: string;
            priceListName: string;
            currency: string;
            isVatIncluded: boolean;
        };
    };

    // Ürün Detayları
    items: Array<{
        id: string;
        stockId: string;
        stockCode: string;
        stockName: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        vatRate: number;
        vatAmount: number;
        totalAmount: number;
        priceListId: string;
        currency: string;
        isVatIncluded: boolean;
    }>;

    // Ödeme Bilgileri
    payments: Array<{
        method: 'cash' | 'card' | 'bank' | 'openAccount';
        accountId: string;
        amount: number;
        currency: string;
        description?: string;
    }>;

    // Toplam Değerler
    subtotal: number;
    totalVat: number;
    totalDiscount: number;
    total: number;
    totalPaid: number;
    totalDebt: number;

    // Diğer Bilgiler
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
}