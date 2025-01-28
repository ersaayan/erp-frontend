import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  ChevronRight,
  ChevronDown,
  Loader2,
  Search,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CategoryNode } from "./types/category";
import { useCategories } from "./hooks/useCategories";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CategorySelectorProps {
  selectedCategories: string[];
  onCategoryChange: (categoryIds: string[]) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onCategoryChange,
}) => {
  const { categories, loading, error } = useCategories();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;

    const searchLower = searchTerm.toLowerCase();

    const filterCategory = (category: CategoryNode): CategoryNode | null => {
      const matchesSearch =
        category.categoryName.toLowerCase().includes(searchLower) ||
        category.categoryCode.toLowerCase().includes(searchLower);

      const filteredChildren = category.children
        .map((child) => filterCategory(child))
        .filter((child): child is CategoryNode => child !== null);

      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...category,
          children: filteredChildren,
        };
      }

      return null;
    };

    return categories
      .map((category) => filterCategory(category))
      .filter((category): category is CategoryNode => category !== null);
  }, [categories, searchTerm]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSelection = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryChange(newSelected);
  };

  const renderCategory = (category: CategoryNode) => {
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategories.includes(category.id);
    const hasChildren = category.children.length > 0;

    return (
      <div key={category.id} className="w-full">
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-accent rounded-sm cursor-pointer",
            isSelected && "bg-accent"
          )}
          style={{ paddingLeft: `${category.level * 20 + 8}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-4" />}
          <div
            className="flex-1 flex items-center space-x-2 py-1"
            onClick={() => toggleSelection(category.id)}
          >
            <div
              className={cn(
                "flex-shrink-0 h-4 w-4 border rounded-sm",
                isSelected ? "bg-primary border-primary" : "border-input"
              )}
            >
              {isSelected && (
                <Check className="h-3 w-3 text-primary-foreground" />
              )}
            </div>
            <span className="text-sm">{category.categoryName}</span>
            <span className="text-xs text-muted-foreground">
              ({category.categoryCode})
            </span>
          </div>
        </div>
        {isExpanded && category.children.length > 0 && (
          <div className="ml-2">
            {category.children.map((child) => renderCategory(child))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
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
    <div className="flex flex-col space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kategori ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      <ScrollArea className="h-[300px] w-full rounded-md border">
        <div className="p-2">
          {filteredCategories.map((category) => renderCategory(category))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CategorySelector;
