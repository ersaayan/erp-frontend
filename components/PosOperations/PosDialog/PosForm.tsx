import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { Pos } from "../types";

interface Branch {
  id: string;
  branchName: string;
  branchCode: string;
}

interface PosFormProps {
  pos?: Pos | null;
  onClose: () => void;
}

const formSchema = z.object({
  posName: z.string().min(1, "POS adı zorunludur"),
  branchCode: z.string().min(1, "Şube kodu zorunludur"),
  currency: z.string().min(1, "Para birimi zorunludur"),
  balance: z.string(),
});

const currencies = [
  { value: "TRY", label: "₺ TRY" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
];

const PosForm: React.FC<PosFormProps> = ({ pos, onClose }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      posName: pos?.posName || "",
      branchCode: pos?.branchCode || "",
      currency: pos?.currency || "",
      balance: pos?.balance || "0",
    },
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setBranchesLoading(true);
        const response = await fetch(`${process.env.BASE_URL}/branches/`);
        if (!response.ok) {
          throw new Error("Failed to fetch branches");
        }
        const data = await response.json();
        setBranches(data);
        setBranchesError(null);
      } catch (error) {
        setBranchesError(
          error instanceof Error ? error.message : "Failed to fetch branches"
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch branches",
        });
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchBranches();
  }, [toast]);

  const handleDelete = async () => {
    if (!pos) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/pos/${pos.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete POS");
      }

      toast({
        title: "Success",
        description: "POS başarıyla silindi",
      });

      window.dispatchEvent(new CustomEvent("refreshPosOperations"));
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete POS",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const url = pos
        ? `${process.env.BASE_URL}/pos/${pos.id}`
        : `${process.env.BASE_URL}/pos`;

      const response = await fetch(url, {
        method: pos ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          posName: values.posName,
          branchCode: values.branchCode,
          balance: values.balance,
          currency: values.currency,
        }),
      });

      if (!response.ok) {
        throw new Error(pos ? "Failed to update POS" : "Failed to create POS");
      }

      toast({
        title: "Success",
        description: pos
          ? "POS başarıyla güncellendi"
          : "POS başarıyla oluşturuldu",
      });

      window.dispatchEvent(new CustomEvent("refreshPosOperations"));
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save POS",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (form.formState.isValid) {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  if (branchesLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Şubeler yükleniyor...</span>
      </div>
    );
  }

  if (branchesError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{branchesError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={handleKeyDown}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="posName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>POS Adı</FormLabel>
                <FormControl>
                  <Input placeholder="POS adını giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branchCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şube</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Şube seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches.length === 0 ? (
                      <SelectItem value="" disabled>
                        Şube bulunamadı
                      </SelectItem>
                    ) : (
                      branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.branchCode}>
                          {branch.branchName} ({branch.branchCode})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Para Birimi</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Para birimi seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {pos && (
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bakiye</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-between pt-4">
            {pos && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Sil
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
                className="bg-[#84CC16] hover:bg-[#65A30D]"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {pos ? "Güncelle" : "Kaydet"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>POS Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu POS cihazını silmek istediğinizden emin misiniz? Bu işlem geri
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

export default PosForm;
