import { useState, useEffect } from 'react';

export interface Warehouse {
    id: string;
    warehouseName: string;
    warehouseCode: string;
    address: string;
    countryCode: string;
    city: string;
    district: string;
    phone: string;
    email: string;
    companyCode: string;
}

export const useWarehouses = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const response = await fetch(`${process.env.BASE_URL}/warehouses`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                        },
                        credentials: 'include',
                    }
                );
                const data = await response.json();
                setWarehouses(data);
                setError(null);
            } catch (err) {
                setError('Depolar yüklenirken bir hata oluştu');
                console.error('Error fetching warehouses:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchWarehouses();
    }, []);

    return { warehouses, loading, error };
};