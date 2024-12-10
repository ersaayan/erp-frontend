import { useState, useCallback } from 'react';
import { z } from 'zod';
import { purchaseInvoiceSchema } from '@/lib/validations/purchaseInvoice';
import { useToast } from '@/hooks/use-toast';
import { InvoiceFormData } from '@/components/PurchaseInvoice/types';

// Type-safe field keys
type FormFields = keyof InvoiceFormData;

// Strongly typed error interface
interface FieldError {
    field: FormFields;
    message: string;
}

// Form state interface
interface FormState {
    formData: Partial<InvoiceFormData>;
    errors: FieldError[];
    touched: Set<FormFields>;
    isValid: boolean;
}

export const usePurchaseInvoiceForm = (initialData?: Partial<InvoiceFormData>) => {
    const [state, setState] = useState<FormState>({
        formData: initialData || {},
        errors: [],
        touched: new Set(),
        isValid: false,
    });

    const { toast } = useToast();

    const validateField = useCallback((field: FormFields, value: unknown) => {
        try {
            const fieldSchema = purchaseInvoiceSchema.shape[field];
            if (fieldSchema) {
                fieldSchema.parse(value);
                setState(prev => ({
                    ...prev,
                    errors: prev.errors.filter(error => error.field !== field)
                }));
                return true;
            }
            return false;
        } catch (error) {
            if (error instanceof z.ZodError) {
                setState(prev => ({
                    ...prev,
                    errors: [
                        ...prev.errors.filter(e => e.field !== field),
                        { field, message: error.errors[0].message }
                    ]
                }));
                return false;
            }
            return false;
        }
    }, []);

    const handleFieldChange = useCallback((field: FormFields, value: unknown) => {
        setState(prev => {
            const newFormData = { ...prev.formData, [field]: value };
            const newTouched = new Set([...prev.touched, field]);

            return {
                ...prev,
                formData: newFormData,
                touched: newTouched,
                isValid: validateFormData(newFormData)
            };
        });

        validateField(field, value);
    }, [validateField]);

    const handleFieldBlur = useCallback((field: FormFields) => {
        setState(prev => ({
            ...prev,
            touched: new Set([...prev.touched, field])
        }));
        validateField(field, state.formData[field]);
    }, [state.formData, validateField]);

    const validateFormData = useCallback((data: Partial<InvoiceFormData>): boolean => {
        try {
            purchaseInvoiceSchema.parse(data);
            return true;
        } catch (error) {
            return false;
        }
    }, []);

    const getFieldError = useCallback((field: FormFields): string | undefined => {
        return state.errors.find(error => error.field === field)?.message;
    }, [state.errors]);

    const isFieldValid = useCallback((field: FormFields): boolean => {
        return state.touched.has(field) && !getFieldError(field);
    }, [state.touched, getFieldError]);

    const getHelperText = useCallback((field: FormFields): string | undefined => {
        if (state.touched.has(field)) {
            const error = getFieldError(field);
            if (error) return error;
            if (isFieldValid(field)) return 'Geçerli';
        }
        return undefined;
    }, [state.touched, getFieldError, isFieldValid]);

    const getFieldProps = useCallback((field: FormFields) => {
        return {
            value: state.formData[field] || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                handleFieldChange(field, e.target.value),
            onBlur: () => handleFieldBlur(field),
            error: getFieldError(field),
            helperText: getHelperText(field),
            isValid: isFieldValid(field),
            'aria-invalid': state.touched.has(field) && !!getFieldError(field),
            'aria-describedby': `${field}-helper-text`
        };
    }, [state.formData, state.touched, handleFieldChange, handleFieldBlur, getFieldError, getHelperText, isFieldValid]);

    const validateForm = useCallback((): boolean => {
        try {
            purchaseInvoiceSchema.parse(state.formData);
            setState(prev => ({ ...prev, isValid: true }));
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: FieldError[] = error.errors.map(err => ({
                    field: err.path[0] as FormFields,
                    message: err.message
                }));

                setState(prev => ({
                    ...prev,
                    errors: newErrors,
                    isValid: false
                }));

                toast({
                    variant: "destructive",
                    title: "Form Hatası",
                    description: "Lütfen zorunlu alanları doldurun"
                });
            }
            return false;
        }
    }, [state.formData, toast]);

    return {
        formData: state.formData,
        errors: state.errors,
        touched: state.touched,
        isValid: state.isValid,
        handleFieldChange,
        handleFieldBlur,
        getFieldError,
        isFieldValid,
        validateForm,
        getHelperText,
        getFieldProps,
    };
};