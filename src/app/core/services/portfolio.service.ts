// src/app/core/services/portfolio.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Asset, PortfolioSummary } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  // البيانات الأساسية (mock) – هنخزنها في Signal عشان reactivity سريعة
  private assets = signal<Asset[]>(this.getInitialMockAssets());

  // Signal للـ summary (هنحسبه أوتوماتيك)
  portfolioSummary = computed<PortfolioSummary>(() => this.calculateSummary(this.assets()));

  // Observable للتحديث الدوري (real-time simulation)
  private updateIntervalMs = 5000; // كل 5 ثواني

  constructor() {
    // نبدأ التحديث التلقائي لما الـ service يتولد
    this.startPriceUpdates();
  }

  // جيب كل الأصول كـ Signal (للـ components تستخدمه مباشرة)
  getAssets(): Asset[] {
    return this.assets();
  }

  // Observable للأصول (لو عايزين نستخدم async pipe في بعض الأماكن)
  assets$ = new BehaviorSubject<Asset[]>(this.getInitialMockAssets());

  // بدء محاكاة التغييرات في الأسعار
  private startPriceUpdates(): void {
    interval(this.updateIntervalMs).subscribe(() => {
      this.updatePricesRandomly();
      // نحدث الـ BehaviorSubject كمان لو فيه مكونات بتستخدم async pipe
      this.assets$.next(this.assets());
    });
  }

  // تغيير عشوائي بسيط للأسعار (±0.5% إلى ±3%)
  public updatePricesRandomly(): void {
    const updated = this.assets().map(asset => {
      const randomChangePercent = (Math.random() * 5.5 - 2.75) / 100; // بين -2.75% و +2.75%
      const newPrice = asset.currentPrice * (1 + randomChangePercent);

      return {
        ...asset,
        previousPrice: asset.currentPrice,
        currentPrice: Number(newPrice.toFixed(2)),
        change: Number((newPrice - asset.currentPrice).toFixed(2)),
        changePercent: Number((randomChangePercent * 100).toFixed(2)),
        lastUpdated: new Date()
      };
    });

    this.assets.set(updated);
  }

  // البيانات المبدئية (mock)
  private getInitialMockAssets(): Asset[] {
    return [
      {
        id: 'aapl',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        currentPrice: 192.53,
        previousPrice: 192.53,
        change: 0,
        changePercent: 0,
        volume: 48000000,
        lastUpdated: new Date()
      },
      {
        id: 'tsla',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        currentPrice: 248.71,
        previousPrice: 248.71,
        change: 0,
        changePercent: 0,
        volume: 92000000,
        lastUpdated: new Date()
      },
      {
        id: 'btc',
        symbol: 'BTCUSD',
        name: 'Bitcoin',
        currentPrice: 67542.18,
        previousPrice: 67542.18,
        change: 0,
        changePercent: 0,
        volume: 28000000000,
        lastUpdated: new Date()
      },
      {
        id: 'eth',
        symbol: 'ETHUSD',
        name: 'Ethereum',
        currentPrice: 3421.09,
        previousPrice: 3421.09,
        change: 0,
        changePercent: 0,
        volume: 12000000000,
        lastUpdated: new Date()
      },
      {
        id: 'msft',
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        currentPrice: 415.22,
        previousPrice: 415.22,
        change: 0,
        changePercent: 0,
        volume: 22000000,
        lastUpdated: new Date()
      }
    ];
  }

  // حساب الـ summary الكلي
  private calculateSummary(assets: Asset[]): PortfolioSummary {
    const totalValue = assets.reduce((sum, a) => sum + a.currentPrice * 100, 0); // نفترض 100 وحدة لكل أصل
    const totalPrevious = assets.reduce((sum, a) => sum + a.previousPrice * 100, 0);

    const totalChange = totalValue - totalPrevious;
    const totalChangePercent = totalPrevious !== 0 ? (totalChange / totalPrevious) * 100 : 0;

    return {
      totalValue: Number(totalValue.toFixed(2)),
      totalChange: Number(totalChange.toFixed(2)),
      totalChangePercent: Number(totalChangePercent.toFixed(2)),
      assetsCount: assets.length
    };
  }

  // لو عايزين نضيف فلتر أو بحث لاحقًا
  getFilteredAssets$(searchTerm: string): Observable<Asset[]> {
    return this.assets$.pipe(
      map(assets => 
        assets.filter(a => 
          a.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }
}