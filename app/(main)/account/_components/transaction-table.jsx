"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
} from "../../../../components/ui/table";
import { X, Search, Clock, MoreHorizontal, ChevronUp, ChevronDown, Trash } from "lucide-react";
import { Checkbox } from "../../../../components/ui/checkbox";
import { format, addDays, addWeeks, addMonths, addYears, isAfter } from "date-fns";
import { Badge } from "../../../../components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../../../../components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../../../components/ui/dropdown-menu";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { categoryColors } from "../../../../data/categories";
import { toast } from "react-hot-toast"; // Assuming you're using react-hot-toast
import { BarLoader } from "react-spinners"; // Optional loading bar
import { bulkDeleteTransactions } from "../../../../actions/accounts"; // Your API function

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

// Calculate next recurring date
const getNextOccurrence = (date, interval) => {
  let next = new Date(date);
  const now = new Date();
  const addInterval = {
    DAILY: (d) => addDays(d, 1),
    WEEKLY: (d) => addWeeks(d, 1),
    MONTHLY: (d) => addMonths(d, 1),
    YEARLY: (d) => addYears(d, 1),
  };
  while (!isAfter(next, now)) {
    next = addInterval[interval](next);
  }
  return next;
};

const TransactionTable = ({ transactions }) => {
  const router = useRouter();

  const [clientTransactions, setClientTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: "date", direction: "desc" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Normalize transactions and calculate recurring dates
  useEffect(() => {
    const normalized = transactions.map((tx) => {
      const recurringFlag = tx.isRecurring === true || tx.recurring === true;
      const interval =
        tx.recurringInterval && RECURRING_INTERVALS[tx.recurringInterval.toUpperCase()]
          ? tx.recurringInterval.toUpperCase()
          : "MONTHLY";

      return {
        ...tx,
        isRecurring: recurringFlag,
        recurringInterval: interval,
        nextRecurringDate: recurringFlag ? getNextOccurrence(tx.date, interval) : null,
      };
    });
    setClientTransactions(normalized);
  }, [transactions]);

  // Filtering and sorting
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...clientTransactions];

    // Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(lower) ||
          tx.category?.toLowerCase().includes(lower)
      );
    }

    // Type filter
    if (typeFilter) result = result.filter((tx) => tx.type === typeFilter);

    // Recurring filter
    if (recurringFilter) {
      result = result.filter((tx) =>
        recurringFilter === "recurring" ? tx.isRecurring : !tx.isRecurring
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [clientTransactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  // Sorting handler
  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Selection handlers
  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((i) => i !== id) : [...current, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedTransactions.map((tx) => tx.id));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`))
      return;

    try {
      setDeleteLoading(true);
      await bulkDeleteTransactions(selectedIds);
      toast.success("Transactions deleted successfully");
      setClientTransactions((prev) => prev.filter((tx) => !selectedIds.includes(tx.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete transactions");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Single delete
  const handleSingleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      setDeleteLoading(true);
      await bulkDeleteTransactions([id]);
      toast.success("Transaction deleted successfully");
      setClientTransactions((prev) => prev.filter((tx) => tx.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete transaction");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!clientTransactions.length) return null;

  return (
    <div className="space-y-4">
      {deleteLoading && <BarLoader className="mt-4" width="100%" color="#9333ea" />}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={recurringFilter} onValueChange={setRecurringFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Transactions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recurring">Recurring Only</SelectItem>
            <SelectItem value="non-recurring">Non Recurring Only</SelectItem>
          </SelectContent>
        </Select>

        {selectedIds.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash className="h-4 w-4 mr-2" />
            Delete Selected ({selectedIds.length})
          </Button>
        )}

        {(searchTerm || typeFilter || recurringFilter) && (
          <Button variant="outline" size="icon" onClick={handleClearFilters} title="Clear Filters">
            <X className="h-4 w-5" />
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedIds.length === filteredAndSortedTransactions.length &&
                    filteredAndSortedTransactions.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>

              <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead>Description</TableHead>

              <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
                <div className="flex items-center">
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead>Recurring</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(transaction.id)}
                      onCheckedChange={() => handleSelect(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>{format(new Date(transaction.date), "PPpp")}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="capitalize">
                    <span
                      style={{ background: categoryColors[transaction.category] }}
                      className="px-2 py-1 rounded text-white text-sm"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-right font-medium"
                    style={{ color: transaction.type === "EXPENSE" ? "red" : "green" }}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="gap-1 bg-purple-100 text-purple-700 cursor-pointer"
                            >
                              <Clock className="h-3 w-3" />
                              {RECURRING_INTERVALS[transaction.recurringInterval]}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">Next Date:</div>
                              <div>{format(new Date(transaction.nextRecurringDate), "PPpp")}</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="outline" className="gap-1 flex items-center">
                        <Clock className="h-3 w-3" />
                        One-time
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/transaction/create?edit=${transaction.id}`)
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleSingleDelete(transaction.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default TransactionTable;
