import { useState, useEffect } from 'react';

export interface Current {
    id: string;
    currentName: string;
    currentCode: string;
    currentType: string;
    taxNumber: string;
    taxOffice: string;
    address: string;
    countryCode: string;
    city: string;
    district: string;
    phone: string;
    email: string;
    companyCode: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
}

const VALID_CURRENT_TYPES = ['Ithalat', 'IthalatIhracat', 'Tedarikci'];

export const useCurrents = () => {
    const [currents, setCurrents] = useState<Current[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCurrents = async () => {
            try {
                const response = await fetch('http://localhost:1303/currents');
                const data: Current[] = await response.json();
                
                // Filter currents by type
                const filteredCurrents = data.filter(current => 
                    VALID_CURRENT_TYPES.includes(current.currentType)
                );
                
                setCurrents(filteredCurrents);
                setError(null);
            } catch (err) {
                setError('Cariler yüklenirken bir hata oluştu');
                console.error('Error fetching currents:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrents();
    }, []);

    return { currents, loading, error };
};