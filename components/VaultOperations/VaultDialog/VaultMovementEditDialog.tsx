import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DIRECTION_TRANSLATIONS,
  MOVEMENT_TYPE_TRANSLATIONS,
  DOCUMENT_TYPE_TRANSLATIONS,
} from "@/lib/constants/movementEnums";
import { VaultMovement } from "../types";

const formSchema = z.object({
  description: z.string().min(1, "Açıklama zorunludur"),
  entering: z.string(),
  emerging: z.string(),
  vaultDirection: z.string(),
  vaultType: z.string(),
  vaultDocumentType: z.string(),
});

interface VaultMovementEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movementId: string | null;
  onSuccess: () => void;
}

export function VaultMovementEditDialog({
  open,
  onOpenChange,
  movementId,
  onSuccess,
}: VaultMovementEditDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      entering: "0",
      emerging: "0",
      vaultDirection: "",
      vaultType: "",
      vaultDocumentType: "",
    },
  });

  useEffect(() => {
    const fetchMovementDetails = async () => {
      if (!movementId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.BASE_URL}/vaultMovements/${movementId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Hareket detayları alınamadı");

        const data: VaultMovement = await response.json();
        form.reset({
          description: data.description,
          entering: data.entering,
          emerging: data.emerging,
          vaultDirection: data.vaultDirection,
          vaultType: data.vaultType,
          vaultDocumentType: data.vaultDocumentType,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Hareket detayları alınırken bir hata oluştu.",
        });
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovementDetails();
  }, [movementId, form, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!movementId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/vaultMovements/${movementId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) throw new Error("Güncelleme başarısız");

      toast({
        title: "Başarılı",
        description: "Kasa hareketi başarıyla güncellendi.",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Güncelleme sırasında bir hata oluştu.",
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kasa Hareketi Düzenle</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="entering"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giriş Tutarı</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emerging"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Çıkış Tutarı</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vaultDirection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yön</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Yön seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(DIRECTION_TRANSLATIONS).map(
                        ([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vaultType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hareket Tipi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Tip seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(MOVEMENT_TYPE_TRANSLATIONS).map(
                        ([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vaultDocumentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Belge Tipi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Belge tipi seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(DOCUMENT_TYPE_TRANSLATIONS).map(
                        ([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
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
}
