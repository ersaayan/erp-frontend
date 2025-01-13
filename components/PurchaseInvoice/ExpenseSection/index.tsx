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
  const handleAddExpense = () => {
    const newExpense: ExpenseItem = {
      id: crypto.randomUUID(),
      expenseCode: "",
      expenseName: "",
      price: 0,
      currency: "TRY",
    };
    onExpensesChange([...expenses, newExpense]);
  };

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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Masraflar</h2>
        <Button
          variant="default"
          size="sm"
          onClick={handleAddExpense}
          className="bg-[#84CC16] hover:bg-[#65A30D]"
        >
          Masraf Ekle
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Masraf Kodu</TableHead>
              <TableHead>Masraf Adı</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead>Para Birimi</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Henüz masraf eklenmedi
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense, index) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <Input
                      value={expense.expenseCode}
                      onChange={(e) =>
                        handleUpdateExpense(index, {
                          expenseCode: e.target.value,
                        })
                      }
                      placeholder="Masraf kodu"
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
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={expense.currency}
                      onValueChange={(value) =>
                        handleUpdateExpense(index, { currency: value })
                      }
                    >
                      <SelectTrigger>
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
                    >
                      <Trash2 className="h-4 w-4" />
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
