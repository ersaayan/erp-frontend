
import { useState, useEffect } from 'react';

interface Branch {
    id: string;
    branchName: string;
    branchCode: string;
}

interface Warehouse {
    id: string;
    warehouseName: string;
}

interface Vault {
    id: string;
    vaultName: string;
}

interface Bank {
    id: string;
    bankName: string;
}

interface Pos {
    id: string;
    posName: string;
}

export const usePurchaseInvoiceForm = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [posDevices, setPosDevices] = useState<Pos[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    branchesRes,
                    warehousesRes,
                    vaultsRes,
                    banksRes,
                    posRes
                ] = await Promise.all([
                    fetch('http://localhost:1303/branches'),
                    fetch('http://localhost:1303/warehouses'),
                    fetch('http://localhost:1303/vaults'),
                    fetch('http://localhost:1303/banks'),
                    fetch('http://localhost:1303/pos')
                ]);

                const [
                    branchesData,
                    warehousesData,
                    vaultsData,
                    banksData,
                    posData
                ] = await Promise.all([
                    branchesRes.json(),
                    warehousesRes.json(),
                    vaultsRes.json(),
                    banksRes.json(),
                    posRes.json()
                ]);

                setBranches(branchesData);
                setWarehouses(warehousesData);
                setVaults(vaultsData);
                setBanks(banksData);
                setPosDevices(posData);
            } catch (error) {
                console.error('Error fetching form data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const generateInvoiceNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `FT${year}${month}${day}${random}`;
    };

    const generateGibNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `GIB${year}${random}`;
    };

    return {
        branches,
        warehouses,
        vaults,
        banks,
        posDevices,
        isLoading,
        generateInvoiceNumber,
        generateGibNumber,
    };
};