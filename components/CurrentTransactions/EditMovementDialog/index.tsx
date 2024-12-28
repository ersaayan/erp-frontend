"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CurrentMovement } from "../types";

const formSchema = z.object({
  dueDate: z.string(),
  description: z.string().min(1, "Açıklama zorunludur"),
  amount: z.string().min(1, "Tutar zorunludur"),
  isDebt: z.boolean(),
});

interface EditMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: CurrentMovement | null;
  currentId: string | undefined;
}

const EditMovementDialog: React.FC<EditMovementDialogProps> = ({
  open,
  onOpenChange,
  movement,
  currentId,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dueDate: "",
      description: "",
      amount: "",
      isDebt: true,
    },
  });

  useEffect(() => {
    if (movement) {
      const isDebt = !!movement.debtAmount;
      form.reset({
        dueDate: new Date(movement.dueDate).toISOString().split("T")[0],
        description: movement.description,
        amount: movement.debtAmount || movement.creditAmount || "",
        isDebt,
      });
    }
  }, [movement, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!movement || !currentId) return;

    try {
      setLoading(true);

      const payload = {
        dueDate: new Date(values.dueDate).toISOString(),
        description: values.description,
        debtAmount: values.isDebt ? values.amount : "0",
        creditAmount: values.isDebt ? "0" : values.amount,
        currentId,
        movementType: movement.movementType,
      };

      // Cari hareketi güncelle
      const currentMovementResponse = await fetch(
        `${process.env.BASE_URL}/currentMovements/${movement.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!currentMovementResponse.ok) {
        throw new Error("Cari hareket güncellenemedi");
      }

      // İlgili kasa/banka/pos hareketini güncelle
      const relatedMovementResponse = await fetch(
        `${process.env.BASE_URL}/currentMovements/${movement.id}/related`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!relatedMovementResponse.ok) {
        throw new Error("İlişkili hareket güncellenemedi");
      }

      toast({
        title: "Başarılı",
        description: "Hareket başarıyla güncellendi",
      });

      onOpenChange(false);
      window.dispatchEvent(new Event("refreshCurrentMovements"));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error
            ? error.message
            : "Hareket güncellenirken bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hareket Düzenle</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vade Tarihi</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.getValues("isDebt") ? "Borç" : "Alacak"} Tutarı
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMovementDialog;
