"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryDialog } from "./useCategoryDialog";

interface Category {
  id: string;
  categoryName: string;
  categoryCode: string;
  parentCategoryId: string | null;
}

const GeneralInfo: React.FC = () => {
  const [isMainCategory, setIsMainCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { closeDialog } = useCategoryDialog();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.BASE_URL}/categories`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
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

  const handleSave = async () => {
    try {
      if (!categoryName || !categoryCode) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      const response = await fetch(`${process.env.BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryName,
          categoryCode,
          parentCategoryId: isMainCategory ? null : parentCategoryId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      toast({
        title: "Success",
        description: "Category created successfully",
      });
      closeDialog();

      // Trigger a refresh of the categories list
      const refreshEvent = new CustomEvent("refreshCategories");
      window.dispatchEvent(refreshEvent);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create category",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="isMainCategory"
          checked={isMainCategory}
          onCheckedChange={setIsMainCategory}
        />
        <Label htmlFor="isMainCategory">Ana Kategori mi?</Label>
      </div>

      {!isMainCategory && (
        <div>
          <Label>Üst Kategori</Label>
          <Select
            value={parentCategoryId || ""}
            onValueChange={setParentCategoryId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Üst kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.categoryName} ({cat.categoryCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Kategori Adı</Label>
        <Input
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Kategori adını giriniz"
        />
      </div>

      <div>
        <Label>Kategori Kodu</Label>
        <Input
          value={categoryCode}
          onChange={(e) => setCategoryCode(e.target.value)}
          placeholder="Kategori kodunu giriniz"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={closeDialog}>
          İptal
        </Button>
        <Button
          className="bg-[#84CC16] hover:bg-[#65A30D]"
          onClick={handleSave}
        >
          Kaydet
        </Button>
      </div>
    </div>
  );
};

export default GeneralInfo;
