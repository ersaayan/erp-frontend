"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { usePropertyEditDialog } from "./usePropertyEditDialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const PropertyEditDialog: React.FC = () => {
  const { isOpen, closeDialog, editingProperty } = usePropertyEditDialog();
  const [attributes, setAttributes] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await fetch("http://localhost:1303/attributes");
        const data = await response.json();
        setAttributes(data);
      } catch (error) {
        console.error("Failed to fetch attributes", error);
      }
    };

    fetchAttributes();
  }, []);

  useEffect(() => {
    if (editingProperty) {
      setSelectedAttribute(editingProperty.name);
      setSelectedValue(editingProperty.values[0]);
      setNewValue(editingProperty.values[0]);
    } else {
      setSelectedAttribute(null);
      setSelectedValue(null);
      setNewValue("");
    }
  }, [editingProperty]);

  const handleUpdate = async () => {
    if (!selectedAttribute || !selectedValue) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:1303/attributes/${selectedValue.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: newValue }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update attribute value");
      }

      toast({
        title: "Success",
        description: "Attribute value updated successfully",
      });

      closeDialog();
      window.dispatchEvent(new CustomEvent("refreshProperties"));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAttribute || !selectedValue) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:1303/attributes/${selectedValue.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete attribute value");
      }

      toast({
        title: "Success",
        description: "Attribute value deleted successfully",
      });

      closeDialog();
      window.dispatchEvent(new CustomEvent("refreshProperties"));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Özellik Düzenle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="attributeName">Özellik Adı</Label>
            <Select
              value={selectedAttribute}
              onValueChange={(value) => {
                setSelectedAttribute(value);
                setSelectedValue(null);
                setNewValue("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Özellik adı seçin" />
              </SelectTrigger>
              <SelectContent>
                {attributes.map((attr) => (
                  <SelectItem key={attr.id} value={attr.name}>
                    {attr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="attributeValue">Özellik Değeri</Label>
            <Select
              value={selectedValue}
              onValueChange={(value) => {
                setSelectedValue(value);
                setNewValue(value);
              }}
              disabled={!selectedAttribute}
            >
              <SelectTrigger>
                <SelectValue placeholder="Özellik değeri seçin" />
              </SelectTrigger>
              <SelectContent>
                {attributes
                  .find((attr) => attr.name === selectedAttribute)
                  ?.values.map((val) => (
                    <SelectItem key={val.id} value={val}>
                      {val.value}
                    </SelectItem>
                  )) || []}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="newValue">Yeni Değer</Label>
            <Input
              id="newValue"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Yeni değeri girin"
              disabled={!selectedValue}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={loading || !selectedValue}
          >
            Sil
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading || !selectedValue}
            className="relative"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Güncelle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyEditDialog;
