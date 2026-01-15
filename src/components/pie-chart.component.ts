import { Component, ElementRef, ViewChild, effect, inject, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FinanceService } from '../services/finance.service';

declare const d3: any;

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 h-full">
      <h3 class="text-lg font-bold text-slate-800 mb-6 w-full text-left flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
        Expense Breakdown
      </h3>
      
      @if (hasExpenses()) {
        <div #chartContainer class="w-full flex justify-center items-center relative z-10"></div>
        
        <div class="mt-6 w-full space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          @for (item of data(); track item.category) {
            <div class="flex items-center justify-between text-sm group cursor-default">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full shadow-sm" [style.background-color]="getColor(item.category)"></span>
                <span class="font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{{ item.category }}</span>
              </div>
              <span class="font-semibold text-slate-800">{{ item.value | currency }}</span>
            </div>
          }
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center h-48 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p class="text-sm font-medium">No expenses yet</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 4px; }
  `]
})
export class PieChartComponent {
  private financeService = inject(FinanceService);
  private platformId = inject(PLATFORM_ID);
  
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  data = this.financeService.expenseCategories;
  
  hasExpenses = computed(() => this.data().length > 0);

  // Modern, vibrant color palette
  private colors = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#f43f5e', // Rose
    '#14b8a6', // Teal
  ];

  constructor() {
    effect(() => {
      // Re-run whenever data changes
      const data = this.data();
      if (this.hasExpenses() && isPlatformBrowser(this.platformId)) {
        // Wait for view update to ensure container exists
        setTimeout(() => this.createChart(data), 0);
      }
    });
  }

  getColor(category: string): string {
    const index = this.data().findIndex(d => d.category === category);
    return this.colors[index % this.colors.length];
  }

  private createChart(data: {category: string, value: number}[]) {
    if (!this.chartContainer) return;

    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    const width = 220;
    const height = 220;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Creates the pie layout
    const pie = d3.pie()
      .value((d: any) => d.value)
      .sort(null)
      .padAngle(0.03); // Gap between slices

    // Creates the arc generator
    const arc = d3.arc()
      .innerRadius(radius * 0.6) // Donut chart style
      .outerRadius(radius)
      .cornerRadius(6);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.category))
      .range(this.colors);

    // Build the pie chart
    svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => color(d.data.category))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 0.9)
      .transition() // Animation
      .duration(750)
      .attrTween('d', function(this: any, d: any) {
        const i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return function(t: any) {
          d.endAngle = i(t);
          return arc(d);
        }
      });

    // Add center text
    const total = d3.sum(data, (d: any) => d.value);
    
    // Center Text Group
    const centerText = svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em'); // Center vertically

    centerText.append('tspan')
      .text('Total')
      .attr('x', 0)
      .attr('dy', '-0.5em')
      .attr('font-size', '12px')
      .attr('fill', '#94a3b8')
      .attr('font-weight', '500');

    centerText.append('tspan')
      .text('$' + Math.floor(total).toLocaleString())
      .attr('x', 0)
      .attr('dy', '1.2em')
      .attr('font-size', '18px')
      .attr('fill', '#1e293b')
      .attr('font-weight', 'bold');
  }
}