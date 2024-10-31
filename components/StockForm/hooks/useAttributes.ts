import { useState, useEffect } from 'react';
import { Attribute, GroupedAttribute } from '../types';

export const useAttributes = () => {
    const [attributes, setAttributes] = useState<GroupedAttribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                const response = await fetch('http://localhost:1303/attributes');
                const data: Attribute[] = await response.json();

                // Group attributes by name
                const grouped = data.reduce((acc: { [key: string]: GroupedAttribute }, curr) => {
                    if (!acc[curr.attributeName]) {
                        acc[curr.attributeName] = {
                            name: curr.attributeName,
                            values: []
                        };
                    }
                    acc[curr.attributeName].values.push({
                        id: curr.id,
                        value: curr.value
                    });
                    return acc;
                }, {});

                setAttributes(Object.values(grouped));
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