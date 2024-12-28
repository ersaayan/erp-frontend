export interface Current {
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
    webSite: string | null;
    birthOfDate: string | null;
    kepAddress: string | null;
    mersisNo: string | null;
    sicilNo: string | null;
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
}

export interface CurrentMovement {
    id: string;
    currentCode: string;
    dueDate: string;
    description: string;
    debtAmount: string | null;
    creditAmount: string | null;
    priceListId: string;
    movementType: string;
    documentType: string;
    documentNo: string;
    companyCode: string;
    branchCode: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
}