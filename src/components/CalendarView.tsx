import React, { useState, useMemo } from 'react';
import { Bill } from '../types';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { BillCard } from './BillCard';

interface Props {
  bills: Bill[];
  onTogglePaid: (id: string) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
}

export function CalendarView({ bills, onTogglePaid, onEdit, onDelete }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Render header
  const header = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2 text-sm">
          <button onClick={prevMonth} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md font-bold hover:bg-slate-200 transition-colors">Prev</button>
          <button onClick={nextMonth} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md font-bold hover:bg-slate-200 transition-colors">Next</button>
        </div>
      </div>
    );
  };

  // Render Cells
  const cells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    // Header abbreviations
    const daysHeader = [];
    for (let i = 0; i < 7; i++) {
        daysHeader.push(
          <div className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase" key={`header-${i}`}>
            {format(addDays(startDate, i), 'EEE')}
          </div>
        );
    }
    rows.push(
        <div className="grid grid-cols-7 gap-px border-b border-slate-200" key="headers">
            {daysHeader}
        </div>
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Find bills for this day
        const dayBills = bills.filter(b => isSameDay(parseISO(b.dueDate), cloneDay));
        const hasUnpaid = dayBills.some(b => !b.isPaid);
        const hasPaid = dayBills.some(b => b.isPaid);

        days.push(
          <div
            className={cn(
              "relative h-20 md:h-24 p-2 cursor-pointer transition-colors flex flex-col",
              !isSameMonth(day, monthStart) ? "bg-white text-slate-300" : "bg-white text-slate-900 hover:bg-indigo-50",
              isSameDay(day, selectedDate) ? "ring-2 ring-inset ring-indigo-500 bg-indigo-50 z-10" : "",
              isSameDay(day, new Date()) ? "font-bold" : "" // Today highlight
            )}
            key={day.toISOString()}
            onClick={() => onDateClick(cloneDay)}
          >
            <span className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full text-sm",
              isSameDay(day, new Date()) ? "bg-indigo-600 text-white" : ""
            )}>
              {formattedDate}
            </span>
            
            {/* Desktop labels */}
            <div className="mt-1 space-y-1 flex-1 overflow-hidden hidden md:block">
               {dayBills.map(b => (
                 <div key={b.id} className={cn(
                     "text-[10px] text-white px-1.5 py-0.5 rounded font-medium leading-none truncate",
                     b.isPaid ? "bg-emerald-500" : "bg-indigo-500"
                 )}>
                   {b.payee}: ${b.amount}
                 </div>
               ))}
            </div>

            {/* Mobile dots indicator */}
            <div className="mt-auto flex gap-1 justify-center pb-1 md:hidden">
               {hasPaid && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
               {hasUnpaid && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-px" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }
    return (
      <div className="bg-slate-200 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        {rows}
      </div>
    );
  };

  const selectedDayBills = useMemo(() => {
    return bills.filter(b => isSameDay(parseISO(b.dueDate), selectedDate));
  }, [bills, selectedDate]);

  return (
    <div className="w-full pb-24 md:pb-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col xl:col-span-8 lg:max-w-4xl max-w-full mx-auto">
        {header()}
        {cells()}
      </div>
      
      <div className="mt-8 lg:max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-4 px-2">
          Bills on {format(selectedDate, 'MMM dd, yyyy')}
        </h3>
        
        {selectedDayBills.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-400 font-medium">No bills due on this date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedDayBills.map(bill => (
              <BillCard
                key={bill.id}
                bill={bill}
                onTogglePaid={onTogglePaid}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
