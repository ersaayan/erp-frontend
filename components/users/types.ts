export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address?: string;
    companyCode: string;
    roleName: string;
    status: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
}

export interface Company {
    id: string;
    companyName: string;
    companyCode: string;
}

export interface Role {
    id: string;
    roleName: string;
    description: string;
}

export interface UserFormData {
    username: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone: string;
    address?: string;
    companyCode: string;
    roleName: string;
}