import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Purchase, CreatePurchase, Expense } from "@/types/database";

const PurchaseForm = ({ 
  purchase, 
  onSave, 
  onCancel 
}: { 
  purchase?: Purchase; 
  onSave: () => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState<CreatePurchase>({
    expense_id: purchase?.expense_id || 0,
    item_name: purchase?.item_name || '',
    quantity: purchase?.quantity || 1,
    price_per_unit: purchase?.price_per_unit || 0,
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    setExpenses(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.expense_id === 0) {
      toast({ title: "Please select an expense", variant: "destructive" });
      return;
    }
    
    try {
      if (purchase) {
        await supabase
          .from('purchases')
          .update(formData)
          .eq('id', purchase.id);
        toast({ title: "Purchase updated successfully" });
      } else {
        await supabase
          .from('purchases')
          .insert([formData]);
        toast({ title: "Purchase added successfully" });
      }
      onSave();
    } catch (error) {
      toast({ 
        title: "Error saving purchase", 
        description: "Please try again", 
        variant: "destructive" 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{purchase ? 'Edit Purchase' : 'Add Purchase'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="expense_id">Related Expense</Label>
            <Select 
              value={formData.expense_id.toString()} 
              onValueChange={(value) => setFormData({ ...formData, expense_id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an expense" />
              </SelectTrigger>
              <SelectContent>
                {expenses.map((expense) => (
                  <SelectItem key={expense.id} value={expense.id.toString()}>
                    {expense.category} - ${expense.amount} ({new Date(expense.date).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="item_name">Item Name</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              placeholder="e.g., Tomatoes, Chicken, Oil"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="price_per_unit">Price per Unit</Label>
              <Input
                id="price_per_unit"
                type="number"
                step="0.01"
                value={formData.price_per_unit}
                onChange={(e) => setFormData({ ...formData, price_per_unit: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>
          
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">
              Total: ${(formData.quantity * formData.price_per_unit).toFixed(2)}
            </p>
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

const Purchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        expense:expenses(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: "Error fetching purchases", variant: "destructive" });
    } else {
      setPurchases(data || []);
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Error deleting purchase", variant: "destructive" });
    } else {
      toast({ title: "Purchase deleted successfully" });
      fetchPurchases();
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingPurchase(null);
    fetchPurchases();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPurchase(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Management</h1>
          <p className="text-muted-foreground">Track items purchased for expenses</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          Add Purchase
        </Button>
      </div>

      {(showForm || editingPurchase) && (
        <PurchaseForm
          purchase={editingPurchase || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="grid gap-4">
        {purchases.map((purchase) => (
          <Card key={purchase.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
                  <div>
                    <p className="text-sm text-muted-foreground">Item</p>
                    <p className="font-medium">{purchase.item_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{purchase.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price/Unit</p>
                    <p className="font-medium">${purchase.price_per_unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-medium text-blue-600">
                      ${(purchase.quantity * purchase.price_per_unit).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expense</p>
                    <p className="font-medium text-sm">
                      {purchase.expense?.category || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingPurchase(purchase);
                      setShowForm(false);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(purchase.id)}
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

export default Purchases;