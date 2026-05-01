export interface Bill {
  id: string;
  payee: string;
  amount: number;
  dueDate: string; // ISO format: YYYY-MM-DD
  isPaid: boolean;
  notes?: string;
  isRecurring?: boolean; // simple flag for recurring bills
}
