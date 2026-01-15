import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService, Transaction } from '../services/finance.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div class="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-3xl">
        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Recent Activity
        </h3>
        <span class="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
          {{ transactions().length }} items
        </span>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        @if (transactions().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-slate-400 py-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p class="text-sm">No transactions yet.</p>
          </div>
        } @else {
          @for (t of transactions(); track t.id) {
            <div class="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm transition-all duration-200">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm"
                  [class]="t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'">
                  @if (t.type === 'income') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                    </svg>
                  }
                </div>
                <div>
                  <p class="font-bold text-slate-800 text-sm">{{ t.description }}</p>
                  <p class="text-xs text-slate-500 font-medium">{{ t.category }} • {{ t.date | date:'shortDate' }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-4">
                <span class="font-bold text-sm tracking-wide"
                  [class]="t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'">
                  {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | currency }}
                </span>
                
                <button (click)="delete(t.id)" 
                  class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Delete transaction">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
  `]
})
export class TransactionListComponent {
  private financeService = inject(FinanceService);
  transactions = this.financeService.transactions;

  delete(id: string) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.financeService.deleteTransaction(id);
    }
  }
}