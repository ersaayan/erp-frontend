import { useState, useEffect } from 'react';
import { Company } from '@/components/users/types';
import { useToast } from './use-toast';

export const useCompanies = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.BASE_URL}/companies`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch companies");
                }

                const data = await response.json();
                setCompanies(data);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to load companies";
                setError(errorMessage);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorMessage,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, [toast]);

    return {
        companies,
        loading,
        error,
    };
};