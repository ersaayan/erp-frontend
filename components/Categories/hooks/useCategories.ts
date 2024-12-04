import { useState, useEffect } from 'react';
import { Category } from '../types';

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.BASE_URL}/categories/withParents`);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            setCategories(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching categories');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return { categories, loading, error, fetchCategories };
};