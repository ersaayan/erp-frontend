export const categories = [
    {
        id: 1,
        name: "Aksesuar",
        code: "AKS",
        isMainCategory: true,
        parentId: null,
        marketplaces: ["Trendyol", "Nesilce E-Ticaret"],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
    },
    {
        id: 2,
        name: "Altın",
        code: "ALT",
        isMainCategory: false,
        parentId: 1,
        marketplaces: ["Trendyol"],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
    },
    {
        id: 3,
        name: "Ata Altın",
        code: "ATA",
        isMainCategory: false,
        parentId: 2,
        marketplaces: ["Trendyol"],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
    }
];

export const marketplaces = [
    {
        id: 1,
        name: "Trendyol",
        isActive: true,
        categories: ["Aksesuar", "Altın", "Giyim"]
    },
    {
        id: 2,
        name: "Nesilce E-Ticaret",
        isActive: true,
        categories: ["Aksesuar", "Elektronik"]
    }
];