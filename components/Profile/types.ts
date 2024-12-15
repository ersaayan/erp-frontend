export interface UserProfile {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    companyCode: string;
}

export interface ProfileFormData {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    companyCode: string;
}