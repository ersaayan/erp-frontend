'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Plus,
    RefreshCw,
    Import,
} from 'lucide-react';

const BundleSetToolbar: React.FC = () => {
    return (
        <div className="flex justify-between items-center gap-2">
            <div className="flex-1 max-w-sm flex items-center gap-2">
                <div className="relative flex-1">
                    <Input
                        placeholder="Ara... [ENTER]"
                        className="pl-8"
                    />
                    <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>
                <Button variant="destructive" size="sm">
                    Filtreleri Temizle
                </Button>
                <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Yenile
                </Button>

                <Button variant="default" size="sm" className="bg-[#84CC16] hover:bg-[#65A30D]">
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Gruplu Stok
                </Button>

                <Button variant="default" size="sm" className="bg-[#3070e6] hover:bg-[#254785]">
                    <Import className="h-4 w-4 mr-2" />
                    Bundle/Set İçe Aktar
                </Button>
            </div>
        </div>
    );
};

export default BundleSetToolbar;