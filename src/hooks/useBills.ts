import { useState, useEffect } from 'react';
import { Bill } from '../types';
import { generateId } from '../lib/utils';

export function useBills() {
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('bills_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [useLocalStorage, setUseLocalStorage] = useState(true);

  useEffect(() => {
    if (useLocalStorage) {
      localStorage.setItem('bills_data', JSON.stringify(bills));
    }
  }, [bills, useLocalStorage]);

  // Process autopay bills
  useEffect(() => {
    let hasChanges = false;
    
    setBills(prev => {
      let nextBills = [...prev];
      const todayString = new Date().toISOString().slice(0, 10);
      
      for (const bill of prev) {
        if (bill.isAutopay && !bill.isPaid && bill.dueDate <= todayString) {
          hasChanges = true;
          // Apply togglePaid logic essentially
          const index = nextBills.findIndex(b => b.id === bill.id);
          if (index !== -1) {
            if (bill.isRecurring) {
              const currentDueDate = new Date(bill.dueDate);
              // Handle next month correctly
              currentDueDate.setUTCHours(12); // avoid timezone issues
              currentDueDate.setUTCMonth(currentDueDate.getUTCMonth() + 1);
              
              const newBill: Bill = {
                ...bill,
                id: generateId(),
                dueDate: currentDueDate.toISOString().slice(0, 10),
                isPaid: false
              };
              nextBills[index] = { ...bill, isPaid: true };
              nextBills.push(newBill);
            } else {
              nextBills[index] = { ...bill, isPaid: true };
            }
          }
        }
      }
      return hasChanges ? nextBills : prev;
    });
  }, []);

  const addBill = (billData: Omit<Bill, 'id'>) => {
    const newBill = {
      ...billData,
      id: generateId()
    };
    setBills(prev => [...prev, newBill]);
  };

  const updateBill = (id: string, updates: Partial<Bill>) => {
    setBills(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const togglePaid = (id: string) => {
    setBills(prev => {
      const bill = prev.find(b => b.id === id);
      if (!bill) return prev;

      // If it's recurring and we are marking it as paid
      if (bill.isRecurring && !bill.isPaid) {
        // Find next month's date
        const currentDueDate = new Date(bill.dueDate);
        currentDueDate.setMonth(currentDueDate.getMonth() + 1);
        
        const newBill: Bill = {
          ...bill,
          id: generateId(),
          dueDate: currentDueDate.toISOString().slice(0, 10),
          isPaid: false
        };

        // Mark current as paid, add new bill for next month
        return [
          ...prev.filter(b => b.id !== id),
          { ...bill, isPaid: true },
          newBill
        ];
      }

      // Default toggle logic
      return prev.map(b => (b.id === id ? { ...b, isPaid: !b.isPaid } : b));
    });
  };

  return { bills, setBills, addBill, updateBill, deleteBill, togglePaid, setUseLocalStorage };
}
