export interface Receipt {
    id: string;
    receiptType: 'Giris' | 'Cikis';
    receiptDate: string;
    documentNo: string;
    branchCode: string;
    isTransfer: boolean;
    outWarehouse: string | null;
    inWarehouse: string | null;
    description: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    currentId: string;
    currentMovementId: string;
    current: {
        id: string;
        currentCode: string;
        currentName: string;
        currentType: string;
        institution: string;
        identityNo: string;
        taxNumber: string;
        taxOffice: string;
        title: string;
        name: string;
        surname: string;
        webSite: string;
        birthOfDate: string;
        kepAddress: string;
        mersisNo: string;
        sicilNo: string;
        priceListId: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string | null;
        updatedBy: string | null;
        priceList?: {
            id: string;
            priceListName: string;
            currency: string;
            isVatIncluded: boolean;
            isActive: boolean;
        };
    };
}

export interface ReceiptDetail {
    id: string;
    receiptType: 'Giris' | 'Cikis';
    receiptDate: string;
    documentNo: string;
    branchCode: string;
    isTransfer: boolean;
    outWarehouse: string | null;
    inWarehouse: string | null;
    description: string;
    createdBy: string;
    updatedBy: string | null;
    createdAt: string;
    currentId: string;
    currentMovementId: string;
    receiptDetail: Array<{
        id: string;
        receiptId: string;
        stockCardId: string;
        quantity: string;
        unitPrice: string;
        totalPrice: string;
        vatRate: string;
        discount: string;
        netPrice: string;
        createdAt: string;
        updatedAt: string;
        stockCard: {
            id: string;
            productCode: string;
            productName: string;
            unit: string;
            shortDescription: string;
            description: string;
            companyCode: string;
            branchCode: string;
            brandId: string;
            productType: string;
            kdv: string | null;
            gtip: string | null;
            pluCode: string | null;
            desi: string | null;
            adetBoleni: string | null;
            siraNo: string | null;
            raf: string | null;
            karMarji: string | null;
            riskQuantities: string | null;
            maliyet: string;
            maliyetDoviz: string;
            stockStatus: boolean;
            hasExpirationDate: boolean;
            allowNegativeStock: boolean;
            createdAt: string;
            updatedAt: string;
            createdBy: string | null;
            updatedBy: string | null;
        };
    }>;
    current: {
        id: string;
        currentCode: string;
        currentName: string;
        currentType: string;
        institution: string;
        identityNo: string;
        taxNumber: string;
        taxOffice: string;
        title: string;
        name: string | null;
        surname: string | null;
        webSite: string;
        birthOfDate: string | null;
        kepAddress: string;
        mersisNo: string;
        sicilNo: string;
        priceListId: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string | null;
        updatedBy: string | null;
        priceList: {
            id: string;
            priceListName: string;
            currency: string;
            isVatIncluded: boolean;
            isActive: boolean;
        };
    };
    currentMovement: {
        id: string;
        currentCode: string;
        dueDate: string | null;
        description: string;
        debtAmount: string;
        creditAmount: string;
        priceListId: string | null;
        movementType: string;
        documentType: string;
        documentNo: string | null;
        companyCode: string;
        branchCode: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        updatedBy: string | null;
        paymentType: string | null;
    };
    createdByUser: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        address: string;
        isActive: boolean;
        companyCode: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string | null;
        updatedBy: string | null;
    };
}