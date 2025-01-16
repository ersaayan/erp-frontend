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
    };
}