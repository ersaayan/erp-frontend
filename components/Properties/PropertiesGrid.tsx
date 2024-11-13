'use client';

import React, { useEffect, useState } from 'react';
import DataGrid, {
    Column,
    FilterRow,
    HeaderFilter,
    Grouping,
    GroupPanel,
    Paging,
    Scrolling,
    SearchPanel,
    Selection,
    Toolbar,
    Item,
    ColumnChooser,
    ColumnFixing,
    StateStoring,
    LoadPanel,
} from 'devextreme-react/data-grid';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { usePropertyDialog } from './usePropertyDialog';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';

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

const PropertiesGrid: React.FC = () => {
    const { openDialog } = usePropertyDialog();
    const [attributes, setAttributes] = useState<GroupedAttribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttributes = async () => {
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
        };

        fetchAttributes();
    }, []);

    const renderEditButton = (data: any) => {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => openDialog({
                    id: data.data.id,
                    name: data.data.name,
                    values: data.data.values,
                    createdAt: data.data.createdAt,
                    updatedAt: data.data.updatedAt
                })}
            >
                <Edit className="h-4 w-4" />
            </Button>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading attributes...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <DataGrid
            dataSource={attributes}
            showBorders={true}
            showRowLines={true}
            showColumnLines={true}
            rowAlternationEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            columnAutoWidth={true}
            wordWrapEnabled={true}
            height="calc(100vh - 250px)"
        >
            <StateStoring enabled={true} type="localStorage" storageKey="propertiesGrid" />
            <LoadPanel enabled={true} />
            <Selection mode="multiple" showCheckBoxesMode="always" />
            <FilterRow visible={true} />
            <HeaderFilter visible={true} />
            <GroupPanel visible={true} />
            <Grouping autoExpandAll={false} />
            <ColumnChooser enabled={true} mode="select" />
            <ColumnFixing enabled={true} />
            <Scrolling mode="virtual" rowRenderingMode="virtual" />
            <Paging enabled={false} />
            <SearchPanel visible={true} width={240} placeholder="Ara..." />

            <Column type="buttons" width={70} cellRender={renderEditButton} />
            <Column dataField="name" caption="Özellik Adı" />
            <Column dataField="values" caption="Değerler" cellRender={(data) => {
                const values = data.value || [];
                return (
                    <div className="flex flex-wrap gap-1">
                        {values.map((value: string, index: number) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                                {value}
                            </span>
                        ))}
                    </div>
                );
            }} />

            <Toolbar>
                <Item name='groupPanel' location='before' />
                <Item name="searchPanel" location='after' />
                <Item name="columnChooserButton" location='after' />
            </Toolbar>
        </DataGrid>
    );
};

export default PropertiesGrid;