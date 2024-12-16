/* eslint-disable @typescript-eslint/no-unused-vars */
import { User, UserFormData } from "@/components/users/types";

const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

const token = localStorage.getItem("auth_token");

export const userService = {
    async getUsers() {
        const response = await fetch(`${process.env.BASE_URL}/users/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`, // Doğru token'ı burada eklediğinizden emin olun
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch users");
        return response.json();
    },

    async createUser(data: UserFormData) {
        const response = await fetch(`${process.env.BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                ...getAuthHeader(),
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to create user");
        return response.json();
    },

    async updateUser(id: string, data: Partial<UserFormData>) {
        // datanın içinde permission varsa onu kaldırıyoruz
        delete data.permissions;
        const response = await fetch(`${process.env.BASE_URL}/users/${id}`, {
            method: "PUT",
            headers: {
                ...getAuthHeader(),
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update user");
        return response.json();
    },

    async deleteUser(id: string) {
        const response = await fetch(`${process.env.BASE_URL}/users/${id}`, {
            method: "DELETE",
            headers: getAuthHeader(),
            credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to delete user");
        return response.json();
    },

    async getCompanies() {
        const response = await fetch(`${process.env.BASE_URL}/companies/`, {
            headers: getAuthHeader(),
            credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch companies");
        return response.json();
    },

    async getRoles() {
        const response = await fetch(`${process.env.BASE_URL}/roles/`, {
            headers: getAuthHeader(),
            credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch roles");
        return response.json();
    },
};