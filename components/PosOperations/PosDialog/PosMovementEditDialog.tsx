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
import { PosMovement } from "../types";
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

const formSchema = z.object({
  description: z.string().min(1, "Açıklama zorunludur"),
  entering: z.string(),
  emerging: z.string(),
  posDirection: z.string(),
  posType: z.string(),
  posDocumentType: z.string(),
});

interface PosMovementEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movementId: string | null;
  onSuccess: () => void;
}

export function PosMovementEditDialog({
  open,
  onOpenChange,
  movementId,
  onSuccess,
}: PosMovementEditDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      entering: "0",
      emerging: "0",
      posDirection: "",
      posType: "",
      posDocumentType: "",
    },
  });

  useEffect(() => {
    const fetchMovementDetails = async () => {
      if (!movementId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.BASE_URL}/posMovements/${movementId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Hareket detayları alınamad��");

        const data: PosMovement = await response.json();
        form.reset({
          description: data.description,
          entering: data.entering,
          emerging: data.emerging,
          posDirection: data.posDirection,
          posType: data.posType,
          posDocumentType: data.posDocumentType,
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
        `${process.env.BASE_URL}/posMovements/${movementId}`,
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
        description: "POS hareketi başarıyla güncellendi.",
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

  const handleDelete = async () => {
    if (!movementId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/posMovements/${movementId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Silme işlemi başarısız");

      toast({
        title: "Başarılı",
        description: "POS hareketi başarıyla silindi.",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Silme işlemi sırasında bir hata oluştu.",
      });
      console.log(error);
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>POS Hareketi Düzenle</DialogTitle>
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
                name="posDirection"
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
                name="posType"
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
                name="posDocumentType"
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

              <div className="flex justify-between space-x-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteAlert(true)}
                >
                  Sil
                </Button>
                <div className="flex space-x-2">
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
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Bu hareket kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
