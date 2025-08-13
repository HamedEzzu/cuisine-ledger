import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Income, CreateIncome } from "@/types/database";

const IncomeForm = ({ 
  income, 
  onSave, 
  onCancel 
}: { 
  income?: Income; 
  onSave: () => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState<CreateIncome>({
    date: income?.date || new Date().toISOString().split('T')[0],
    total_income: income?.total_income || 0,
    cash_amount: income?.cash_amount || 0,
    credit_amount: income?.credit_amount || 0,
    other_amount: income?.other_amount || 0,
    actual_cash_received: income?.actual_cash_received || 0,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (income) {
        await supabase
          .from('income')
          .update(formData)
          .eq('id', income.id);
        toast({ title: "Income updated successfully" });
      } else {
        await supabase
          .from('income')
          .insert([formData]);
        toast({ title: "Income added successfully" });
      }
      onSave();
    } catch (error) {
      toast({ 
        title: "Error saving income", 
        description: "Please try again", 
        variant: "destructive" 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{income ? 'Edit Income' : 'Add Income'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="total_income">Total Income</Label>
              <Input
                id="total_income"
                type="number"
                step="0.01"
                value={formData.total_income}
                onChange={(e) => setFormData({ ...formData, total_income: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="cash_amount">Cash Amount</Label>
              <Input
                id="cash_amount"
                type="number"
                step="0.01"
                value={formData.cash_amount}
                onChange={(e) => setFormData({ ...formData, cash_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="credit_amount">Credit Amount</Label>
              <Input
                id="credit_amount"
                type="number"
                step="0.01"
                value={formData.credit_amount}
                onChange={(e) => setFormData({ ...formData, credit_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="other_amount">Other Amount</Label>
              <Input
                id="other_amount"
                type="number"
                step="0.01"
                value={formData.other_amount}
                onChange={(e) => setFormData({ ...formData, other_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="actual_cash_received">Actual Cash Received</Label>
              <Input
                id="actual_cash_received"
                type="number"
                step="0.01"
                value={formData.actual_cash_received}
                onChange={(e) => setFormData({ ...formData, actual_cash_received: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const Income = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      toast({ title: "Error fetching incomes", variant: "destructive" });
    } else {
      setIncomes(data || []);
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Error deleting income", variant: "destructive" });
    } else {
      toast({ title: "Income deleted successfully" });
      fetchIncomes();
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingIncome(null);
    fetchIncomes();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIncome(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Income Management</h1>
          <p className="text-muted-foreground">Track your restaurant's daily income</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
      </div>

      {(showForm || editingIncome) && (
        <IncomeForm
          income={editingIncome || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="grid gap-4">
        {incomes.map((income) => (
          <Card key={income.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{new Date(income.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Income</p>
                    <p className="font-medium text-green-600">${income.total_income}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cash</p>
                    <p className="font-medium">${income.cash_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credit</p>
                    <p className="font-medium">${income.credit_amount}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingIncome(income);
                      setShowForm(false);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(income.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Income;