import { useState, useCallback, useEffect } from 'react';
import { CurrentFormData } from '../types';
import { useToast } from '@/hooks/use-toast';

// Storage keys for form data
const STORAGE_KEY = 'current_form_data';
const EDIT_MODE_KEY = 'current_form_edit_mode';

const initialFormData: CurrentFormData = {
    currentCode: '',
    currentName: '',
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
        // Tarayıcı ortamında değilse başlangıç verilerini döndür
        if (typeof window === 'undefined') return initialFormData;

        try {
            // LocalStorage'dan verileri al
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (!savedData) return initialFormData;

            const parsedData = JSON.parse(savedData);

            // Tarihi ve diğer verileri doğru formatta dönüştür
            return {
                ...initialFormData, // Varsayılan değerleri temel al
                ...parsedData, // Kaydedilmiş verileri ekle
                birthOfDate: parsedData.birthOfDate ? new Date(parsedData.birthOfDate) : null,
                categories: Array.isArray(parsedData.categories) ? parsedData.categories : [],
                addresses: Array.isArray(parsedData.addresses) ? parsedData.addresses : [],
            };
        } catch (error) {
            console.error('Form verilerini yüklerken hata:', error);
            return initialFormData;
        }
    });

    const [isEditMode, setIsEditMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(EDIT_MODE_KEY) === 'true';
    });

    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Load saved form data on mount
    useEffect(() => {
        const savedFormData = localStorage.getItem('currentFormData');
        if (savedFormData) {
            try {
                const parsedData = JSON.parse(savedFormData);
                // Form verilerini doğru şekilde dönüştür
                setFormData({
                    ...initialFormData,
                    ...parsedData,
                    birthOfDate: parsedData.birthOfDate ? new Date(parsedData.birthOfDate) : null,
                    categories: Array.isArray(parsedData.categories) ? parsedData.categories : [],
                    addresses: Array.isArray(parsedData.addresses) ? parsedData.addresses : []
                });
                setIsEditMode(true);

                // Form verisi kullanıldıktan sonra localStorage'dan temizle
                localStorage.removeItem('currentFormData');
            } catch (error) {
                console.error('Form verilerini ayrıştırma hatası:', error);
                toast({
                    variant: "destructive",
                    title: "Hata",
                    description: "Form verileri yüklenirken bir hata oluştu"
                });
            }
        }
    }, [toast]);

    // Form verilerini güncelleme
    const updateFormData = useCallback((updates: Partial<CurrentFormData>) => {
        setFormData(prev => {
            const newData = { ...prev, ...updates };
            // Güncellenmiş verileri hemen localStorage'a kaydet
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            } catch (error) {
                console.error('Form verilerini kaydederken hata:', error);
            }
            return newData;
        });
    }, []);

    // Form verilerini temizleme
    const clearFormData = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(EDIT_MODE_KEY);
        setFormData(initialFormData);
        setIsEditMode(false);
    }, []);

    // Mevcut veriyi yükleme
    const loadCurrentData = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.BASE_URL}/currents/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Cari veri yüklenemedi');

            const data = await response.json();
            const formattedData = {
                ...data,
                birthOfDate: data.birthOfDate ? new Date(data.birthOfDate) : null,
            };

            setFormData(formattedData);
            setIsEditMode(true);
            localStorage.setItem(EDIT_MODE_KEY, 'true');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedData));
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Hata',
                description: 'Cari veri yüklenirken bir hata oluştu',
            });
            throw error;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Form gönderimi
    const handleSubmit = useCallback(async () => {
        try {
            setLoading(true);

            if (!formData.currentCode || !formData.currentName) {
                toast({
                    variant: 'destructive',
                    title: 'Doğrulama Hatası',
                    description: 'Lütfen zorunlu alanları doldurun',
                });
                return;
            }

            const url = isEditMode
                ? `${process.env.BASE_URL}/currents/${formData.id}`
                : `${process.env.BASE_URL}/currents/create`;

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
                throw new Error(isEditMode ? 'Cari güncellenemedi' : 'Cari oluşturulamadı');
            }

            toast({
                title: 'Başarılı',
                description: isEditMode ? 'Cari başarıyla güncellendi' : 'Cari başarıyla oluşturuldu',
            });

            clearFormData();
            window.dispatchEvent(new CustomEvent("refreshCurrents"));
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Hata',
                description: error instanceof Error ? error.message : 'Cari kaydedilirken bir hata oluştu',
            });
        } finally {
            setLoading(false);
        }
    }, [formData, isEditMode, toast, clearFormData]);

    // Component kaldırıldığında temizlik
    useEffect(() => {
        return () => {
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