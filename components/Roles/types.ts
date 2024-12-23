// components/Roles/types.ts
export interface Role {
    id: string;
    roleName: string;
    description: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
}

export interface Permission {
    id: string;
    name: string;
    description: string;
    route: string;
    group: string;
}
