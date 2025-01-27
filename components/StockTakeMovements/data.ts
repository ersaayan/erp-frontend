import { Column } from 'devextreme/ui/data_grid';
import { formatDate } from '@/utils/formatters';

export const columns: Column[] = [
    {
        dataField: 'documentNo',
        caption: 'Belge No',
        width: 140,
    },
    {
        dataField: 'branchCode',
        caption: 'Şube Kodu',
        width: 100,
    },
    {
        dataField: 'stockTakeType',
        caption: 'Sayım Tipi',
        width: 100,
        lookup: {
            dataSource: [
                { id: 'Full', text: 'Tam Sayım' },
                { id: 'Partial', text: 'Kısmi Sayım' },
            ],
            valueExpr: 'id',
            displayExpr: 'text',
        },
    },
    {
        dataField: 'status',
        caption: 'Durum',
        width: 120,
        lookup: {
            dataSource: [
                { id: 'Completed', text: 'Tamamlandı' },
                { id: 'InProgress', text: 'Devam Ediyor' },
                { id: 'Cancelled', text: 'İptal Edildi' },
            ],
            valueExpr: 'id',
            displayExpr: 'text',
        },
    },
    {
        dataField: 'description',
        caption: 'Açıklama',
        width: 200,
    },
    {
        dataField: 'reference',
        caption: 'Referans',
        width: 120,
    },
    {
        dataField: 'startedAt',
        caption: 'Başlangıç Tarihi',
        width: 140,
        calculateCellValue: (rowData) => formatDate(rowData.startedAt),
    },
    {
        dataField: 'completedAt',
        caption: 'Tamamlanma Tarihi',
        width: 140,
        calculateCellValue: (rowData) => formatDate(rowData.completedAt),
    },
    {
        dataField: 'createdBy',
        caption: 'Oluşturan',
        width: 140,
    },
    {
        dataField: 'createdAt',
        caption: 'Oluşturma Tarihi',
        width: 140,
        calculateCellValue: (rowData) => formatDate(rowData.createdAt),
    },
]; 