'use client';

import React from 'react';
import { Card } from "@/components/ui/card";
import CategoriesToolbar from './CategoriesToolbar';
import CategoriesTreeList from './CategoriesTreeList';
import CategoryDialog from './CategoryDialog';

const Categories: React.FC = () => {
    return (
        <div className="grid-container">
            <CategoriesToolbar />
            <Card className='mt-4'>
                <CategoriesTreeList />
            </Card>
            <CategoryDialog />
        </div>
    );
};

export default Categories;