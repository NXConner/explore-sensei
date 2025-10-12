import { X, DollarSign, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FinanceModalProps {
  onClose: () => void;
}

export const FinanceModal = ({ onClose }: FinanceModalProps) => {
  const financialData = {
    monthlyRevenue: 125000,
    monthlyExpenses: 78000,
    profit: 47000,
    profitMargin: 37.6,
  };

  const recentTransactions = [
    {
      id: 1,
      type: "Income",
      description: "Johnson Property - Sealcoating",
      amount: 8500,
      date: "2025-10-05",
    },
    {
      id: 2,
      type: "Expense",
      description: "SealMaster Materials",
      amount: -2850,
      date: "2025-10-04",
    },
    {
      id: 3,
      type: "Income",
      description: "Main St Parking Lot",
      amount: 12000,
      date: "2025-10-03",
    },
    { id: 4, type: "Expense", description: "Fuel & Equipment", amount: -450, date: "2025-10-02" },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-[80vh] tactical-panel m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">
              Finance Center
            </h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="tactical-panel p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-green-500">
                ${financialData.monthlyRevenue.toLocaleString()}
              </p>
            </div>

            <div className="tactical-panel p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Monthly Expenses</p>
              <p className="text-3xl font-bold text-red-500">
                ${financialData.monthlyExpenses.toLocaleString()}
              </p>
            </div>

            <div className="tactical-panel p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
              <p className="text-3xl font-bold text-primary">
                ${financialData.profit.toLocaleString()}
              </p>
            </div>

            <div className="tactical-panel p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Profit Margin</p>
              <p className="text-3xl font-bold text-blue-500">{financialData.profitMargin}%</p>
            </div>
          </div>

          <div className="tactical-panel p-6 mb-6">
            <h3 className="font-bold text-lg mb-4 text-primary">Recent Transactions</h3>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b border-primary/20 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.type} • {transaction.date}
                    </p>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      transaction.amount > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}$
                    {Math.abs(transaction.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="tactical-panel p-6">
            <h3 className="font-bold text-lg mb-4 text-primary">Business Address & Info</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Address:</span> 337 Ayers Orchard Road,
                Stuart, VA 24171
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Employees:</span> 2 Full-time, 1 Part-time
                ($20/hr)
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Material Supplier:</span> SealMaster, 703
                West Decatur Street, Madison, NC 27025
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
