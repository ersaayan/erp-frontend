"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";
import { usePropertyDialog } from "./usePropertyDialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const PropertyDialog: React.FC = () => {
  const { isOpen, closeDialog } = usePropertyDialog();
  const [propertyName, setPropertyName] = useState("");
  const [propertyValues, setPropertyValues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setPropertyName("");
    setPropertyValues([]);
    closeDialog();
  };

  const handleSave = async () => {
    try {
      if (!propertyName || propertyValues.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      setLoading(true);

      // Transform the data into the required format
      const attributesData = propertyValues.map((value) => ({
        attributeName: propertyName,
        value: value,
      }));

      const response = await fetch(
        "http://localhost:1303/attributes/createMany",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attributesData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create attributes");
      }

      toast({
        title: "Success",
        description: "Feature added successfully",
      });

      // Trigger a refresh of the properties list
      const refreshEvent = new CustomEvent("refreshProperties");
      window.dispatchEvent(refreshEvent);

      handleClose();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create feature",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Özellik Ekle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="propertyName">Özellik Adı</Label>
            <Input
              id="propertyName"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="Özellik adını giriniz"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="propertyValues">Özellik Değerleri</Label>
            <TagInput
              id="propertyValues"
              placeholder="Değer girin ve Enter'a basın"
              tags={propertyValues}
              className="mt-1"
              onTagsChange={setPropertyValues}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Her bir değeri girdikten sonra Enter tuşuna basın
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !propertyName || propertyValues.length === 0}
            className="relative"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ekle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDialog;
