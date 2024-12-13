"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentForm } from "./hooks/useCurrentForm";
import { useCurrentCategories } from "./hooks/useCurrentCategories";

interface CategoryNode {
  id: string;
  categoryName: string;
  categoryCode: string;
  children: CategoryNode[];
  level: number;
}

const CategorySection: React.FC<{
  formData: any;
  updateFormData: (data: any) => void;
}> = ({ formData, updateFormData }) => {
  const { categories, loading, error } = useCurrentCategories();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const toggleSelection = useCallback(
    (categoryId: string) => {
      updateFormData({
        categories: formData.categories.includes(categoryId)
          ? formData.categories.filter((id) => id !== categoryId)
          : [...formData.categories, categoryId],
      });
    },
    [formData.categories, updateFormData]
  );

  const renderCategory = useCallback(
    (category: CategoryNode) => {
      const isExpanded = expandedCategories.has(category.id);
      const isSelected = formData.categories.includes(category.id);
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
    },
    [expandedCategories, formData.categories, toggleCategory, toggleSelection]
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <ScrollArea className="h-[500px] w-full rounded-md border">
          <div className="p-4">
            {categories.map((category) => renderCategory(category))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CategorySection;
