import { useState, useEffect } from 'react';
import { Category, CategoryNode } from '../types/category';

const buildCategoryTree = (categories: Category[]): CategoryNode[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootNodes: CategoryNode[] = [];

    // First pass: Create all nodes with initial empty children arrays
    categories.forEach(category => {
        categoryMap.set(category.id, {
            ...category,
            children: [],
            level: 0
        });
    });

    // Second pass: Build the tree structure
    categories.forEach(category => {
        const node = categoryMap.get(category.id)!;

        if (category.parentCategoryId === null) {
            node.level = 0;
            rootNodes.push(node);
        } else {
            const parentNode = categoryMap.get(category.parentCategoryId);
            if (parentNode) {
                node.level = parentNode.level + 1;
                parentNode.children.push(node);
            }
        }
    });

    return rootNodes;
};

export const useCategories = () => {
    const [categories, setCategories] = useState<CategoryNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.BASE_URL}/categories/withParents`);
            const data: Category[] = await response.json();
            const treeData = buildCategoryTree(data);
            setCategories(treeData);
            setError(null);
        } catch (err) {
            setError('Kategoriler yüklenirken bir hata oluştu');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const refreshCategories = async () => {
        await fetchCategories();
    };

    return { categories, loading, error, refreshCategories };
};