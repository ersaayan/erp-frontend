import { useState, useCallback, useEffect } from 'react';
import { CurrentFormData } from '../types';
import { useToast } from '@/hooks/use-toast';

// Storage keys for form data
const STORAGE_KEY = 'current_form_data';
const EDIT_MODE_KEY = 'current_form_edit_mode';

const initialFormData: CurrentFormData = {
    currentCode: '',
    currentName: '',
    firstName: '',
    lastName: '',
    priceListId: '',
    currentType: '',
    institution: '',
    identityNo: '',
    taxNumber: '',
    taxOffice: '',
    kepAddress: '',
    mersisNo: '',
    sicilNo: '',
    title: '',
    webSite: '',
    birthOfDate: null,
    categories: [],
    addresses: [],
};

export const useCurrentForm = () => {
    const [formData, setFormData] = useState<CurrentFormData>(() => {
        if (typeof window === 'undefined') return initialFormData;

        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return initialFormData;

        try {
            const parsedData = JSON.parse(savedData);
            // Convert date strings back to Date objects
            if (parsedData.birthOfDate) {
                parsedData.birthOfDate = new Date(parsedData.birthOfDate);
            }
            return parsedData;
        } catch {
            return initialFormData;
        }
    });

    const [isEditMode, setIsEditMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(EDIT_MODE_KEY) === 'true';
    });

    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        if (formData !== initialFormData) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        }
    }, [formData]);

    // Update form data
    const updateFormData = useCallback((updates: Partial<CurrentFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    }, []);

    // Clear form data
    const clearFormData = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(EDIT_MODE_KEY);
        setFormData(initialFormData);
        setIsEditMode(false);
    }, []);

    // Load existing current data for editing
    const loadCurrentData = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.BASE_URL}/currents/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to fetch current data');

            const data = await response.json();
            setFormData({
                ...data,
                birthOfDate: data.birthOfDate ? new Date(data.birthOfDate) : null,
            });
            setIsEditMode(true);
            localStorage.setItem(EDIT_MODE_KEY, 'true');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load current data',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        try {
            setLoading(true);

            // Validate required fields
            if (!formData.currentCode || !formData.currentName) {
                toast({
                    variant: 'destructive',
                    title: 'Validation Error',
                    description: 'Please fill in all required fields',
                });
                return;
            }

            const url = isEditMode
                ? `${process.env.BASE_URL}/currents/${formData.id}`
                : `${process.env.BASE_URL}/currents`;

            const response = await fetch(url, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(isEditMode ? 'Failed to update current' : 'Failed to create current');
            }

            toast({
                title: 'Success',
                description: isEditMode ? 'Current updated successfully' : 'Current created successfully',
            });

            clearFormData();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save current',
            });
        } finally {
            setLoading(false);
        }
    }, [formData, isEditMode, toast, clearFormData]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            // Only clear if not in edit mode
            if (!isEditMode) {
                clearFormData();
            }
        };
    }, [isEditMode, clearFormData]);

    return {
        formData,
        isEditMode,
        loading,
        updateFormData,
        loadCurrentData,
        handleSubmit,
        clearFormData,
    };
};
