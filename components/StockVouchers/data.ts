export const vouchers = [
    {
        id: 1,
        date: new Date(2024, 9, 23),
        type: "Devir Fişi",
        documentNo: "",
        accountType: "Genel",
        operation: "-",
        totalLocation: "500,00",
        totalStock: "1",
        description: "Devir",
        warehouses: "",
        reference: "",
        user: "info@nesilce.com.tr"
    },
    {
        id: 2,
        date: new Date(2024, 9, 23),
        type: "Sayım Fişi",
        documentNo: "0000003199",
        accountType: "Genel",
        operation: "-",
        totalLocation: "0,00",
        totalStock: "1",
        description: "",
        warehouses: "",
        reference: "",
        user: "info@nesilce.com.tr"
    }
];

export const voucherTypes = [
    "Devir Fişi",
    "Sayım Fişi",
    "Nakil Fişi",
    "Giriş Fişi",
    "Çıkış Fişi",
    "Fire Fişi"
];

export const accountTypes = [
    "Genel",
    "Muhasebe"
];

export const operations = [
    "-",
    "Tümü"
];