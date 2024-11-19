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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentCategoryDialog } from "./useCurrentCategoryDialog";
import { useToast } from "@/hooks/use-toast";
import { CurrentCategory } from "./types";

const CurrentCategoryDialog: React.FC = () => {
  const [isMainCategory, setIsMainCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<CurrentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, closeDialog } = useCurrentCategoryDialog();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:1303/currentCategories");
        if (!response.ok) {
          throw new Error("Failed to fetch current categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching current categories"
        );
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

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

      const response = await fetch("http://localhost:1303/currentCategories", {
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
        throw new Error("Failed to create current category");
      }

      toast({
        title: "Success",
        description: "Current category created successfully",
      });
      closeDialog();

      // Trigger a refresh of the current categories list
      const refreshEvent = new CustomEvent("refreshCurrentCategories");
      window.dispatchEvent(refreshEvent);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to create current category",
      });
    }
  };

  const handleClose = () => {
    setCategoryName("");
    setCategoryCode("");
    setParentCategoryId(null);
    setIsMainCategory(false);
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cari Kategori Formu</DialogTitle>
        </DialogHeader>
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
            <Button variant="outline" onClick={handleClose}>
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
      </DialogContent>
    </Dialog>
  );
};

export default CurrentCategoryDialog;
