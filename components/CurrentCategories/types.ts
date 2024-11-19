export interface CurrentCategory {
    id: string;
    categoryName: string;
    categoryCode: string;
    parentCategoryId: string | null;
    parentCategory: {
        id: string;
        categoryName: string;
        categoryCode: string;
        parentCategoryId: string | null;
    } | null;
    parentCategories: Array<{
        id: string;
        categoryName: string;
        categoryCode: string;
        parentCategoryId: string | null;
        parentCategory: {
            id: string;
            categoryName: string;
            categoryCode: string;
            parentCategoryId: string | null;
        } | null;
    }>;
}