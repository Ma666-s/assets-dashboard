// src/app/core/models/asset.model.ts

export interface Asset {
  id: string;                // مثال: "aapl" أو "tsla-123"
  symbol: string;            // AAPL, TSLA, BTCUSD, ETHUSD, ...
  name: string;              // Apple Inc., Tesla Inc., Bitcoin, ...
  currentPrice: number;      // السعر الحالي
  previousPrice: number;     // السعر قبل آخر تحديث (علشان نحسب التغيير)
  change: number;            // القيمة المطلقة للتغيير (current - previous)
  changePercent: number;     // النسبة المئوية (change / previous * 100)
  volume?: number;           // حجم التداول (اختياري)
  lastUpdated: Date;         // وقت آخر تحديث
}

export interface PortfolioSummary {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  assetsCount: number;
}