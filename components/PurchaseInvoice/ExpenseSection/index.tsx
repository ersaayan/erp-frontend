import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseItem } from "../types";

interface ExpenseSectionProps {
  expenses: ExpenseItem[];
  onExpensesChange: (expenses: ExpenseItem[]) => void;
  current: { id: string; currentCode: string; currentName: string } | null;
}

const currencies = [
  { value: "TRY", label: "₺ TRY" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
];

const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  expenses,
  onExpensesChange,
}) => {
  const handleUpdateExpense = (
    index: number,
    updates: Partial<ExpenseItem>
  ) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index] = { ...updatedExpenses[index], ...updates };
    onExpensesChange(updatedExpenses);
  };

  const handleDeleteExpense = (index: number) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    onExpensesChange(updatedExpenses);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[200px]">Masraf Kodu</TableHead>
              <TableHead className="w-[300px]">Masraf Adı</TableHead>
              <TableHead className="text-right w-[150px]">Tutar</TableHead>
              <TableHead className="w-[150px]">Para Birimi</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  Henüz masraf eklenmedi
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense, index) => (
                <TableRow key={expense.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Input
                      value={expense.expenseCode}
                      onChange={(e) =>
                        handleUpdateExpense(index, {
                          expenseCode: e.target.value,
                        })
                      }
                      placeholder="Masraf kodu"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={expense.expenseName}
                      onChange={(e) =>
                        handleUpdateExpense(index, {
                          expenseName: e.target.value,
                        })
                      }
                      placeholder="Masraf adı"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={expense.price}
                      onChange={(e) =>
                        handleUpdateExpense(index, {
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="text-right h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={expense.currency}
                      onValueChange={(value) =>
                        handleUpdateExpense(index, { currency: value })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExpense(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExpenseSection;
