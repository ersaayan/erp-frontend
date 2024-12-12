export interface CurrentFormData {
    id?: string;
    currentCode: string;
    currentName: string;
    firstName: string;
    lastName: string;
    priceListId: string;
    currentType: string;
    institution: string;
    identityNo: string;
    taxNumber: string;
    taxOffice: string;
    kepAddress: string;
    mersisNo: string;
    sicilNo: string;
    title: string;
    webSite: string;
    birthOfDate: Date | null;
    categories: string[];
    addresses: AddressInfo[];
}

export interface AddressInfo {
    id?: string;
    addressName: string;
    addressType: string;
    address: string;
    province: string;
    district: string;
    countryCode: string;
    postalCode: string;
    phone: string;
    phone2: string;
    email: string;
    email2: string;
}

export interface PriceList {
    id: string;
    priceListName: string;
    currency: string;
    isVatIncluded: boolean;
}

export const CURRENT_TYPES = [
    { value: 'AliciSatici', label: 'Alıcı/Satıcı' },
    { value: 'Alici', label: 'Alıcı' },
    { value: 'Satici', label: 'Satıcı' },
    { value: 'SanalPazar', label: 'Sanal Pazar' },
    { value: 'Kurum', label: 'Kurum' },
    { value: 'Ithalat', label: 'İthalat' },
    { value: 'Ihracat', label: 'İhracat' },
    { value: 'IthalatIhracat', label: 'İthalat/İhracat' },
    { value: 'Musteri', label: 'Müşteri' },
    { value: 'Tedarikci', label: 'Tedarikçi' },
    { value: 'Diger', label: 'Diğer' },
];

export const INSTITUTION_TYPES = [
    { value: 'Sirket', label: 'Şirket' },
    { value: 'Sahis', label: 'Şahıs' },
];

export const ADDRESS_TYPES = [
    { value: 'Invoice', label: 'Fatura' },
    { value: 'Shipping', label: 'Sevkiyat' },
    { value: 'Delivery', label: 'Teslimat' },
];
