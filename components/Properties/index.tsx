// components/Properties/PropertiesPage.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PropertiesToolbar from './PropertiesToolbar';
import PropertiesGrid from './PropertiesGrid';
import PropertyDialog from './PropertyDialog';
import { usePropertyDialog } from './usePropertyDialog';
import { useToast } from '@/hooks/use-toast';

interface Attribute {
    id: string;
    attributeName: string;
    value: string;
}

interface GroupedAttribute {
    name: string;
    values: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

const Properties: React.FC = () => {
    const [attributes, setAttributes] = useState<GroupedAttribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { isOpen, closeDialog } = usePropertyDialog();

    const fetchAttributes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:1303/attributes');
            if (!response.ok) {
                throw new Error('Failed to fetch attributes');
            }
            const data: Attribute[] = await response.json();

            // Group attributes by name
            const groupedData = data.reduce((acc, curr) => {
                const existing = acc.find(item => item.name === curr.attributeName);
                if (existing) {
                    existing.values.push(curr.value);
                } else {
                    acc.push({
                        name: curr.attributeName,
                        values: [curr.value],
                    });
                }
                return acc;
            }, [] as GroupedAttribute[]);

            setAttributes(groupedData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching attributes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAttributes();
    }, [fetchAttributes]);

    return (
        <div>
            <PropertiesToolbar onRefresh={fetchAttributes} />
            <PropertiesGrid
                attributes={attributes}
                loading={loading}
                error={error}
                onRefresh={fetchAttributes}
            />
            <PropertyDialog isOpen={isOpen} onClose={closeDialog} onRefresh={fetchAttributes} />
        </div>
    );
};

export default Properties;