import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FinanceService } from '../services/finance.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-full">
      <h3 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <div class="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        </div>
        New Transaction
      </h3>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
        
        <!-- Type Toggle -->
        <div class="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
          <button type="button" 
            (click)="setType('expense')"
            class="py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            [ngClass]="{
              'bg-rose-500 text-white shadow-md shadow-rose-200': type() === 'expense',
              'text-slate-500 hover:bg-slate-200 hover:text-slate-700': type() !== 'expense'
            }">
            Expense
          </button>
          <button type="button" 
            (click)="setType('income')"
            class="py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            [ngClass]="{
              'bg-emerald-500 text-white shadow-md shadow-emerald-200': type() === 'income',
              'text-slate-500 hover:bg-slate-200 hover:text-slate-700': type() !== 'income'
            }">
            Income
          </button>
        </div>

        <!-- Amount -->
        <div class="relative group">
          <label class="block text-xs font-semibold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Amount</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input type="number" formControlName="amount" placeholder="0.00"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 text-slate-800 font-bold placeholder-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200"
              [ngClass]="{
                'focus:ring-rose-500': type() === 'expense',
                'focus:ring-emerald-500': type() === 'income'
              }">
          </div>
        </div>

        <!-- Description -->
        <div>
           <label class="block text-xs font-semibold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Description</label>
           <input type="text" formControlName="description" placeholder="e.g. Weekly Groceries"
             class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200"
             [ngClass]="{
                'focus:ring-rose-500': type() === 'expense',
                'focus:ring-emerald-500': type() === 'income'
              }">
        </div>

        <!-- Category -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Category</label>
          <div class="grid grid-cols-3 gap-2">
            @for (cat of currentCategories(); track cat) {
              <button type="button"
                (click)="setCategory(cat)"
                class="px-2 py-2 text-xs font-medium rounded-lg border transition-all duration-200 truncate"
                [ngClass]="getCategoryClass(cat)">
                {{ cat }}
              </button>
            }
          </div>
        </div>

        <button type="submit" 
          [disabled]="form.invalid || !selectedCategory"
          class="w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
          [ngClass]="{
            'bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-rose-200': type() === 'expense',
            'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-emerald-200': type() === 'income'
          }">
          {{ type() === 'expense' ? 'Add Expense' : 'Add Income' }}
        </button>

      </form>
    </div>
  `
})
export class TransactionFormComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private financeService = inject(FinanceService);

  type = signal<'income' | 'expense'>('expense');
  selectedCategory = 'Food';

  expenseCategories = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Other'];
  incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'];

  form: FormGroup = this.fb.group({
    amount: ['', [Validators.required, Validators.min(0.01)]],
    description: ['', [Validators.required, Validators.minLength(2)]]
  });

  currentCategories = computed(() => 
    this.type() === 'expense' ? this.expenseCategories : this.incomeCategories
  );

  setType(t: 'income' | 'expense') {
    this.type.set(t);
    this.selectedCategory = t === 'expense' ? this.expenseCategories[0] : this.incomeCategories[0];
  }

  setCategory(c: string) {
    this.selectedCategory = c;
  }

  getCategoryClass(cat: string) {
    const isSelected = this.selectedCategory === cat;
    const isExpense = this.type() === 'expense';
    
    if (isSelected) {
      return isExpense 
        ? 'bg-rose-50 border-rose-200 text-rose-700 ring-1 ring-rose-500' 
        : 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-500';
    }
    return 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50';
  }

  onSubmit() {
    if (this.form.valid && this.selectedCategory) {
      this.financeService.addTransaction({
        type: this.type(),
        amount: Number(this.form.value.amount),
        description: this.form.value.description,
        category: this.selectedCategory
      });
      
      // Reset form
      this.form.reset();
      this.setType('expense'); // Reset to default
    }
  }
}
