import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useTransferForm } from "./useTransferForm";
import { Vault } from "../types";

interface TransferFormProps {
  sourceVault: Vault;
  onClose: () => void;
}

const formSchema = z.object({
  targetVaultId: z.string().min(1, "Target vault is required"),
  amount: z.string().min(1, "Amount is required"),
  enableConversion: z.boolean().default(false),
});

const TransferForm: React.FC<TransferFormProps> = ({
  sourceVault,
  onClose,
}) => {
  const { toast } = useToast();
  const {
    vaults,
    isLoading,
    handleSubmit: handleFormSubmit,
  } = useTransferForm(sourceVault.id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetVaultId: "",
      amount: "",
      enableConversion: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await handleFormSubmit(values);
      toast({
        title: "Success",
        description: "Transfer completed successfully",
      });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const availableVaults = vaults.filter((vault) => vault.id !== sourceVault.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Kaynak Kasa:{" "}
          <span className="font-medium text-foreground">
            {sourceVault.vaultName} ({sourceVault.currency})
          </span>
        </div>

        <FormField
          control={form.control}
          name="targetVaultId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hedef Kasa</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Hedef kasa seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableVaults.map((vault) => (
                    <SelectItem key={vault.id} value={vault.id}>
                      {vault.vaultName} ({vault.currency})
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tutar</FormLabel>
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

        <FormField
          control={form.control}
          name="enableConversion"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Döviz Çevrimi</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Farklı para birimleri arasında otomatik çevrim yap
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Transfer
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransferForm;
