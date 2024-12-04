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
    priceList: Array<{
        id?: string;
        priceListName: string;
        currency?: string;
        isVatIncluded?: boolean;
        vatRate?: number;
    }>;

    currentAddress?: Array<{
        id?: string;
        addressName?: string;
        addressType?: string;
        address?: string;
        countryCode?: string;
        city?: string;
        district?: string;
        postalCode?: string;
        phone?: string;
        phone2?: string;
        email?: string;
        email2?: string;
    }>;

    currentFinancial?: Array<{
        id?: string;
        bankName?: string;
        branchName?: string;
        bankBranch?: string;
        bankBranchCode?: string;
        accountNo?: string;
        iban?: string;
    }>;

    currentRisk?: Array<{
        id?: string;
        currency?: string;
        teminatYerelTutar?: string;
        acikHesapYerelLimit?: string;
        hesapKesimGunu?: number;
        vadeGun?: number;
        gecikmeLimitGunu?: number;
        varsayilanAlisIskontosu?: string;
        varsayilanSatisIskontosu?: string;
        ekstreGonder?: boolean;
        limitKontrol?: boolean;
        acikHesap?: boolean;
        posKullanim?: boolean;
    }>;

    currentOfficials?: Array<{
        id?: string;
        title?: string;
        name?: string;
        surname?: string;
        phone?: string;
        email?: string;
        note?: string;
    }>;
}