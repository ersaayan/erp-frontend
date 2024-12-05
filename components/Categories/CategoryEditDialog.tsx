"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  categoryName: string;
  categoryCode: string;
  parentCategoryId: string | null;
}

interface CategoryEditDialogProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

const CategoryEditDialog: React.FC<CategoryEditDialogProps> = ({
  category,
  isOpen,
  onClose,
}) => {
  const [isMainCategory, setIsMainCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (category) {
      setCategoryName(category.categoryName);
      setCategoryCode(category.categoryCode);
      setParentCategoryId(category.parentCategoryId);
      setIsMainCategory(category.parentCategoryId === null);
    }
  }, [category]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.BASE_URL}/categories`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        // Filter out the current category and its children to prevent circular references
        const filteredCategories = data.filter(
          (cat: Category) => cat.id !== category?.id
        );
        setCategories(filteredCategories);
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

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, category]);

  const handleUpdate = async () => {
    if (!category) return;

    try {
      if (!categoryName || !categoryCode) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      const response = await fetch(
        `${process.env.BASE_URL}/categories/${category.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            categoryName,
            categoryCode,
            parentCategoryId: isMainCategory ? null : parentCategoryId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      onClose();

      // Trigger a refresh of the categories list
      const refreshEvent = new CustomEvent("refreshCategories");
      window.dispatchEvent(refreshEvent);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update category",
      });
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    try {
      const response = await fetch(
        `${process.env.BASE_URL}/categories/${category.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      setDeleteDialogOpen(false);
      onClose();

      // Trigger a refresh of the categories list
      const refreshEvent = new CustomEvent("refreshCategories");
      window.dispatchEvent(refreshEvent);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete category",
      });
    }
  };

  if (!category) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategori Düzenle</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
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
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Sil
                </Button>
                <Button variant="outline" onClick={onClose}>
                  İptal
                </Button>
                <Button
                  className="bg-[#84CC16] hover:bg-[#65A30D]"
                  onClick={handleUpdate}
                >
                  Güncelle
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryEditDialog;
