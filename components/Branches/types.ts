export interface Branch {
    id: string;
    branchName: string;
    branchCode: string;
    address: string;
    countryCode: string;
    city: string;
    district: string;
    email: string;
    phone: string;
    website: string;
    companyCode: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    company: Company;
    warehouse: Warehouse[];
}

export interface BranchFormData {
    branchName: string;
    branchCode: string;
    address: string;
    countryCode: string;
    city: string;
    district: string;
    email: string;
    phone: string;
    website: string;
    companyCode: string;
    warehouseId: string;
}

export interface Company {
    id: string;
    companyCode: string;
    companyName: string;
}

export interface Warehouse {
    id: string;
    warehouseName: string;
    warehouseCode: string;
}