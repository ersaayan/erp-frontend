/* eslint-disable @typescript-eslint/no-unused-vars */
// components/Properties/PropertiesPage.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import PropertiesToolbar from "./PropertiesToolbar";
import PropertiesGrid, { GroupedAttribute } from "./PropertiesGrid";
import PropertyDialog from "./PropertyDialog";
import { usePropertyDialog } from "./usePropertyDialog";
import { useToast } from "@/hooks/use-toast";

interface Attribute {
  id: string;
  attributeName: string;
  value: string;
}

const Properties: React.FC = () => {
  const [attributes, setAttributes] = useState<GroupedAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isOpen, closeDialog } = usePropertyDialog();

  const fetchAttributes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/attributes`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch attributes");
      }
      const data = await response.json();

      // API yanıtını doğru formata dönüştür
      const formattedData: GroupedAttribute[] = data.map((item: any) => ({
        id: item.id,
        attributeCode: item.attributeCode,
        attributeName: item.attributeName,
        attributeType: item.attributeType || "",
        attributeValue: item.value,
        groupCode: item.groupCode || "",
        groupName: item.groupName || "",
        createdAt: item.createdAt || "",
        updatedAt: item.updatedAt || "",
        createdBy: item.createdBy || "",
        updatedBy: item.updatedBy || "",
      }));

      setAttributes(formattedData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching attributes"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  return (
    <div>
      <PropertiesToolbar onRefresh={fetchAttributes} />
      <PropertiesGrid
        attributes={attributes}
        loading={loading}
        error={error}
        onRefresh={fetchAttributes}
      />
      <PropertyDialog
        isOpen={isOpen}
        onClose={closeDialog}
        onRefresh={fetchAttributes}
      />
    </div>
  );
};

export default Properties;
