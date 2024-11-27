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
import { Bank } from "../types";

interface TransferFormProps {
  sourceBank: Bank;
  onClose: () => void;
}

const formSchema = z.object({
  targetBankId: z.string().min(1, "Target bank is required"),
  amount: z.string().min(1, "Amount is required"),
  enableConversion: z.boolean().default(false),
});

const TransferForm: React.FC<TransferFormProps> = ({ sourceBank, onClose }) => {
  const { toast } = useToast();
  const {
    banks,
    isLoading,
    handleSubmit: handleFormSubmit,
  } = useTransferForm(sourceBank.id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetBankId: "",
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

  const availableBanks = banks.filter((bank) => bank.id !== sourceBank.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Kaynak Kasa:{" "}
          <span className="font-medium text-foreground">
            {sourceBank.bankName} ({sourceBank.currency})
          </span>
        </div>

        <FormField
          control={form.control}
          name="targetBankId"
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
                  {availableBanks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.bankName} ({bank.currency})
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
