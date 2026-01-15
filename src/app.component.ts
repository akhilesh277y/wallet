import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from './services/finance.service';
import { TransactionFormComponent } from './components/transaction-form.component';
import { TransactionListComponent } from './components/transaction-list.component';
import { PieChartComponent } from './components/pie-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TransactionFormComponent, TransactionListComponent, PieChartComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private financeService = inject(FinanceService);
  
  totalIncome = this.financeService.totalIncome;
  totalExpense = this.financeService.totalExpense;
  balance = this.financeService.balance;
}