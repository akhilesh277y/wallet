import { Injectable, signal, computed, effect, Signal } from '@angular/core';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  // Load from local storage or default
  private loadInitialData(): Transaction[] {
    const stored = localStorage.getItem('walleto_transactions');
    // Explicitly check for string "undefined" or "null" which can cause JSON.parse to fail or behave unexpectedly
    if (stored && stored !== 'undefined' && stored !== 'null') {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((t: any) => ({
            ...t,
            amount: Number(t.amount), // Ensure amount is a number
            date: new Date(t.date)
          }));
        }
      } catch (e) {
        console.warn('Failed to parse local storage, resetting data.', e);
        localStorage.removeItem('walleto_transactions');
      }
    }
    
    return [
      { id: '1', type: 'income', amount: 5000, category: 'Salary', description: 'Monthly Salary', date: new Date() },
      { id: '2', type: 'expense', amount: 120, category: 'Food', description: 'Groceries', date: new Date() },
      { id: '3', type: 'expense', amount: 50, category: 'Transport', description: 'Uber', date: new Date() },
      { id: '4', type: 'expense', amount: 800, category: 'Rent', description: 'Monthly Rent', date: new Date() },
    ];
  }

  // State
  readonly transactions = signal<Transaction[]>(this.loadInitialData());

  // Computed Values
  readonly totalIncome: Signal<number> = computed(() => 
    this.transactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly totalExpense: Signal<number> = computed(() => 
    this.transactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly balance: Signal<number> = computed(() => this.totalIncome() - this.totalExpense());

  readonly expenseCategories = computed(() => {
    const expenses = this.transactions().filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      const currentVal = acc[curr.category] ?? 0;
      acc[curr.category] = currentVal + curr.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  });

  constructor() {
    // Persist to local storage whenever transactions change
    effect(() => {
      try {
        const data = this.transactions();
        if (data) {
          localStorage.setItem('walleto_transactions', JSON.stringify(data));
        }
      } catch (e) {
        console.error('Error saving to local storage', e);
      }
    });
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'date'>) {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: new Date()
    };
    this.transactions.update(prev => [newTransaction, ...prev]);
  }

  deleteTransaction(id: string) {
    this.transactions.update(prev => prev.filter(t => t.id !== id));
  }
}