"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Current } from "../types";

interface Branch {
  id: string;
  branchName: string;
  branchCode: string;
  companyCode: string;
}

interface QuickMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: Current | null;
}

type DocumentType =
  | "Devir"
  | "Fatura"
  | "IadeFatura"
  | "Kasa"
  | "MusteriSeneti"
  | "BorcSeneti"
  | "MusteriCeki"
  | "BorcCeki"
  | "KarsiliksizCek"
  | "Muhtelif";

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "Devir", label: "Devir" },
  { value: "Fatura", label: "Fatura" },
  { value: "IadeFatura", label: "İade Fatura" },
  { value: "Kasa", label: "Kasa" },
  { value: "MusteriSeneti", label: "Müşteri Seneti" },
  { value: "BorcSeneti", label: "Borç Seneti" },
  { value: "MusteriCeki", label: "Müşteri Çeki" },
  { value: "BorcCeki", label: "Borç Çeki" },
  { value: "KarsiliksizCek", label: "Karşılıksız Çek" },
  { value: "Muhtelif", label: "Muhtelif" },
];

const QuickMovementDialog: React.FC<QuickMovementDialogProps> = ({
  open,
  onOpenChange,
  current,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [movementType, setMovementType] = useState<"Borc" | "Alacak">("Borc");
  const [documentType, setDocumentType] = useState<DocumentType>("Muhtelif");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL}/branches`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Şubeler yüklenirken bir hata oluştu");
        }

        const data = await response.json();
        setBranches(data);

        // Varsayılan olarak ilk şubeyi seç
        if (data.length > 0) {
          setSelectedBranch(data[0].branchCode);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Şubeler yüklenirken bir hata oluştu.",
        });
      }
    };

    if (open) {
      fetchBranches();
    }
  }, [open, toast]);

  const handleSubmit = async () => {
    if (!current || !selectedBranch) return;

    try {
      setLoading(true);

      const body = {
        currentCode: current.currentCode,
        dueDate: null,
        description: description || `Hızlı Hareket - ${current.currentName}`,
        debtAmount: movementType === "Borc" ? amount : "0",
        creditAmount: movementType === "Alacak" ? amount : "0",
        movementType: movementType,
        documentType: documentType,
        branchCode: selectedBranch,
      };

      const response = await fetch(`${process.env.BASE_URL}/currentMovements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("İşlem başarısız");
      }

      toast({
        title: "Başarılı",
        description: "Hareket başarıyla kaydedildi.",
      });

      // Reset form and close dialog
      setAmount("");
      setDescription("");
      setMovementType("Borc");
      setDocumentType("Muhtelif");
      onOpenChange(false);

      // Trigger refresh
      const event = new Event("refreshCurrentMovements");
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error creating movement:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Hareket kaydedilirken bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hızlı Hareket</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="current">Cari</label>
            <Input
              id="current"
              value={current?.currentName || ""}
              disabled
              className="col-span-3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="branch">Şube</label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
                <SelectValue placeholder="Şube Seçin" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.branchCode}>
                    {branch.branchName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="documentType">Belge Tipi</label>
            <Select
              value={documentType}
              onValueChange={(value: DocumentType) => setDocumentType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Belge Tipi Seçin" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="movementType">Hareket Tipi</label>
            <Select
              value={movementType}
              onValueChange={(value: "Borc" | "Alacak") =>
                setMovementType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Hareket Tipi Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Borc">Borç</SelectItem>
                <SelectItem value="Alacak">Alacak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="amount">Tutar</label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="description">Açıklama</label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hareket açıklaması..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !amount || !selectedBranch}
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickMovementDialog;
