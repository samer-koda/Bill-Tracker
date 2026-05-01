import React, { useMemo } from 'react';
import { Bill } from '../types';
import { BillCard } from './BillCard';
import { format, parseISO, compareAsc } from 'date-fns';

interface Props {
  bills: Bill[];
  onTogglePaid: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
}

export function ListView({ bills, onTogglePaid, onEdit, onDelete }: Props) {
  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => compareAsc(parseISO(a.dueDate), parseISO(b.dueDate)));
  }, [bills]);

  const groupedBills = useMemo(() => {
    const groups: { [key: string]: Bill[] } = {};
    sortedBills.forEach(bill => {
      const monthYear = format(parseISO(bill.dueDate), 'MMMM yyyy');
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(bill);
    });
    return groups;
  }, [sortedBills]);

  if (bills.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No bills yet</h3>
        <p className="text-slate-500 max-w-sm">Tap the Quick Add button to add your first bill.</p>
      </div>
    );
  }

  // Calculate totals
  const totalDue = sortedBills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = sortedBills.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const unpaidCount = sortedBills.filter(b => !b.isPaid).length;

  return (
    <div className="space-y-6 pb-24 md:pb-8 w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <div className="bg-indigo-600 rounded-3xl p-6 md:p-8 text-white flex flex-col justify-between shadow-sm min-h-[160px]">
          <div className="flex justify-between items-start mb-4">
            <p className="text-indigo-100 font-semibold text-lg">Total Unpaid</p>
          </div>
          <div>
            <h3 className="text-4xl md:text-5xl font-bold mb-1">${totalDue.toFixed(2)}</h3>
            <p className="text-indigo-200 font-medium">{unpaidCount} Bills Outstanding</p>
          </div>
        </div>
        <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 md:p-8 flex items-center justify-between shadow-sm min-h-[160px]">
          <div>
            <h2 className="text-lg font-bold text-emerald-900 mb-1">Total Paid</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-emerald-700">${totalPaid.toFixed(2)}</h3>
          </div>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-emerald-200">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-8 pt-4">
        {Object.entries(groupedBills).map(([monthYear, monthBills]) => {
          const list = monthBills as Bill[];
          return (
          <div key={monthYear} className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 px-2 sticky top-[88px] md:top-[88px] bg-slate-50/95 backdrop-blur-[2px] py-3 z-10">
              {monthYear}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {list.map(bill => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onTogglePaid={onTogglePaid}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
