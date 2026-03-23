import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { PortfolioService } from '../../core/services/portfolio.service';
import { Asset } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent {
  private portfolioService = inject(PortfolioService);

  // Signals للحالة
  public sortColumn    = signal<keyof Asset | null>(null);
  public sortDirection = signal<'asc' | 'desc'>('asc');
  public searchTerm    = signal<string>('');

  // حالة التحديث (spinner)
  public isRefreshing = signal<boolean>(false);

  // وقت آخر تحديث (يتجدد مع كل refresh)
  public currentTime = signal<Date>(new Date());

  // الأصول بعد الفلترة والترتيب
  assets = computed<Asset[]>(() => {
    let result = [...this.portfolioService.getAssets()];

    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      result = result.filter(a =>
        a.symbol.toLowerCase().includes(term) ||
        a.name.toLowerCase().includes(term)
      );
    }

    const col = this.sortColumn();
    if (col) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const va = a[col];
        const vb = b[col];

        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
        if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * dir;
        return 0;
      });
    }

    return result;
  });

  // الملخص
  summary = this.portfolioService.portfolioSummary;

  // debounce للبحث
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(term => this.searchTerm.set(term));
  }

  // ────────────────────────────────────────────────
  // Methods
  // ────────────────────────────────────────────────

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  sortBy(column: keyof Asset): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  refresh(): void {
    this.isRefreshing.set(true);

    // تأخير اصطناعي لإظهار الـ spinner
    setTimeout(() => {
      try {
        // هنا بنحدث البيانات مباشرة (بدل triggerUpdate)
        this.portfolioService.updatePricesRandomly(); // تأكد إن الدالة دي public في الـ service
        // تحديث الوقت
        this.currentTime.set(new Date());
      } catch (err) {
        console.error('Refresh error:', err);
      } finally {
        this.isRefreshing.set(false);
      }
    }, 1000); // 1 ثانية كافية للـ spinner يبان
  }

  trackById(_index: number, asset: Asset): string {
    return asset.id;
  }
}