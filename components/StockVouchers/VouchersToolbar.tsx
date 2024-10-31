'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
    RefreshCw,
    ArrowLeftRight,
    Calculator,
    ArrowRight,
    ArrowDown,
    ArrowUp,
    Flame
} from 'lucide-react';

const VouchersToolbar: React.FC = () => {
    return (
        <div className="flex justify-end items-center gap-2">
            <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
            </Button>

            <Button variant="outline" size="sm" className="bg-[#F59E0B] text-white hover:bg-[#D97706]">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Devir Fişi
            </Button>

            <Button variant="outline" size="sm" className="bg-[#3B82F6] text-white hover:bg-[#2563EB]">
                <Calculator className="h-4 w-4 mr-2" />
                Sayım Fişi
            </Button>

            <Button variant="outline" size="sm" className="bg-[#3B82F6] text-white hover:bg-[#2563EB]">
                <ArrowRight className="h-4 w-4 mr-2" />
                Nakil Fişi
            </Button>

            <Button variant="outline" size="sm" className="bg-[#84CC16] text-white hover:bg-[#65A30D]">
                <ArrowDown className="h-4 w-4 mr-2" />
                Giriş Fişi
            </Button>

            <Button variant="outline" size="sm" className="bg-[#EF4444] text-white hover:bg-[#DC2626]">
                <ArrowUp className="h-4 w-4 mr-2" />
                Çıkış Fişi
            </Button>

            <Button variant="outline" size="sm" className="bg-[#EF4444] text-white hover:bg-[#DC2626]">
                <Flame className="h-4 w-4 mr-2" />
                Fire Fişi
            </Button>
        </div>
    );
};

export default VouchersToolbar;