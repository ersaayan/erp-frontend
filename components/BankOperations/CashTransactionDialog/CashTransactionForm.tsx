import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useCashTransactionForm } from "./useCashTransactionForm";
import { Bank } from "../types";

interface CashTransactionFormProps {
  bank: Bank;
  type: "income" | "expense";
  onClose: () => void;
}

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  documentType: z.enum(["General", "Official", "Accounting"]),
  entryType: z.string().min(1, "Entry type is required"),
  invoiceId: z.string().nullable(),
  receiptId: z.string().nullable(),
});

const CashTransactionForm: React.FC<CashTransactionFormProps> = ({
  bank,
  type,
  onClose,
}) => {
  const { toast } = useToast();
  const {
    invoices,
    receipts,
    entryTypes,
    isLoading,
    handleSubmit: handleFormSubmit,
  } = useCashTransactionForm(bank.id, type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
      documentType: "General",
      entryType: "",
      invoiceId: null,
      receiptId: null,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await handleFormSubmit(values);
      toast({
        title: "Success",
        description: "Transaction completed successfully",
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea placeholder="İşlem açıklaması..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Belge Tipi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Belge tipi seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="General">Genel</SelectItem>
                  <SelectItem value="Official">Resmi</SelectItem>
                  <SelectItem value="Accounting">Muhasebe</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İşlem Tipi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="İşlem tipi seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {entryTypes.map((entryType) => (
                    <SelectItem key={entryType.value} value={entryType.value}>
                      {entryType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {invoices.length > 0 && (
          <FormField
            control={form.control}
            name="invoiceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fatura No</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Fatura seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNo}-{invoice.invoiceType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {receipts.length > 0 && (
          <FormField
            control={form.control}
            name="receiptId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Makbuz No</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Makbuz seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {receipts.map((receipt) => (
                      <SelectItem key={receipt.id} value={receipt.id}>
                        {receipt.documentNo}-{receipt.receiptType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CashTransactionForm;
