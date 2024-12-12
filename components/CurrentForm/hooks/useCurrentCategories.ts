import { useState, useEffect } from 'react';

interface Category {
    id: string;
    categoryName: string;
    categoryCode: string;
    parentCategoryId: string | null;
    parentCategory: {
        id: string;
        categoryName: string;
        categoryCode: string;
        parentCategoryId: string | null;
    } | null;
}

interface CategoryNode {
    id: string;
    categoryName: string;
    categoryCode: string;
    children: CategoryNode[];
    level: number;
}

const buildCategoryTree = (categories: Category[]): CategoryNode[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootNodes: CategoryNode[] = [];

    // First pass: Create all nodes with initial empty children arrays
    categories.forEach(category => {
        categoryMap.set(category.id, {
            id: category.id,
            categoryName: category.categoryName,
            categoryCode: category.categoryCode,
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

export const useCurrentCategories = () => {
    const [categories, setCategories] = useState<CategoryNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${process.env.BASE_URL}/currentCategories/withParents`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch categories");
                }

                const data = await response.json();
                const treeData = buildCategoryTree(data);
                setCategories(treeData);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "An error occurred while fetching categories"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
};
