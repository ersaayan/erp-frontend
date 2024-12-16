/* eslint-disable @typescript-eslint/no-unused-vars */
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

interface Attribute {
  id: string;
  attributeName: string;
  value: string;
}

interface GroupedAttribute {
  name: string;
  values: Array<{ id: string; value: string }>;
}

const PropertyEditDialog: React.FC = () => {
  const { isOpen, closeDialog, editingProperty } = usePropertyEditDialog();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [groupedAttributes, setGroupedAttributes] = useState<
    GroupedAttribute[]
  >([]);
  const [selectedAttributeName, setSelectedAttributeName] =
    useState<string>("");
  const [selectedValueId, setSelectedValueId] = useState<string>("");
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL}/attributes`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });
        const data: Attribute[] = await response.json();
        setAttributes(data);

        // Group attributes by name
        const groups = data.reduce((acc, curr) => {
          const existing = acc.find((g) => g.name === curr.attributeName);
          if (existing) {
            existing.values.push({ id: curr.id, value: curr.value });
          } else {
            acc.push({
              name: curr.attributeName,
              values: [{ id: curr.id, value: curr.value }],
            });
          }
          return acc;
        }, [] as GroupedAttribute[]);

        setGroupedAttributes(groups);
      } catch (error) {
        console.error("Failed to fetch attributes", error);
      }
    };

    if (isOpen) {
      fetchAttributes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingProperty) {
      setSelectedAttributeName(editingProperty.name);
      const attributeGroup = groupedAttributes.find(
        (g) => g.name === editingProperty.name
      );
      if (attributeGroup && attributeGroup.values.length > 0) {
        const firstValue = attributeGroup.values.find(
          (v) => v.value === editingProperty.values[0]
        );
        if (firstValue) {
          setSelectedValueId(firstValue.id);
          setNewValue(firstValue.value);
        }
      }
    }
  }, [editingProperty, groupedAttributes]);

  const handleAttributeNameChange = (name: string) => {
    setSelectedAttributeName(name);
    setSelectedValueId("");
    setNewValue("");
  };

  const handleValueChange = (id: string) => {
    setSelectedValueId(id);
    const attributeGroup = groupedAttributes.find(
      (g) => g.name === selectedAttributeName
    );
    if (attributeGroup) {
      const value = attributeGroup.values.find((v) => v.id === id);
      if (value) {
        setNewValue(value.value);
      }
    }
  };

  const handleUpdate = async () => {
    if (!selectedValueId || !newValue.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an attribute and enter a new value",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/attributes/${selectedValueId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
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
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedValueId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an attribute value to delete",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/attributes/${selectedValueId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
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
        description:
          error instanceof Error ? error.message : "An error occurred",
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
              value={selectedAttributeName}
              onValueChange={handleAttributeNameChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Özellik adı seçin" />
              </SelectTrigger>
              <SelectContent>
                {groupedAttributes.map((group) => (
                  <SelectItem key={group.name} value={group.name}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="attributeValue">Özellik Değeri</Label>
            <Select
              value={selectedValueId}
              onValueChange={handleValueChange}
              disabled={!selectedAttributeName}
            >
              <SelectTrigger>
                <SelectValue placeholder="Özellik değeri seçin" />
              </SelectTrigger>
              <SelectContent>
                {groupedAttributes
                  .find((g) => g.name === selectedAttributeName)
                  ?.values.map((value) => (
                    <SelectItem key={value.id} value={value.id}>
                      {value.value}
                    </SelectItem>
                  ))}
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
              disabled={!selectedValueId}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={loading || !selectedValueId}
          >
            Sil
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading || !selectedValueId || !newValue.trim()}
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
