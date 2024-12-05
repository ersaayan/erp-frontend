import { useState, useEffect } from 'react';
import { Attribute } from '../types';

export const useAttributes = () => {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                const response = await fetch(`${process.env.BASE_URL}/attributes`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                        },
                        credentials: 'include',
                    }
                );
                const data: Attribute[] = await response.json();
                setAttributes(data);
                setError(null);
            } catch (err) {
                setError('Özellikler yüklenirken bir hata oluştu');
                console.error('Error fetching attributes:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttributes();
    }, []);

    return { attributes, loading, error };
};