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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Vault } from "../types";

interface Branch {
  id: string;
  branchName: string;
  branchCode: string;
}

interface VaultFormProps {
  vault?: Vault | null;
  onClose: () => void;
}

const formSchema = z.object({
  vaultName: z.string().min(1, "Kasa adı zorunludur"),
  branchCode: z.string().min(1, "Şube kodu zorunludur"),
  currency: z.string().min(1, "Para birimi zorunludur"),
  balance: z.string(),
});

const currencies = [
  { value: "TRY", label: "₺ TRY" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
];

const VaultForm: React.FC<VaultFormProps> = ({ vault, onClose }) => {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vaultName: vault?.vaultName || "",
      branchCode: vault?.branchCode || "",
      currency: vault?.currency || "",
      balance: vault?.balance || "0",
    },
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch("http://localhost:1303/branches");
        if (!response.ok) {
          throw new Error("Failed to fetch branches");
        }
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch branches",
        });
      }
    };

    fetchBranches();
  }, [toast]);

  const handleDelete = async () => {
    if (!vault) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:1303/vaults/${vault.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete vault");
      }

      toast({
        title: "Success",
        description: "Kasa başarıyla silindi",
      });

      // Trigger refresh event
      window.dispatchEvent(new CustomEvent("refreshVaultOperations"));
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete vault",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const url = vault
        ? `http://localhost:1303/vaults/${vault.id}`
        : "http://localhost:1303/vaults";

      const response = await fetch(url, {
        method: vault ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vaultName: values.vaultName,
          branchCode: values.branchCode,
          balance: values.balance,
          currency: values.currency,
        }),
      });

      if (!response.ok) {
        throw new Error(
          vault ? "Failed to update vault" : "Failed to create vault"
        );
      }

      toast({
        title: "Success",
        description: vault
          ? "Kasa başarıyla güncellendi"
          : "Kasa başarıyla oluşturuldu",
      });

      // Trigger refresh event
      window.dispatchEvent(new CustomEvent("refreshVaultOperations"));
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save vault",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (form.formState.isValid) {
        form.handleSubmit(onSubmit)();
      }
    }
  };

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
            name="vaultName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kasa Adı</FormLabel>
                <FormControl>
                  <Input placeholder="Kasa adını giriniz" {...field} />
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
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.branchCode}>
                        {branch.branchName} ({branch.branchCode})
                      </SelectItem>
                    ))}
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

          {vault && (
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
            {vault && (
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
                {vault ? "Güncelle" : "Kaydet"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kasa Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kasayı silmek istediğinizden emin misiniz? Bu işlem geri
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

export default VaultForm;
