import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  totalPurchases: number;
  cashAfterExpenses: number;
  surplusDeficit: number;
  incomeBreakdown: {
    cash: number;
    credit: number;
    other: number;
    actualCash: number;
  };
}

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateReport = async () => {
    setLoading(true);
    try {
      // Fetch income data
      const { data: incomeData } = await supabase
        .from('income')
        .select('*')
        .gte('date', dateRange.from)
        .lte('date', dateRange.to);

      // Fetch expenses data
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', dateRange.from)
        .lte('date', dateRange.to);

      // Fetch purchases data
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('*, expense:expenses!inner(*)')
        .gte('expense.date', dateRange.from)
        .lte('expense.date', dateRange.to);

      // Calculate totals
      const totalIncome = incomeData?.reduce((sum, item) => sum + Number(item.total_income), 0) || 0;
      const totalCash = incomeData?.reduce((sum, item) => sum + Number(item.cash_amount), 0) || 0;
      const totalCredit = incomeData?.reduce((sum, item) => sum + Number(item.credit_amount), 0) || 0;
      const totalOther = incomeData?.reduce((sum, item) => sum + Number(item.other_amount), 0) || 0;
      const totalActualCash = incomeData?.reduce((sum, item) => sum + Number(item.actual_cash_received), 0) || 0;
      
      const totalExpenses = expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalPurchases = purchasesData?.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price_per_unit)), 0) || 0;
      
      const cashAfterExpenses = totalActualCash - totalExpenses;
      const surplusDeficit = totalIncome - totalExpenses;

      setReportData({
        totalIncome,
        totalExpenses,
        totalPurchases,
        cashAfterExpenses,
        surplusDeficit,
        incomeBreakdown: {
          cash: totalCash,
          credit: totalCredit,
          other: totalOther,
          actualCash: totalActualCash,
        },
      });

      toast({ title: "Report generated successfully" });
    } catch (error) {
      toast({ 
        title: "Error generating report", 
        description: "Please try again", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast({ title: "Print dialog opened" });
  };

  const handleExport = () => {
    if (!reportData) return;

    const csvContent = `
Restaurant Income Report
Date Range: ${dateRange.from} to ${dateRange.to}

Summary:
Total Income,${reportData.totalIncome}
Total Expenses,${reportData.totalExpenses}
Total Purchases,${reportData.totalPurchases}
Cash After Expenses,${reportData.cashAfterExpenses}
Surplus/Deficit,${reportData.surplusDeficit}

Income Breakdown:
Cash Amount,${reportData.incomeBreakdown.cash}
Credit Amount,${reportData.incomeBreakdown.credit}
Other Amount,${reportData.incomeBreakdown.other}
Actual Cash Received,${reportData.incomeBreakdown.actualCash}
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `restaurant-report-${dateRange.from}-to-${dateRange.to}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Report exported successfully" });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground">Generate and export financial reports for any date range</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="from">From Date</Label>
              <Input
                id="from"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="to">To Date</Label>
              <Input
                id="to"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={generateReport} disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </Button>
        </CardContent>
      </Card>

      {reportData && (
        <div className="space-y-6 print:space-y-4">
          <div className="flex justify-between items-center print:hidden">
            <h2 className="text-2xl font-bold">
              Report: {dateRange.from} to {dateRange.to}
            </h2>
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  ${reportData.totalIncome.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  ${reportData.totalExpenses.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  ${reportData.totalPurchases.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cash After Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${reportData.cashAfterExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${reportData.cashAfterExpenses.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Surplus/Deficit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${reportData.surplusDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${reportData.surplusDeficit.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Income Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cash Amount</p>
                  <p className="text-xl font-semibold">${reportData.incomeBreakdown.cash.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credit Amount</p>
                  <p className="text-xl font-semibold">${reportData.incomeBreakdown.credit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Other Amount</p>
                  <p className="text-xl font-semibold">${reportData.incomeBreakdown.other.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Actual Cash Received</p>
                  <p className="text-xl font-semibold">${reportData.incomeBreakdown.actualCash.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;