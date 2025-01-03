import { useState, useEffect } from 'react';

export interface Brand {
    id: string;
    brandName: string;
    brandCode: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
}

export const useBrands = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch(`${process.env.BASE_URL}/brands`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                        },
                        credentials: 'include',
                    }
                );
                const data = await response.json();
                setBrands(data);
                setError(null);
            } catch (err) {
                setError('Markalar yüklenirken bir hata oluştu');
                console.error('Error fetching brands:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    return { brands, loading, error };
};