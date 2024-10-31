export const campaigns = [
    {
        id: 1,
        status: 'active',
        name: 'yeni yıl',
        startDate: new Date('2024-08-27T12:40:00'),
        endDate: new Date('2024-10-30T12:40:00'),
        campaignType: 'Kupon',
        conditionType: 'Adet',
        discountType: 'Oran',
        description: '27.08.2024 12:40 - 30.10.2024 12:40 tarihleri arasında, tüm ürünlerden 1 adet ve üzeri alana, Kategoriler kategorisinde %25 indirim'
    },
    {
        id: 2,
        status: 'active',
        name: 'deneme',
        startDate: new Date('2024-09-01T11:12:00'),
        endDate: new Date('2025-02-01T11:12:00'),
        campaignType: 'Kupon',
        conditionType: 'Adet',
        discountType: 'Adet',
        description: '01.09.2024 11:12 - 01.02.2025 11:12 tarihleri arasında, nakil stok ürününden 1 adet ve üzeri alana, nakil stok üründe 1 adet hediye'
    }
];

export const campaignTypes = ['Kupon', 'Cari', 'Cari Grubu'];
export const conditionTypes = ['Adet', 'Tutar'];
export const discountTypes = ['Oran', 'Tutar', 'Adet'];