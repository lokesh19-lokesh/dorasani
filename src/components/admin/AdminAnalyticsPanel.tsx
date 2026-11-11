import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileDown,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import {
  AnalyticsBucket,
  AnalyticsGranularity,
  AnalyticsMetricView,
  buildAnalyticsBreakdown,
  buildAnalyticsSummary,
  buildPeriodSeries,
  getAvailableOrderYears,
} from '../../utils/adminAnalytics';
import { LOW_STOCK_THRESHOLD } from '../../types';

interface AdminAnalyticsPanelProps {
  orders: any[];
  products: any[];
  onExportCSV: (filename: string, rows: object[]) => void;
  onJumpToOrders?: (statusFilter?: string) => void;
  onJumpToInventory?: () => void;
}

function formatInr(value: number): string {
  return `₹${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;
}

function formatCompactInr(value: number): string {
  const num = Number(value || 0);
  if (num >= 10_000_000) return `₹${(num / 10_000_000).toFixed(1)}Cr`;
  if (num >= 100_000) return `₹${(num / 100_000).toFixed(1)}L`;
  if (num >= 1_000) return `₹${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}k`;
  return `₹${Math.round(num)}`;
}

function getNiceIntegerAxisMax(rawMax: number): number {
  if (rawMax <= 4) return 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const normalized = rawMax / magnitude;
  let niceNorm = 10;
  if (normalized <= 1.2) niceNorm = 1.2;
  else if (normalized <= 1.5) niceNorm = 1.6;
  else if (normalized <= 2) niceNorm = 2;
  else if (normalized <= 2.5) niceNorm = 2.8;
  else if (normalized <= 4) niceNorm = 4;
  else if (normalized <= 6) niceNorm = 6;
  else if (normalized <= 8) niceNorm = 8;
  const candidate = Math.ceil(niceNorm * magnitude);
  // Ensure cleanly divisible by 4 so integer grid ticks look sharp
  const remainder = candidate % 4;
  return remainder === 0 ? candidate : candidate + (4 - remainder);
}

function getNiceCurrencyAxisMax(rawMax: number): number {
  if (rawMax <= 0) return 10_000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const normalized = rawMax / magnitude;
  let step = 10;
  if (normalized <= 1) step = 1;
  else if (normalized <= 2) step = 2;
  else if (normalized <= 4) step = 4;
  else if (normalized <= 6) step = 6;
  else if (normalized <= 8) step = 8;
  return Math.ceil(step * magnitude);
}

export const AdminAnalyticsPanel: React.FC<AdminAnalyticsPanelProps> = ({
  orders,
  products,
  onExportCSV,
  onJumpToOrders,
  onJumpToInventory,
}) => {
  const [granularity, setGranularity] = useState<AnalyticsGranularity>('weekly');
  const [metricView, setMetricView] = useState<AnalyticsMetricView>('volume');
  const [monthlyScope, setMonthlyScope] = useState<'rolling_12' | number>('rolling_12');
  const [selectedBucketKey, setSelectedBucketKey] = useState<string | null>(null);

  const availableYears = useMemo(() => getAvailableOrderYears(orders), [orders]);

  const summaryCards = useMemo(() => buildAnalyticsSummary(orders), [orders]);

  const series: AnalyticsBucket[] = useMemo(
    () =>
      buildPeriodSeries(orders, granularity, {
        weekCount: 12,
        monthlyScope,
      }),
    [orders, granularity, monthlyScope]
  );

  const breakdown = useMemo(
    () => buildAnalyticsBreakdown(orders, products),
    [orders, products]
  );

  // Active inspected bucket defaults to the current period (or last bucket)
  const activeBucket = useMemo(() => {
    if (!series.length) return null;
    if (selectedBucketKey) {
      const hit = series.find((b) => b.key === selectedBucketKey);
      if (hit) return hit;
    }
    return series.find((b) => b.isCurrent) || series[series.length - 1];
  }, [series, selectedBucketKey]);

  const totalsForSeries = useMemo(() => {
    return series.reduce(
      (acc, b) => {
        acc.ordersCame += b.ordersCame;
        acc.deliveredOrders += b.deliveredOrders;
        acc.inProgressOrders += b.inProgressOrders;
        acc.cancelledOrders += b.cancelledOrders;
        acc.returnedOrders += b.returnedOrders;
        acc.netRevenueInr += b.netRevenueInr;
        acc.cancelledValueInr += b.cancelledValueInr;
        return acc;
      },
      {
        ordersCame: 0,
        deliveredOrders: 0,
        inProgressOrders: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
        netRevenueInr: 0,
        cancelledValueInr: 0,
      }
    );
  }, [series]);

  const seriesCancelRatePct =
    totalsForSeries.ordersCame > 0
      ? Number(((totalsForSeries.cancelledOrders / totalsForSeries.ordersCame) * 100).toFixed(1))
      : 0;

  // Chart Geometry
  const svgWidth = 840;
  const svgHeight = 300;
  const padLeft = 64;
  const padRight = 24;
  const padTop = 28;
  const padBottom = 52;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const rawMaxVal = useMemo(() => {
    if (!series.length) return 0;
    return Math.max(
      ...series.map((b) =>
        metricView === 'volume'
          ? Math.max(b.ordersCame, b.cancelledOrders)
          : Math.max(b.netRevenueInr, b.cancelledValueInr)
      )
    );
  }, [series, metricView]);

  const yAxisMax = useMemo(
    () =>
      metricView === 'volume'
        ? getNiceIntegerAxisMax(rawMaxVal)
        : getNiceCurrencyAxisMax(rawMaxVal),
    [rawMaxVal, metricView]
  );

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    ratio,
    value: yAxisMax * ratio,
    y: padTop + plotHeight * (1 - ratio),
  }));

  const slotWidth = series.length > 0 ? plotWidth / series.length : plotWidth;
  const pairGap = Math.max(4, Math.min(8, slotWidth * 0.08));
  const barWidth = Math.max(10, Math.min(26, (slotWidth * 0.68 - pairGap) / 2));

  // Donut Ring Calculations
  const donutRadius = 56;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const allTimeSummary = summaryCards[3];

  const handleExportPeriodReport = () => {
    const scopeSuffix =
      granularity === 'monthly' && typeof monthlyScope === 'number'
        ? `_${monthlyScope}`
        : '';
    onExportCSV(
      `dorasani_${granularity}${scopeSuffix}_orders_report`,
      series.map((b) => ({
        period: b.label,
        date_range: b.rangeLabel,
        orders_came: b.ordersCame,
        delivered_orders: b.deliveredOrders,
        in_progress_orders: b.inProgressOrders,
        cancelled_orders: b.cancelledOrders,
        returned_refunded_orders: b.returnedOrders,
        cancellation_rate_pct: b.cancelRatePct,
        fulfillment_rate_pct: b.fulfillmentRatePct,
        net_revenue_inr: Math.round(b.netRevenueInr),
        cancelled_value_inr: Math.round(b.cancelledValueInr),
        returned_value_inr: Math.round(b.returnedValueInr),
        avg_order_value_inr: b.avgOrderValueInr,
        razorpay_online_orders: b.onlineOrders,
        cod_orders: b.codOrders,
      }))
    );
  };

  return (
    <section aria-labelledby="analytics-section-heading" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#285A3C]">
              <BarChart3 className="w-4 h-4 text-[#C29336]" aria-hidden="true" />
              <span>Order Flow &amp; Cancellation Intelligence</span>
            </div>
            <h2
              id="analytics-section-heading"
              className="font-golden text-xl font-bold text-[#1A3B2B]"
            >
              Weekly, Monthly &amp; Yearly Order Analytics
            </h2>
            <p className="text-xs text-[#647268]">
              Live visualization of incoming orders, cancellations, fulfillment status, and net revenue grouped by Indian Standard Time (IST).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onJumpToOrders && (
              <>
                <button
                  type="button"
                  onClick={() => onJumpToOrders('cancelled')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-800 hover:bg-rose-100"
                >
                  <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Cancelled Orders ({allTimeSummary?.cancelledOrders ?? 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => onJumpToOrders('all')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] text-xs font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0]/40"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#285A3C]" aria-hidden="true" />
                  <span>All Orders ({allTimeSummary?.ordersCame ?? 0})</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 1. 4 Period Comparison KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const targetGranularity: AnalyticsGranularity | null =
              card.id === 'week'
                ? 'weekly'
                : card.id === 'month'
                ? 'monthly'
                : card.id === 'year'
                ? 'yearly'
                : null;
            const isMatchingPeriod =
              targetGranularity !== null && granularity === targetGranularity;

            return (
              <div
                key={card.id}
                className={`p-4 rounded-2xl border transition-colors flex flex-col justify-between gap-3 ${
                  isMatchingPeriod
                    ? 'bg-[#FAF5EE] border-[#285A3C]/50'
                    : 'bg-[#FAF5EE]/60 border-[#D8C7B5]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#647268] block">
                      {card.title}
                    </span>
                    <span className="text-[11px] text-[#647268] block">{card.subtitle}</span>
                  </div>
                  {targetGranularity && (
                    <button
                      type="button"
                      onClick={() => {
                        setGranularity(targetGranularity);
                        setSelectedBucketKey(null);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        isMatchingPeriod
                          ? 'bg-[#285A3C] text-white'
                          : 'bg-white border border-[#D8C7B5] text-[#285A3C] hover:bg-[#D0E9C0]/40'
                      }`}
                    >
                      {isMatchingPeriod ? 'Active' : 'Chart'}
                    </button>
                  )}
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="font-golden text-2xl font-bold text-[#1A3B2B] leading-none">
                      {card.ordersCame}
                    </div>
                    <span className="text-[11px] font-medium text-[#4F6355]">
                      Orders Came
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        card.cancelledOrders > 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <span>{card.cancelledOrders} Cancelled</span>
                    </span>
                    <span className="block text-[10px] text-[#647268] mt-1">
                      {card.cancelRatePct}% cancel rate
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#E8DCCF] flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#285A3C]">
                    Net: {formatInr(card.netRevenueInr)}
                  </span>
                  {card.ordersDelta !== null ? (
                    <span className="text-[#647268]">
                      {card.ordersDelta >= 0 ? `+${card.ordersDelta}` : card.ordersDelta} vs prev
                    </span>
                  ) : (
                    <span className="text-[#647268]">
                      AOV: {formatInr(card.avgOrderValueInr)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Primary Interactive Chart Card */}
        <figure className="rounded-2xl border border-[#D8C7B5] bg-[#FAF5EE]/40 p-4 sm:p-5 space-y-4">
          {/* Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div
                role="group"
                aria-label="Time period granularity"
                className="inline-flex rounded-xl border border-[#D8C7B5] bg-white p-1 gap-1"
              >
                {(
                  [
                    { id: 'weekly', label: 'Weekly (12W)' },
                    { id: 'monthly', label: 'Monthly' },
                    { id: 'yearly', label: 'Yearly' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={granularity === item.id}
                    onClick={() => {
                      setGranularity(item.id);
                      setSelectedBucketKey(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      granularity === item.id
                        ? 'bg-[#285A3C] text-white shadow-xs'
                        : 'text-[#4F6355] hover:bg-[#FAF5EE]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {granularity === 'monthly' && (
                <div className="inline-flex items-center gap-1.5 bg-white border border-[#D8C7B5] rounded-xl px-2.5 py-1">
                  <Calendar className="w-3.5 h-3.5 text-[#647268]" aria-hidden="true" />
                  <label htmlFor="analytics-month-scope" className="text-[11px] font-semibold text-[#647268]">
                    Range:
                  </label>
                  <select
                    id="analytics-month-scope"
                    value={String(monthlyScope)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMonthlyScope(val === 'rolling_12' ? 'rolling_12' : Number(val));
                      setSelectedBucketKey(null);
                    }}
                    className="text-xs font-semibold text-[#1A3B2B] bg-transparent focus:outline-none py-0.5"
                  >
                    <option value="rolling_12">Last 12 Months</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={String(yr)}>
                        Calendar Year {yr}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Metric Mode Toggle */}
            <div
              role="group"
              aria-label="Chart metric view"
              className="inline-flex rounded-xl border border-[#D8C7B5] bg-white p-1 gap-1"
            >
              <button
                type="button"
                aria-pressed={metricView === 'volume'}
                onClick={() => setMetricView('volume')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  metricView === 'volume'
                    ? 'bg-[#1A3B2B] text-white shadow-xs'
                    : 'text-[#4F6355] hover:bg-[#FAF5EE]'
                }`}
              >
                Orders Came vs Cancelled
              </button>
              <button
                type="button"
                aria-pressed={metricView === 'revenue'}
                onClick={() => setMetricView('revenue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  metricView === 'revenue'
                    ? 'bg-[#1A3B2B] text-white shadow-xs'
                    : 'text-[#4F6355] hover:bg-[#FAF5EE]'
                }`}
              >
                Revenue vs Cancelled (₹)
              </button>
            </div>
          </div>

          {/* Chart Legend + Zero State Notice */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-[#E8DCCF] px-3.5 py-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#1A3B2B]">
                <span className="w-3 h-3 rounded-xs bg-[#285A3C] inline-block" aria-hidden="true" />
                {metricView === 'volume' ? 'Orders Came (Total Received)' : 'Net Revenue (₹)'}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-rose-800">
                <span className="w-3 h-3 rounded-xs bg-[#E11D48] inline-block" aria-hidden="true" />
                {metricView === 'volume' ? 'Orders Cancelled' : 'Cancelled Order Value (₹)'}
              </span>
            </div>
            <span className="text-[11px] text-[#647268]">
              {orders.length === 0
                ? '0 live orders recorded yet — chart scales update automatically as orders arrive'
                : `Period Total: ${totalsForSeries.ordersCame} Orders • ${totalsForSeries.cancelledOrders} Cancelled (${seriesCancelRatePct}%)`}
            </span>
          </div>

          {/* Inspected Period Live Banner */}
          {activeBucket && (
            <div className="bg-white rounded-xl border border-[#D8C7B5] p-3.5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              <div className="col-span-2 sm:col-span-4 lg:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#285A3C] block">
                  Selected {granularity} window
                </span>
                <span className="font-bold text-sm text-[#1A3B2B] block">
                  {activeBucket.label}
                </span>
                <span className="text-[11px] text-[#647268]">{activeBucket.rangeLabel}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#647268] block">
                  Orders Came
                </span>
                <span className="font-bold text-sm text-[#1A3B2B]">{activeBucket.ordersCame}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#647268] block">
                  Cancelled
                </span>
                <span className="font-bold text-sm text-rose-700">
                  {activeBucket.cancelledOrders} ({activeBucket.cancelRatePct}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#647268] block">
                  Delivered
                </span>
                <span className="font-bold text-sm text-emerald-800">
                  {activeBucket.deliveredOrders}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#647268] block">
                  Net Revenue
                </span>
                <span className="font-bold text-sm text-[#285A3C]">
                  {formatInr(activeBucket.netRevenueInr)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#647268] block">
                  Cancelled Value
                </span>
                <span className="font-bold text-sm text-rose-700">
                  {formatInr(activeBucket.cancelledValueInr)}
                </span>
              </div>
            </div>
          )}

          {/* Responsive Grouped SVG Bar Chart */}
          <div className="bg-white rounded-xl border border-[#E8DCCF] p-3 overflow-x-auto">
            <svg
              role="img"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full min-w-[620px] h-auto select-none"
            >
              <title>
                {`${granularity} ${
                  metricView === 'volume'
                    ? 'orders came versus orders cancelled'
                    : 'net revenue versus cancelled order value'
                } chart`}
              </title>

              {/* Horizontal Gridlines & Y-Axis Labels */}
              {yTicks.map((tick) => (
                <g key={tick.ratio}>
                  <line
                    x1={padLeft}
                    y1={tick.y}
                    x2={svgWidth - padRight}
                    y2={tick.y}
                    stroke={tick.ratio === 0 ? '#C7B6A3' : '#EFE7DC'}
                    strokeWidth={tick.ratio === 0 ? 1.5 : 1}
                    strokeDasharray={tick.ratio === 0 ? undefined : '4 4'}
                  />
                  <text
                    x={padLeft - 10}
                    y={tick.y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#647268"
                    fontFamily="inherit"
                  >
                    {metricView === 'volume'
                      ? Math.round(tick.value)
                      : formatCompactInr(tick.value)}
                  </text>
                </g>
              ))}

              {/* Grouped Bars per Period */}
              {series.map((bucket, idx) => {
                const slotX = padLeft + idx * slotWidth;
                const centerX = slotX + slotWidth / 2;
                const primaryVal =
                  metricView === 'volume' ? bucket.ordersCame : bucket.netRevenueInr;
                const cancelVal =
                  metricView === 'volume' ? bucket.cancelledOrders : bucket.cancelledValueInr;

                const primaryH =
                  yAxisMax > 0 ? Math.max(0, (primaryVal / yAxisMax) * plotHeight) : 0;
                const cancelH =
                  yAxisMax > 0 ? Math.max(0, (cancelVal / yAxisMax) * plotHeight) : 0;

                const renderPrimaryH = primaryVal > 0 ? Math.max(4, primaryH) : 3;
                const renderCancelH = cancelVal > 0 ? Math.max(4, cancelH) : 3;

                const groupWidth = barWidth * 2 + pairGap;
                const bar1X = centerX - groupWidth / 2;
                const bar2X = bar1X + barWidth + pairGap;
                const baselineY = padTop + plotHeight;
                const isSelected = activeBucket?.key === bucket.key;

                return (
                  <g
                    key={bucket.key}
                    onMouseEnter={() => setSelectedBucketKey(bucket.key)}
                    onClick={() => setSelectedBucketKey(bucket.key)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Active Highlight Backdrop */}
                    <rect
                      x={slotX + 3}
                      y={padTop - 6}
                      width={Math.max(10, slotWidth - 6)}
                      height={plotHeight + 10}
                      rx={8}
                      fill={isSelected ? '#FAF5EE' : 'transparent'}
                      stroke={isSelected ? '#D8C7B5' : 'transparent'}
                      strokeWidth={1}
                    />

                    {/* Bar 1: Orders Came / Net Revenue */}
                    <rect
                      x={bar1X}
                      y={baselineY - renderPrimaryH}
                      width={barWidth}
                      height={renderPrimaryH}
                      rx={4}
                      fill={primaryVal > 0 ? '#285A3C' : '#D0E9C0'}
                      opacity={primaryVal > 0 ? 1 : 0.7}
                    />

                    {/* Bar 2: Orders Cancelled / Cancelled Value */}
                    <rect
                      x={bar2X}
                      y={baselineY - renderCancelH}
                      width={barWidth}
                      height={renderCancelH}
                      rx={4}
                      fill={cancelVal > 0 ? '#E11D48' : '#FECDD3'}
                      opacity={cancelVal > 0 ? 1 : 0.65}
                    />

                    {/* Data Labels on Non-Zero Bars */}
                    {primaryVal > 0 && (
                      <text
                        x={bar1X + barWidth / 2}
                        y={baselineY - renderPrimaryH - 5}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill="#1A3B2B"
                      >
                        {metricView === 'volume' ? primaryVal : formatCompactInr(primaryVal)}
                      </text>
                    )}

                    {cancelVal > 0 && (
                      <text
                        x={bar2X + barWidth / 2}
                        y={baselineY - renderCancelH - 5}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill="#BE123C"
                      >
                        {metricView === 'volume' ? cancelVal : formatCompactInr(cancelVal)}
                      </text>
                    )}

                    {/* X-Axis Tick Label */}
                    <text
                      x={centerX}
                      y={baselineY + 18}
                      textAnchor="middle"
                      fontSize="10.5"
                      fontWeight={bucket.isCurrent || isSelected ? '700' : '500'}
                      fill={bucket.isCurrent || isSelected ? '#1A3B2B' : '#647268'}
                    >
                      {bucket.shortLabel}
                    </text>

                    {bucket.isCurrent && (
                      <text
                        x={centerX}
                        y={baselineY + 32}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill="#285A3C"
                      >
                        CURRENT
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Keyboard-Accessible Quick Period Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#647268] mr-1">
              Inspect period:
            </span>
            {series.map((b) => {
              const selected = activeBucket?.key === b.key;
              return (
                <button
                  key={b.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedBucketKey(b.key)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    selected
                      ? 'bg-[#285A3C] text-white'
                      : 'bg-white border border-[#E8DCCF] text-[#4F6355] hover:bg-[#FAF5EE]'
                  }`}
                >
                  {b.shortLabel.replace('*', '')} ({b.ordersCame}/{b.cancelledOrders})
                </button>
              );
            })}
          </div>

          <figcaption className="text-[11px] text-[#647268]">
            {`Displayed ${granularity} series summary: ${totalsForSeries.ordersCame} orders came, ${totalsForSeries.deliveredOrders} delivered, ${totalsForSeries.cancelledOrders} cancelled (${seriesCancelRatePct}% cancel rate), and ${formatInr(totalsForSeries.netRevenueInr)} net revenue.`}
          </figcaption>
        </figure>
      </div>

      {/* 3. Secondary Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: Order Lifecycle & Cancellation Donut */}
        <figure className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">
                Order Status &amp; Cancellation Mix
              </h3>
              <p className="text-xs text-[#647268]">
                Fulfillment funnel across all {breakdown.totalOrders} received orders
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                (allTimeSummary?.cancelRatePct ?? 0) > 15
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-[#FAF5EE] border border-[#D8C7B5] text-[#1A3B2B]'
              }`}
            >
              {allTimeSummary?.cancelRatePct ?? 0}% Cancel Rate
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* SVG Donut Ring */}
            <div className="shrink-0">
              <svg
                role="img"
                width="156"
                height="156"
                viewBox="0 0 156 156"
                className="overflow-visible"
              >
                <title>
                  Order lifecycle donut chart showing delivered, in-transit, cancelled, and returned proportions
                </title>
                <circle
                  cx="78"
                  cy="78"
                  r={donutRadius}
                  fill="none"
                  stroke="#EFE7DC"
                  strokeWidth="22"
                />
                {(() => {
                  if (breakdown.totalOrders === 0) return null;
                  let accumulatedRatio = 0;
                  return breakdown.statusSegments
                    .filter((seg) => seg.count > 0)
                    .map((seg) => {
                      const ratio = seg.count / breakdown.totalOrders;
                      const dashLength = ratio * donutCircumference;
                      const dashOffset = -accumulatedRatio * donutCircumference;
                      accumulatedRatio += ratio;
                      return (
                        <circle
                          key={seg.key}
                          cx="78"
                          cy="78"
                          r={donutRadius}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="22"
                          strokeDasharray={`${dashLength} ${donutCircumference - dashLength}`}
                          strokeDashoffset={dashOffset}
                          transform="rotate(-90 78 78)"
                        />
                      );
                    });
                })()}
                <text
                  x="78"
                  y="73"
                  textAnchor="middle"
                  fontSize="24"
                  fontWeight="700"
                  fill="#1A3B2B"
                >
                  {breakdown.totalOrders}
                </text>
                <text
                  x="78"
                  y="91"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="#647268"
                >
                  TOTAL ORDERS
                </text>
              </svg>
            </div>

            {/* Status Progress Rows */}
            <div className="flex-1 w-full space-y-3">
              {breakdown.statusSegments.map((seg) => (
                <div key={seg.key} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-2 font-semibold text-[#1A3B2B]">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: seg.color }}
                        aria-hidden="true"
                      />
                      <span>{seg.label}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${seg.textClass}`}>
                        {seg.count} ({seg.percent}%)
                      </span>
                      {onJumpToOrders && (
                        <button
                          type="button"
                          onClick={() => onJumpToOrders(seg.statusFilter)}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold text-[#285A3C] hover:bg-[#FAF5EE] hover:underline"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${seg.trackBg}`}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${seg.count > 0 ? Math.max(4, seg.percent) : 0}%`,
                        backgroundColor: seg.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <figcaption className="text-[11px] text-[#647268] pt-2 border-t border-[#EFE7DC]">
            {breakdown.statusSegments
              .map((s) => `${s.label}: ${s.count} (${s.percent}%)`)
              .join(' • ')}
          </figcaption>
        </figure>

        {/* Card B: Payment Methods, Catalog Stock Health & Top Products */}
        <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
          <div>
            <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">
              Payment Channels, Stock Health &amp; Top Sarees
            </h3>
            <p className="text-xs text-[#647268]">
              Razorpay vs COD order split, low/out-of-stock readiness (&lt; {LOW_STOCK_THRESHOLD} units), and best-moving SKUs
            </p>
          </div>

          {/* Payment Split */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1A3B2B]">
              <span className="inline-flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#C29336]" aria-hidden="true" />
                <span>Payment Method Mix</span>
              </span>
              <span className="text-[11px] text-[#647268]">
                {breakdown.totalOrders} total orders
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#EFE7DC] overflow-hidden flex">
              {breakdown.paymentChannels.map((ch, idx) => (
                <div
                  key={ch.key}
                  style={{
                    width: `${ch.sharePct}%`,
                    backgroundColor: idx === 0 ? '#285A3C' : '#C29336',
                  }}
                  title={`${ch.label}: ${ch.ordersCame} orders (${ch.sharePct}%)`}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {breakdown.paymentChannels.map((ch, idx) => (
                <div
                  key={ch.key}
                  className="p-3 rounded-xl border border-[#E8DCCF] bg-[#FAF5EE]/60 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#1A3B2B]">
                      <span
                        className="w-2.5 h-2.5 rounded-xs inline-block"
                        style={{ backgroundColor: idx === 0 ? '#285A3C' : '#C29336' }}
                        aria-hidden="true"
                      />
                      <span>{ch.label}</span>
                    </span>
                    <span className="font-bold text-[#285A3C]">{ch.sharePct}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#4F6355]">
                    <span>
                      {ch.ordersCame} orders • {ch.cancelledOrders} cancelled
                    </span>
                    <span className="font-semibold text-[#1A3B2B]">
                      {formatInr(ch.netRevenueInr)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Catalog Stock Health */}
          <div className="pt-3 border-t border-[#EFE7DC] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#1A3B2B]">
                <Package className="w-3.5 h-3.5 text-[#285A3C]" aria-hidden="true" />
                <span>Live Catalog Stock Health ({breakdown.stockHealth.totalInventoryUnits} units across {breakdown.stockHealth.totalProducts} SKUs)</span>
              </span>
              {onJumpToInventory && (
                <button
                  type="button"
                  onClick={onJumpToInventory}
                  className="text-[11px] font-semibold text-[#285A3C] hover:underline shrink-0"
                >
                  Manage Inventory →
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="block font-golden text-lg font-bold text-emerald-800">
                  {breakdown.stockHealth.healthyProducts}
                </span>
                <span className="text-[10px] font-semibold text-emerald-900">
                  Healthy ({LOW_STOCK_THRESHOLD}+ qty)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="block font-golden text-lg font-bold text-amber-800">
                  {breakdown.stockHealth.lowStockProducts}
                </span>
                <span className="text-[10px] font-semibold text-amber-900">
                  Low Stock (&lt; {LOW_STOCK_THRESHOLD})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <span className="block font-golden text-lg font-bold text-rose-800">
                  {breakdown.stockHealth.outOfStockProducts}
                </span>
                <span className="text-[10px] font-semibold text-rose-900">
                  Out of Stock (0)
                </span>
              </div>
            </div>

            {breakdown.stockHealth.lowStockItems.length > 0 && (
              <div className="text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200 rounded-xl px-3 py-2">
                <span className="font-bold">Restock Needed: </span>
                {breakdown.stockHealth.lowStockItems
                  .slice(0, 3)
                  .map(
                    (item) =>
                      `${item.title} (${item.stockQuantity} left, ${item.shortageUnits} short of ${LOW_STOCK_THRESHOLD})`
                  )
                  .join(' • ')}
              </div>
            )}
          </div>

          {/* Top Products Ordered vs Cancelled */}
          <div className="pt-3 border-t border-[#EFE7DC] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1A3B2B]">
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#C29336]" aria-hidden="true" />
                <span>Top Ordered Handloom Pieces</span>
              </span>
              <span className="text-[11px] text-[#647268]">Units Ordered / Cancelled</span>
            </div>

            {breakdown.topProducts.length === 0 ? (
              <p className="text-xs text-[#647268] bg-[#FAF5EE]/70 border border-[#E8DCCF] rounded-xl px-3 py-3 text-center">
                Top ordered &amp; cancelled products will appear automatically once orders are placed.
              </p>
            ) : (
              <ul className="divide-y divide-[#EFE7DC] text-xs">
                {breakdown.topProducts.map((p) => (
                  <li key={p.key} className="py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-semibold text-[#1A3B2B] block truncate">
                        {p.title}
                      </span>
                      {p.sku && (
                        <span className="text-[10px] font-mono text-[#647268]">{p.sku}</span>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-bold text-[#285A3C] block">
                        {p.unitsOrdered} ordered
                        {p.unitsCancelled > 0 ? (
                          <span className="text-rose-700 font-semibold">
                            {' '}
                            • {p.unitsCancelled} cancelled
                          </span>
                        ) : null}
                      </span>
                      <span className="text-[10px] text-[#647268]">
                        {formatInr(p.revenueInr)} net
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* 4. Accessible Period Breakdown Table (Accessible Alternative + CSV Export) */}
      <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-golden text-lg font-bold text-[#1A3B2B] capitalize">
              {granularity} Orders &amp; Cancellation Breakdown Table
            </h3>
            <p className="text-xs text-[#647268]">
              Exact period figures backing the chart above — exportable directly as CSV
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportPeriodReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="capitalize">Export {granularity} Report (CSV)</span>
          </button>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-labelledby="analytics-period-table-caption"
          className="admin-table-wrapper"
        >
          <table
            className="admin-responsive-table w-full text-left text-xs"
            style={
              {
                '--label-2': '"Orders Came"',
                '--label-3': '"Delivered"',
                '--label-4': '"In Progress"',
                '--label-5': '"Cancelled"',
                '--label-6': '"Returned"',
                '--label-7': '"Cancel Rate"',
                '--label-8': '"Net Revenue"',
                '--label-9': '"Cancelled Value"',
              } as React.CSSProperties
            }
          >
            <caption id="analytics-period-table-caption" className="sr-only">
              {granularity} order intake, cancellations, returns, and revenue report table
            </caption>
            <thead>
              <tr className="text-[#647268]">
                <th scope="col" className="p-2.5 font-semibold">
                  Period (IST)
                </th>
                <th scope="col" className="p-2.5 font-semibold text-right">
                  Orders Came
                </th>
                <th scope="col" className="p-2.5 font-semibold text-right">
                  Delivered
                </th>
                <th scope="col" className="p-2.5 font-semibold text-right">
                  In Progress
                </th>
                <th scope="col" className="p-2.5 font-semibold text-right">
                  Cancelled
                </th>
                <th scope="col" className="p-2.5 font-semibold text-right">
                  Returned
                </th>
                <th scope="col" className="p-2.5 font-semibold text-right">
                  Cancel Rate
                </th>
                <th scope="col" className="p-2.5 font-semibold text-right">
                  Net Revenue
                </th>
                <th scope="col" className="p-2.5 font-semibold text-right">
                  Cancelled Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCF]">
              {series.map((b) => {
                const isSelected = activeBucket?.key === b.key;
                return (
                  <tr
                    key={b.key}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-[#D0E9C0]/25'
                        : 'hover:bg-[#FAF5EE]/60'
                    }`}
                  >
                    <th scope="row" className="p-2.5 font-semibold text-[#1A3B2B]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setSelectedBucketKey(b.key)}
                          className="text-left font-semibold text-[#1A3B2B] hover:text-[#285A3C] hover:underline focus-visible:outline-2 focus-visible:outline-[#285A3C]"
                        >
                          {b.label}
                        </button>
                        {b.isCurrent && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#D0E9C0] text-[#1A3B2B]">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] font-normal text-[#647268]">
                        {b.rangeLabel}
                      </span>
                    </th>
                    <td className="p-2.5 font-bold text-[#1A3B2B] text-right">
                      {b.ordersCame}
                    </td>
                    <td className="p-2.5 font-semibold text-emerald-800 text-right">
                      <span className="inline-flex items-center gap-1 justify-end">
                        {b.deliveredOrders > 0 && (
                          <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span>{b.deliveredOrders}</span>
                      </span>
                    </td>
                    <td className="p-2.5 text-amber-800 font-semibold text-right">
                      <span className="inline-flex items-center gap-1 justify-end">
                        {b.inProgressOrders > 0 && (
                          <Clock className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span>{b.inProgressOrders}</span>
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-rose-700 text-right">
                      {b.cancelledOrders}
                    </td>
                    <td className="p-2.5 text-[#4F6355] font-semibold text-right">
                      <span className="inline-flex items-center gap-1 justify-end">
                        {b.returnedOrders > 0 && (
                          <RefreshCw className="w-3 h-3" aria-hidden="true" />
                        )}
                        <span>{b.returnedOrders}</span>
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.cancelRatePct > 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {b.cancelRatePct}%
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-[#285A3C] text-right">
                      {formatInr(b.netRevenueInr)}
                    </td>
                    <td className="p-2.5 font-semibold text-rose-700 text-right">
                      {formatInr(b.cancelledValueInr)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#FAF5EE] border-t-2 border-[#D8C7B5] font-bold text-[#1A3B2B]">
                <th scope="row" className="p-2.5 text-left">
                  Displayed Period Total
                </th>
                <td className="p-2.5 text-right">{totalsForSeries.ordersCame}</td>
                <td className="p-2.5 text-emerald-800 text-right">
                  {totalsForSeries.deliveredOrders}
                </td>
                <td className="p-2.5 text-amber-800 text-right">
                  {totalsForSeries.inProgressOrders}
                </td>
                <td className="p-2.5 text-rose-700 text-right">
                  {totalsForSeries.cancelledOrders}
                </td>
                <td className="p-2.5 text-[#4F6355] text-right">
                  {totalsForSeries.returnedOrders}
                </td>
                <td className="p-2.5 text-right">{seriesCancelRatePct}%</td>
                <td className="p-2.5 text-[#285A3C] text-right">
                  {formatInr(totalsForSeries.netRevenueInr)}
                </td>
                <td className="p-2.5 text-rose-700 text-right">
                  {formatInr(totalsForSeries.cancelledValueInr)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
};

interface OverviewAnalyticsPulseProps {
  orders: any[];
  onOpenFullReports: () => void;
  onJumpToOrders?: (statusFilter?: string) => void;
}

export const OverviewAnalyticsPulse: React.FC<OverviewAnalyticsPulseProps> = ({
  orders,
  onOpenFullReports,
  onJumpToOrders,
}) => {
  const [period, setPeriod] = useState<AnalyticsGranularity>('weekly');

  const summaryCards = useMemo(() => buildAnalyticsSummary(orders).slice(0, 3), [orders]);
  const series = useMemo(
    () =>
      buildPeriodSeries(orders, period, {
        weekCount: 8,
        monthlyScope: 'rolling_12',
      }),
    [orders, period]
  );

  const rawMax = useMemo(
    () => Math.max(0, ...series.map((b) => Math.max(b.ordersCame, b.cancelledOrders))),
    [series]
  );
  const yMax = useMemo(() => getNiceIntegerAxisMax(rawMax), [rawMax]);

  const width = 760;
  const height = 210;
  const padL = 42;
  const padR = 16;
  const padT = 22;
  const padB = 38;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const slotW = series.length > 0 ? plotW / series.length : plotW;
  const gap = Math.max(4, Math.min(8, slotW * 0.1));
  const barW = Math.max(8, Math.min(22, (slotW * 0.66 - gap) / 2));

  const totals = series.reduce(
    (acc, b) => {
      acc.came += b.ordersCame;
      acc.cancelled += b.cancelledOrders;
      acc.revenue += b.netRevenueInr;
      return acc;
    },
    { came: 0, cancelled: 0, revenue: 0 }
  );

  return (
    <section
      aria-labelledby="overview-pulse-heading"
      className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="overview-pulse-heading" className="font-golden text-lg font-bold text-[#1A3B2B]">
            Orders Came vs Cancelled Visual Pulse
          </h2>
          <p className="text-xs text-[#647268]">
            Quick Weekly, Monthly &amp; Yearly comparison of incoming vs cancelled orders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Overview timeframe"
            className="inline-flex rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] p-1 gap-1"
          >
            {(
              [
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'yearly', label: 'Yearly' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={period === opt.id}
                onClick={() => setPeriod(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  period === opt.id
                    ? 'bg-[#285A3C] text-white shadow-xs'
                    : 'text-[#4F6355] hover:bg-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenFullReports}
            className="px-3 py-1.5 rounded-xl bg-[#D0E9C0]/50 border border-[#BCD8AA] text-xs font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0]"
          >
            Full Analytics &amp; Reports →
          </button>
        </div>
      </div>

      {/* Period Summary Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {summaryCards.map((c) => {
          const cardPeriod: AnalyticsGranularity =
            c.id === 'week' ? 'weekly' : c.id === 'month' ? 'monthly' : 'yearly';
          const active = period === cardPeriod;
          return (
            <div
              key={c.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                active
                  ? 'bg-[#FAF5EE] border-[#285A3C]/50'
                  : 'bg-[#FAF5EE]/50 border-[#E8DCCF]'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#647268] block">
                  {c.title}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-golden text-xl font-bold text-[#1A3B2B]">
                    {c.ordersCame}
                  </span>
                  <span className="text-[11px] font-semibold text-[#4F6355]">came</span>
                  <span className="text-[11px] font-bold text-rose-700">
                    • {c.cancelledOrders} cancelled ({c.cancelRatePct}%)
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#285A3C] block mt-0.5">
                  Net Revenue: {formatInr(c.netRevenueInr)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPeriod(cardPeriod)}
                className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${
                  active
                    ? 'bg-[#285A3C] text-white'
                    : 'bg-white border border-[#D8C7B5] text-[#285A3C] hover:bg-[#D0E9C0]/40'
                }`}
              >
                {active ? 'Showing' : 'View Chart'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Compact SVG Chart */}
      <figure className="rounded-xl border border-[#E8DCCF] bg-[#FAF5EE]/30 p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#1A3B2B]">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#285A3C] inline-block" aria-hidden="true" />
              Orders Came
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-rose-800">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#E11D48] inline-block" aria-hidden="true" />
              Orders Cancelled
            </span>
          </div>
          {onJumpToOrders && totals.cancelled > 0 && (
            <button
              type="button"
              onClick={() => onJumpToOrders('cancelled')}
              className="text-[11px] font-semibold text-rose-700 hover:underline"
            >
              Inspect {totals.cancelled} Cancelled Orders →
            </button>
          )}
        </div>

        <div className="overflow-x-auto bg-white rounded-lg border border-[#E8DCCF] p-2">
          <svg
            role="img"
            viewBox={`0 0 ${width} ${height}`}
            className="w-full min-w-[540px] h-auto select-none"
          >
            <title>
              {`Overview ${period} orders came versus cancelled chart`}
            </title>

            {[0, 0.25, 0.5, 0.75, 1].map((r) => {
              const y = padT + plotH * (1 - r);
              return (
                <g key={r}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={width - padR}
                    y2={y}
                    stroke={r === 0 ? '#C7B6A3' : '#EFE7DC'}
                    strokeWidth={r === 0 ? 1.5 : 1}
                    strokeDasharray={r === 0 ? undefined : '3 3'}
                  />
                  <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#647268">
                    {Math.round(yMax * r)}
                  </text>
                </g>
              );
            })}

            {series.map((b, i) => {
              const centerX = padL + i * slotW + slotW / 2;
              const baseY = padT + plotH;
              const h1 = b.ordersCame > 0 ? Math.max(4, (b.ordersCame / yMax) * plotH) : 3;
              const h2 = b.cancelledOrders > 0 ? Math.max(4, (b.cancelledOrders / yMax) * plotH) : 3;
              const x1 = centerX - (barW * 2 + gap) / 2;
              const x2 = x1 + barW + gap;
              return (
                <g key={b.key}>
                  <rect
                    x={x1}
                    y={baseY - h1}
                    width={barW}
                    height={h1}
                    rx={3}
                    fill={b.ordersCame > 0 ? '#285A3C' : '#D0E9C0'}
                  />
                  <rect
                    x={x2}
                    y={baseY - h2}
                    width={barW}
                    height={h2}
                    rx={3}
                    fill={b.cancelledOrders > 0 ? '#E11D48' : '#FECDD3'}
                  />
                  {b.ordersCame > 0 && (
                    <text
                      x={x1 + barW / 2}
                      y={baseY - h1 - 4}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#1A3B2B"
                    >
                      {b.ordersCame}
                    </text>
                  )}
                  {b.cancelledOrders > 0 && (
                    <text
                      x={x2 + barW / 2}
                      y={baseY - h2 - 4}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#BE123C"
                    >
                      {b.cancelledOrders}
                    </text>
                  )}
                  <text
                    x={centerX}
                    y={baseY + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight={b.isCurrent ? '700' : '500'}
                    fill={b.isCurrent ? '#1A3B2B' : '#647268'}
                  >
                    {b.shortLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <figcaption className="text-[11px] text-[#647268] px-1">
          {`${period.charAt(0).toUpperCase() + period.slice(1)} window total: ${totals.came} orders came, ${totals.cancelled} cancelled, ${formatInr(totals.revenue)} net revenue.`}
        </figcaption>
      </figure>
    </section>
  );
};
