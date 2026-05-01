import React, { useState } from 'react';
import { Bill } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Omit<Bill, 'id'>) => void;
  initialData?: Bill;
}

export function AddBillModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [payee, setPayee] = useState(initialData?.payee || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [isAutopay, setIsAutopay] = useState(initialData?.isAutopay || false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payee || !amount || !dueDate) return;

    onSave({
      payee,
      amount: parseFloat(amount),
      dueDate,
      notes,
      isRecurring,
      isAutopay,
      isPaid: initialData?.isPaid || false,
    });
    
    // Reset if it's a new bill
    if (!initialData) {
      setPayee('');
      setAmount('');
      setDueDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setIsRecurring(false);
      setIsAutopay(false);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all pb-safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Bill' : 'Add New Bill'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors -mr-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Payee (e.g. Electric Co) <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
              placeholder="Who is the bill for?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Amount <span className="text-rose-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-500 font-bold">$</span>
              </div>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Due Date <span className="text-rose-500">*</span></label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
              <input
                id="recurring"
                type="checkbox"
                checked={isRecurring}
                readOnly
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="recurring" className="ml-3 block text-sm font-bold text-slate-700 cursor-pointer select-none">
                Recurring
              </label>
            </div>
            
            <div className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer" onClick={() => setIsAutopay(!isAutopay)}>
              <input
                id="autopay"
                type="checkbox"
                checked={isAutopay}
                readOnly
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="autopay" className="ml-3 block text-sm font-bold text-slate-700 cursor-pointer select-none">
                Autopay
              </label>
            </div>
          </div>
          
          <div className="pt-6 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-sm transition-colors"
            >
              Save Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
