import { useState, useCallback } from 'react';
import { UserProfile, ProfileFormData } from './types';
import { useToast } from '@/hooks/use-toast';

export const useProfile = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.BASE_URL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch profile data");
            }

            const data = await response.json();
            setError(null);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const updateProfile = useCallback(async (data: ProfileFormData): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.BASE_URL}/users/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                credentials: "include",
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    return {
        loading,
        error,
        fetchProfile,
        updateProfile,
    };
};