import React from 'react';
import { Bill } from '../types';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, Circle, MoreVertical, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  key?: React.Key;
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
}

export function BillCard({ bill, onTogglePaid, onEdit, onDelete }: Props) {
  const [showMenu, setShowMenu] = React.useState(false);
  const isOverdue = !bill.isPaid && new Date(bill.dueDate) < new Date(new Date().setHours(0,0,0,0));

  return (
    <div className={cn(
      "relative bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 transition-all h-full",
      bill.isPaid ? "opacity-60 bg-slate-50" : "hover:shadow-md"
    )}>
      <button 
        onClick={() => onTogglePaid(bill.id)}
        className="flex-shrink-0 text-slate-300 hover:text-indigo-600 transition-colors focus:outline-none"
      >
        {bill.isPaid ? (
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        ) : (
          <Circle className="w-8 h-8 border-slate-300" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-base font-bold truncate",
          bill.isPaid ? "text-slate-500 line-through" : "text-slate-900"
        )}>
          {bill.payee}
        </h4>
        <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis w-full pr-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className={cn(
            "text-xs font-medium space-x-1 shrink-0",
            isOverdue ? "text-rose-600 font-bold" : "text-slate-500"
          )}>
            <span>{format(parseISO(bill.dueDate), 'MMM dd')}</span>
            <span className="text-slate-300">•</span>
            <span>{bill.isRecurring ? 'Recurring' : 'One-time'}</span>
            {bill.isAutopay && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-500 font-bold">Autopay</span>
              </>
            )}
            {isOverdue && <span className="ml-1 text-rose-600 font-bold">• Overdue</span>}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <span className={cn(
          "text-lg font-bold",
          bill.isPaid ? "text-slate-500" : "text-indigo-600"
        )}>
          ${bill.amount.toFixed(2)}
        </span>
      </div>

      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 -mr-2 text-slate-400 hover:bg-slate-100 rounded-full"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)} 
            />
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1 overflow-hidden transition-all origin-top-right">
              <button
                onClick={() => { setShowMenu(false); onEdit(bill); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 font-medium hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                onClick={() => { setShowMenu(false); onDelete(bill.id); }}
                className="w-full text-left px-4 py-2 text-sm text-rose-600 font-medium hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
