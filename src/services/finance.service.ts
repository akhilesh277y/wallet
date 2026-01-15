import { Injectable, signal, computed, effect } from '@angular/core';

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
  
  private getDefaultData(): Transaction[] {
    return [
      { id: '1', type: 'income', amount: 5000, category: 'Salary', description: 'Monthly Salary', date: new Date() },
      { id: '2', type: 'expense', amount: 120, category: 'Food', description: 'Groceries', date: new Date() },
      { id: '3', type: 'expense', amount: 50, category: 'Transport', description: 'Uber', date: new Date() },
      { id: '4', type: 'expense', amount: 800, category: 'Rent', description: 'Monthly Rent', date: new Date() },
    ];
  }

  // Load from local storage or default with robust error handling
  private loadInitialData(): Transaction[] {
    // Prevent access during server-side rendering or build
    if (typeof localStorage === 'undefined') return this.getDefaultData();

    try {
      const stored = localStorage.getItem('walleto_transactions');
      
      // Explicitly check for "undefined" string which causes JSON.parse to crash
      if (!stored || stored === 'undefined' || stored === 'null' || stored.trim() === '') {
        return this.getDefaultData();
      }

      const parsed = JSON.parse(stored);
      
      if (!Array.isArray(parsed)) return this.getDefaultData();

      return parsed.map((t: any) => ({
        ...t,
        amount: Number(t.amount) || 0, // Ensure amount is a number
        date: new Date(t.date)
      }));
    } catch (e) {
      console.warn('Failed to parse local storage, reverting to default data.', e);
      // Optional: Clear bad data
      try { localStorage.removeItem('walleto_transactions'); } catch {}
      return this.getDefaultData();
    }
  }

  // State
  readonly transactions = signal<Transaction[]>(this.loadInitialData());

  // Computed Values
  readonly totalIncome = computed<number>(() => 
    this.transactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly totalExpense = computed<number>(() => 
    this.transactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly balance = computed<number>(() => this.totalIncome() - this.totalExpense());

  readonly expenseCategories = computed(() => {
    const expenses = this.transactions().filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      const currentVal = acc[curr.category] ?? 0;
      acc[curr.category] = currentVal + curr.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([category, value]) => ({ category, value: value as number }))
      .sort((a, b) => b.value - a.value);
  });

  constructor() {
    // Persist to local storage whenever transactions change
    effect(() => {
      const data = this.transactions();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('walleto_transactions', JSON.stringify(data));
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