import { LOW_STOCK_THRESHOLD } from '../types';

export type AnalyticsGranularity = 'weekly' | 'monthly' | 'yearly';
export type AnalyticsMetricView = 'volume' | 'revenue';

export interface AnalyticsBucket {
  key: string;
  label: string;
  shortLabel: string;
  rangeLabel: string;
  isCurrent: boolean;
  ordersCame: number;
  deliveredOrders: number;
  inProgressOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  cancelRatePct: number;
  fulfillmentRatePct: number;
  grossValueInr: number;
  netRevenueInr: number;
  cancelledValueInr: number;
  returnedValueInr: number;
  avgOrderValueInr: number;
  codOrders: number;
  onlineOrders: number;
}

export interface PeriodSummaryCard {
  id: 'week' | 'month' | 'year' | 'all_time';
  title: string;
  subtitle: string;
  ordersCame: number;
  cancelledOrders: number;
  deliveredOrders: number;
  inProgressOrders: number;
  returnedOrders: number;
  cancelRatePct: number;
  netRevenueInr: number;
  cancelledValueInr: number;
  avgOrderValueInr: number;
  previousOrdersCame: number | null;
  previousCancelledOrders: number | null;
  ordersDelta: number | null;
}

export interface StatusSegment {
  key: 'delivered' | 'in_progress' | 'cancelled' | 'returned';
  label: string;
  count: number;
  percent: number;
  color: string;
  trackBg: string;
  textClass: string;
  statusFilter: string;
}

export interface PaymentChannelStat {
  key: 'online' | 'cod';
  label: string;
  ordersCame: number;
  cancelledOrders: number;
  paidOrders: number;
  netRevenueInr: number;
  sharePct: number;
}

export interface TopOrderedProductStat {
  key: string;
  title: string;
  sku: string;
  unitsOrdered: number;
  unitsCancelled: number;
  netUnits: number;
  revenueInr: number;
}

export interface StockHealthSummary {
  totalProducts: number;
  activeProducts: number;
  healthyProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  draftOrArchivedProducts: number;
  totalInventoryUnits: number;
  lowStockItems: Array<{
    id: string;
    title: string;
    sku: string;
    stockQuantity: number;
    shortageUnits: number;
  }>;
  outOfStockItems: Array<{
    id: string;
    title: string;
    sku: string;
  }>;
}

export interface AnalyticsBreakdown {
  totalOrders: number;
  statusSegments: StatusSegment[];
  paymentChannels: PaymentChannelStat[];
  topProducts: TopOrderedProductStat[];
  stockHealth: StockHealthSummary;
}

const IST_TIMEZONE = 'Asia/Kolkata';

const istDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: IST_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTH_LONG_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface ISTDateParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  isoDate: string; // YYYY-MM-DD in IST
  utcDayMs: number;
  weekdaySun0: number; // 0 = Sunday .. 6 = Saturday
  weekMondayKey: string; // YYYY-MM-DD of Monday in IST
  monthKey: string; // YYYY-MM
  yearKey: string; // YYYY
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatUtcMsAsIsoDate(utcMs: number): string {
  const d = new Date(utcMs);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function formatDayMonthShort(utcMs: number): string {
  const d = new Date(utcMs);
  return `${d.getUTCDate()} ${MONTH_SHORT_NAMES[d.getUTCMonth()]}`;
}

export function toISTDateParts(input: Date | string | null | undefined): ISTDateParts | null {
  if (!input) return null;
  const dateObj = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(dateObj.getTime())) return null;

  const formatted = istDateFormatter.format(dateObj); // YYYY-MM-DD in IST
  const parts = formatted.split('-');
  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return null;

  const utcDayMs = Date.UTC(year, month - 1, day);
  const weekdaySun0 = new Date(utcDayMs).getUTCDay();
  const offsetToMonday = weekdaySun0 === 0 ? -6 : 1 - weekdaySun0;
  const mondayMs = utcDayMs + offsetToMonday * 86_400_000;

  return {
    year,
    month,
    day,
    isoDate: formatted,
    utcDayMs,
    weekdaySun0,
    weekMondayKey: formatUtcMsAsIsoDate(mondayMs),
    monthKey: `${year}-${pad2(month)}`,
    yearKey: String(year),
  };
}

function createEmptyBucket(
  key: string,
  label: string,
  shortLabel: string,
  rangeLabel: string,
  isCurrent: boolean
): AnalyticsBucket {
  return {
    key,
    label,
    shortLabel,
    rangeLabel,
    isCurrent,
    ordersCame: 0,
    deliveredOrders: 0,
    inProgressOrders: 0,
    cancelledOrders: 0,
    returnedOrders: 0,
    cancelRatePct: 0,
    fulfillmentRatePct: 0,
    grossValueInr: 0,
    netRevenueInr: 0,
    cancelledValueInr: 0,
    returnedValueInr: 0,
    avgOrderValueInr: 0,
    codOrders: 0,
    onlineOrders: 0,
  };
}

function classifyOrderStatus(statusRaw: unknown): 'delivered' | 'cancelled' | 'returned' | 'in_progress' {
  const status = String(statusRaw || 'pending').toLowerCase().trim();
  if (status === 'delivered') return 'delivered';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'returned' || status === 'refunded') return 'returned';
  return 'in_progress';
}

function addOrderToBucket(bucket: AnalyticsBucket, order: any): void {
  const totalInr = Number(order?.total_inr || 0);
  const safeTotal = Number.isFinite(totalInr) ? totalInr : 0;
  const statusKind = classifyOrderStatus(order?.order_status);
  const method = String(order?.payment_method || '').toLowerCase().trim();

  bucket.ordersCame += 1;
  bucket.grossValueInr += safeTotal;

  if (method === 'cod') {
    bucket.codOrders += 1;
  } else {
    bucket.onlineOrders += 1;
  }

  if (statusKind === 'delivered') {
    bucket.deliveredOrders += 1;
    bucket.netRevenueInr += safeTotal;
  } else if (statusKind === 'cancelled') {
    bucket.cancelledOrders += 1;
    bucket.cancelledValueInr += safeTotal;
  } else if (statusKind === 'returned') {
    bucket.returnedOrders += 1;
    bucket.returnedValueInr += safeTotal;
    bucket.netRevenueInr += safeTotal;
  } else {
    bucket.inProgressOrders += 1;
    bucket.netRevenueInr += safeTotal;
  }
}

function finalizeBucketRates(bucket: AnalyticsBucket): AnalyticsBucket {
  const activeNonCancelled = bucket.ordersCame - bucket.cancelledOrders;
  bucket.cancelRatePct =
    bucket.ordersCame > 0
      ? Number(((bucket.cancelledOrders / bucket.ordersCame) * 100).toFixed(1))
      : 0;
  bucket.fulfillmentRatePct =
    bucket.ordersCame > 0
      ? Number(((bucket.deliveredOrders / bucket.ordersCame) * 100).toFixed(1))
      : 0;
  bucket.avgOrderValueInr =
    activeNonCancelled > 0 ? Math.round(bucket.netRevenueInr / activeNonCancelled) : 0;
  return bucket;
}

export function getAvailableOrderYears(orders: any[], referenceDate: Date = new Date()): number[] {
  const nowParts = toISTDateParts(referenceDate);
  const currentYear = nowParts ? nowParts.year : new Date().getFullYear();
  const years = new Set<number>([currentYear, currentYear - 1, currentYear - 2]);

  for (const order of orders || []) {
    const p = toISTDateParts(order?.created_at);
    if (p && p.year >= 2020 && p.year <= currentYear + 1) {
      years.add(p.year);
    }
  }

  return Array.from(years).sort((a, b) => b - a);
}

export function buildPeriodSeries(
  orders: any[],
  granularity: AnalyticsGranularity,
  options?: {
    weekCount?: number;
    monthlyScope?: 'rolling_12' | number;
    referenceDate?: Date;
  }
): AnalyticsBucket[] {
  const refDate = options?.referenceDate || new Date();
  const refParts = toISTDateParts(refDate) || {
    year: 2026,
    month: 11,
    day: 11,
    isoDate: '2026-11-11',
    utcDayMs: Date.UTC(2026, 10, 11),
    weekdaySun0: 3,
    weekMondayKey: '2026-11-09',
    monthKey: '2026-11',
    yearKey: '2026',
  };

  const buckets: AnalyticsBucket[] = [];
  const bucketMap = new Map<string, AnalyticsBucket>();

  if (granularity === 'weekly') {
    const weekCount = Math.max(4, options?.weekCount ?? 12);
    const [mYear, mMonth, mDay] = refParts.weekMondayKey.split('-').map(Number);
    const currentMondayMs = Date.UTC(mYear, mMonth - 1, mDay);

    for (let i = weekCount - 1; i >= 0; i--) {
      const startMs = currentMondayMs - i * 7 * 86_400_000;
      const endMs = startMs + 6 * 86_400_000;
      const key = formatUtcMsAsIsoDate(startMs);
      const startDate = new Date(startMs);
      const endDate = new Date(endMs);
      const startLabel = formatDayMonthShort(startMs);
      const endLabel = formatDayMonthShort(endMs);
      const yearSuffix =
        startDate.getUTCFullYear() === endDate.getUTCFullYear()
          ? String(endDate.getUTCFullYear())
          : `${startDate.getUTCFullYear()}/${endDate.getUTCFullYear()}`;
      const rangeLabel = `${startLabel} – ${endLabel} ${yearSuffix}`;
      const shortLabel = i === 0 ? `${startLabel}*` : startLabel;

      const bucket = createEmptyBucket(
        key,
        i === 0 ? `This Week (${startLabel} – ${endLabel})` : rangeLabel,
        shortLabel,
        rangeLabel,
        i === 0
      );
      buckets.push(bucket);
      bucketMap.set(key, bucket);
    }

    for (const order of orders || []) {
      const p = toISTDateParts(order?.created_at);
      if (!p) continue;
      const target = bucketMap.get(p.weekMondayKey);
      if (target) {
        addOrderToBucket(target, order);
      }
    }
  } else if (granularity === 'monthly') {
    const scope = options?.monthlyScope ?? 'rolling_12';

    if (typeof scope === 'number') {
      const selectedYear = scope;
      for (let m = 1; m <= 12; m++) {
        const key = `${selectedYear}-${pad2(m)}`;
        const shortName = MONTH_SHORT_NAMES[m - 1];
        const longName = MONTH_LONG_NAMES[m - 1];
        const isCurrent = selectedYear === refParts.year && m === refParts.month;
        const bucket = createEmptyBucket(
          key,
          `${longName} ${selectedYear}`,
          shortName,
          `${longName} ${selectedYear}`,
          isCurrent
        );
        buckets.push(bucket);
        bucketMap.set(key, bucket);
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const totalMonths = refParts.year * 12 + (refParts.month - 1) - i;
        const y = Math.floor(totalMonths / 12);
        const m = (totalMonths % 12) + 1;
        const key = `${y}-${pad2(m)}`;
        const shortName = `${MONTH_SHORT_NAMES[m - 1]} '${String(y).slice(-2)}`;
        const longName = `${MONTH_LONG_NAMES[m - 1]} ${y}`;
        const isCurrent = i === 0;
        const bucket = createEmptyBucket(key, longName, shortName, longName, isCurrent);
        buckets.push(bucket);
        bucketMap.set(key, bucket);
      }
    }

    for (const order of orders || []) {
      const p = toISTDateParts(order?.created_at);
      if (!p) continue;
      const target = bucketMap.get(p.monthKey);
      if (target) {
        addOrderToBucket(target, order);
      }
    }
  } else {
    let minYear = refParts.year - 2;
    let maxYear = refParts.year;

    for (const order of orders || []) {
      const p = toISTDateParts(order?.created_at);
      if (!p) continue;
      if (p.year < minYear) minYear = p.year;
      if (p.year > maxYear) maxYear = p.year;
    }

    for (let y = minYear; y <= maxYear; y++) {
      const key = String(y);
      const isCurrent = y === refParts.year;
      const bucket = createEmptyBucket(key, `Year ${key}`, key, `Jan – Dec ${key}`, isCurrent);
      buckets.push(bucket);
      bucketMap.set(key, bucket);
    }

    for (const order of orders || []) {
      const p = toISTDateParts(order?.created_at);
      if (!p) continue;
      const target = bucketMap.get(p.yearKey);
      if (target) {
        addOrderToBucket(target, order);
      }
    }
  }

  return buckets.map(finalizeBucketRates);
}

export function buildAnalyticsSummary(
  orders: any[],
  referenceDate: Date = new Date()
): PeriodSummaryCard[] {
  const refParts = toISTDateParts(referenceDate);
  const curYear = refParts ? refParts.year : 2026;
  const curMonth = refParts ? refParts.month : 11;
  const curWeekKey = refParts ? refParts.weekMondayKey : '2026-11-09';

  // Previous week key
  const [wmY, wmM, wmD] = curWeekKey.split('-').map(Number);
  const prevWeekKey = formatUtcMsAsIsoDate(Date.UTC(wmY, wmM - 1, wmD) - 7 * 86_400_000);

  // Previous month key
  const prevTotalMonths = curYear * 12 + (curMonth - 1) - 1;
  const prevMonthY = Math.floor(prevTotalMonths / 12);
  const prevMonthM = (prevTotalMonths % 12) + 1;
  const curMonthKey = `${curYear}-${pad2(curMonth)}`;
  const prevMonthKey = `${prevMonthY}-${pad2(prevMonthM)}`;

  const curYearKey = String(curYear);
  const prevYearKey = String(curYear - 1);

  const curWeekBucket = createEmptyBucket('curWeek', 'This Week', 'This Week', 'Current Week', true);
  const prevWeekBucket = createEmptyBucket('prevWeek', 'Last Week', 'Last Week', 'Previous Week', false);
  const curMonthBucket = createEmptyBucket('curMonth', 'This Month', 'This Month', 'Current Month', true);
  const prevMonthBucket = createEmptyBucket('prevMonth', 'Last Month', 'Last Month', 'Previous Month', false);
  const curYearBucket = createEmptyBucket('curYear', 'This Year', 'This Year', 'Current Year', true);
  const prevYearBucket = createEmptyBucket('prevYear', 'Last Year', 'Last Year', 'Previous Year', false);
  const allTimeBucket = createEmptyBucket('allTime', 'All Time', 'All Time', 'Cumulative', true);

  for (const order of orders || []) {
    addOrderToBucket(allTimeBucket, order);
    const p = toISTDateParts(order?.created_at);
    if (!p) continue;

    if (p.weekMondayKey === curWeekKey) addOrderToBucket(curWeekBucket, order);
    else if (p.weekMondayKey === prevWeekKey) addOrderToBucket(prevWeekBucket, order);

    if (p.monthKey === curMonthKey) addOrderToBucket(curMonthBucket, order);
    else if (p.monthKey === prevMonthKey) addOrderToBucket(prevMonthBucket, order);

    if (p.yearKey === curYearKey) addOrderToBucket(curYearBucket, order);
    else if (p.yearKey === prevYearKey) addOrderToBucket(prevYearBucket, order);
  }

  finalizeBucketRates(curWeekBucket);
  finalizeBucketRates(prevWeekBucket);
  finalizeBucketRates(curMonthBucket);
  finalizeBucketRates(prevMonthBucket);
  finalizeBucketRates(curYearBucket);
  finalizeBucketRates(prevYearBucket);
  finalizeBucketRates(allTimeBucket);

  const curWeekMondayMs = Date.UTC(wmY, wmM - 1, wmD);
  const curWeekEndMs = curWeekMondayMs + 6 * 86_400_000;

  return [
    {
      id: 'week',
      title: 'This Week (Mon–Sun)',
      subtitle: `${formatDayMonthShort(curWeekMondayMs)} – ${formatDayMonthShort(curWeekEndMs)}`,
      ordersCame: curWeekBucket.ordersCame,
      cancelledOrders: curWeekBucket.cancelledOrders,
      deliveredOrders: curWeekBucket.deliveredOrders,
      inProgressOrders: curWeekBucket.inProgressOrders,
      returnedOrders: curWeekBucket.returnedOrders,
      cancelRatePct: curWeekBucket.cancelRatePct,
      netRevenueInr: curWeekBucket.netRevenueInr,
      cancelledValueInr: curWeekBucket.cancelledValueInr,
      avgOrderValueInr: curWeekBucket.avgOrderValueInr,
      previousOrdersCame: prevWeekBucket.ordersCame,
      previousCancelledOrders: prevWeekBucket.cancelledOrders,
      ordersDelta: curWeekBucket.ordersCame - prevWeekBucket.ordersCame,
    },
    {
      id: 'month',
      title: 'This Month',
      subtitle: `${MONTH_LONG_NAMES[curMonth - 1]} ${curYear}`,
      ordersCame: curMonthBucket.ordersCame,
      cancelledOrders: curMonthBucket.cancelledOrders,
      deliveredOrders: curMonthBucket.deliveredOrders,
      inProgressOrders: curMonthBucket.inProgressOrders,
      returnedOrders: curMonthBucket.returnedOrders,
      cancelRatePct: curMonthBucket.cancelRatePct,
      netRevenueInr: curMonthBucket.netRevenueInr,
      cancelledValueInr: curMonthBucket.cancelledValueInr,
      avgOrderValueInr: curMonthBucket.avgOrderValueInr,
      previousOrdersCame: prevMonthBucket.ordersCame,
      previousCancelledOrders: prevMonthBucket.cancelledOrders,
      ordersDelta: curMonthBucket.ordersCame - prevMonthBucket.ordersCame,
    },
    {
      id: 'year',
      title: `This Year (${curYear})`,
      subtitle: `Jan – Dec ${curYear} (IST)`,
      ordersCame: curYearBucket.ordersCame,
      cancelledOrders: curYearBucket.cancelledOrders,
      deliveredOrders: curYearBucket.deliveredOrders,
      inProgressOrders: curYearBucket.inProgressOrders,
      returnedOrders: curYearBucket.returnedOrders,
      cancelRatePct: curYearBucket.cancelRatePct,
      netRevenueInr: curYearBucket.netRevenueInr,
      cancelledValueInr: curYearBucket.cancelledValueInr,
      avgOrderValueInr: curYearBucket.avgOrderValueInr,
      previousOrdersCame: prevYearBucket.ordersCame,
      previousCancelledOrders: prevYearBucket.cancelledOrders,
      ordersDelta: curYearBucket.ordersCame - prevYearBucket.ordersCame,
    },
    {
      id: 'all_time',
      title: 'All-Time Orders',
      subtitle: 'Total store performance',
      ordersCame: allTimeBucket.ordersCame,
      cancelledOrders: allTimeBucket.cancelledOrders,
      deliveredOrders: allTimeBucket.deliveredOrders,
      inProgressOrders: allTimeBucket.inProgressOrders,
      returnedOrders: allTimeBucket.returnedOrders,
      cancelRatePct: allTimeBucket.cancelRatePct,
      netRevenueInr: allTimeBucket.netRevenueInr,
      cancelledValueInr: allTimeBucket.cancelledValueInr,
      avgOrderValueInr: allTimeBucket.avgOrderValueInr,
      previousOrdersCame: null,
      previousCancelledOrders: null,
      ordersDelta: null,
    },
  ];
}

export function buildAnalyticsBreakdown(orders: any[], products: any[]): AnalyticsBreakdown {
  const safeOrders = orders || [];
  const safeProducts = products || [];
  const totalOrders = safeOrders.length;

  let deliveredCount = 0;
  let inProgressCount = 0;
  let cancelledCount = 0;
  let returnedCount = 0;

  let onlineOrders = 0;
  let onlineCancelled = 0;
  let onlinePaid = 0;
  let onlineRevenue = 0;

  let codOrders = 0;
  let codCancelled = 0;
  let codPaid = 0;
  let codRevenue = 0;

  const productPerfMap = new Map<string, TopOrderedProductStat>();

  for (const order of safeOrders) {
    const statusKind = classifyOrderStatus(order?.order_status);
    const totalInr = Number(order?.total_inr || 0);
    const safeTotal = Number.isFinite(totalInr) ? totalInr : 0;
    const isCancelled = statusKind === 'cancelled';

    if (statusKind === 'delivered') deliveredCount += 1;
    else if (statusKind === 'cancelled') cancelledCount += 1;
    else if (statusKind === 'returned') returnedCount += 1;
    else inProgressCount += 1;

    const method = String(order?.payment_method || '').toLowerCase().trim();
    const payStatus = String(order?.payment_status || '').toLowerCase().trim();
    if (method === 'cod') {
      codOrders += 1;
      if (isCancelled) codCancelled += 1;
      else codRevenue += safeTotal;
      if (payStatus === 'paid') codPaid += 1;
    } else {
      onlineOrders += 1;
      if (isCancelled) onlineCancelled += 1;
      else onlineRevenue += safeTotal;
      if (payStatus === 'paid') onlinePaid += 1;
    }

    const items = Array.isArray(order?.order_items) ? order.order_items : [];
    for (const item of items) {
      const title = String(item?.product_title || 'Handloom Item').trim();
      const sku = String(item?.product_sku || '').trim();
      const key = String(item?.product_id || sku || title);
      const qty = Math.max(0, Number(item?.quantity || 0));
      const lineTotal = Number(item?.total_price_inr || 0);

      const existing = productPerfMap.get(key) || {
        key,
        title,
        sku,
        unitsOrdered: 0,
        unitsCancelled: 0,
        netUnits: 0,
        revenueInr: 0,
      };
      existing.unitsOrdered += qty;
      if (isCancelled) {
        existing.unitsCancelled += qty;
      } else {
        existing.netUnits += qty;
        existing.revenueInr += Number.isFinite(lineTotal) ? lineTotal : 0;
      }
      productPerfMap.set(key, existing);
    }
  }

  const pct = (count: number) =>
    totalOrders > 0 ? Number(((count / totalOrders) * 100).toFixed(1)) : 0;

  const statusSegments: StatusSegment[] = [
    {
      key: 'delivered',
      label: 'Delivered',
      count: deliveredCount,
      percent: pct(deliveredCount),
      color: '#15803D',
      trackBg: 'bg-emerald-50',
      textClass: 'text-emerald-800',
      statusFilter: 'delivered',
    },
    {
      key: 'in_progress',
      label: 'Pending / In-Transit',
      count: inProgressCount,
      percent: pct(inProgressCount),
      color: '#D97706',
      trackBg: 'bg-amber-50',
      textClass: 'text-amber-800',
      statusFilter: 'in_progress',
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: cancelledCount,
      percent: pct(cancelledCount),
      color: '#E11D48',
      trackBg: 'bg-rose-50',
      textClass: 'text-rose-800',
      statusFilter: 'cancelled',
    },
    {
      key: 'returned',
      label: 'Returned / Refunded',
      count: returnedCount,
      percent: pct(returnedCount),
      color: '#64748B',
      trackBg: 'bg-stone-100',
      textClass: 'text-stone-700',
      statusFilter: 'returned_refunded',
    },
  ];

  const paymentChannels: PaymentChannelStat[] = [
    {
      key: 'online',
      label: 'Razorpay Online',
      ordersCame: onlineOrders,
      cancelledOrders: onlineCancelled,
      paidOrders: onlinePaid,
      netRevenueInr: onlineRevenue,
      sharePct: pct(onlineOrders),
    },
    {
      key: 'cod',
      label: 'Cash on Delivery (COD)',
      ordersCame: codOrders,
      cancelledOrders: codCancelled,
      paidOrders: codPaid,
      netRevenueInr: codRevenue,
      sharePct: pct(codOrders),
    },
  ];

  const topProducts = Array.from(productPerfMap.values())
    .sort((a, b) => b.unitsOrdered - a.unitsOrdered || b.revenueInr - a.revenueInr)
    .slice(0, 5);

  // Stock Health Summary using LOW_STOCK_THRESHOLD (< 3) & Out of Stock (= 0)
  let activeProducts = 0;
  let healthyProducts = 0;
  let lowStockProducts = 0;
  let outOfStockProducts = 0;
  let draftOrArchivedProducts = 0;
  let totalInventoryUnits = 0;
  const lowStockItems: StockHealthSummary['lowStockItems'] = [];
  const outOfStockItems: StockHealthSummary['outOfStockItems'] = [];

  for (const prod of safeProducts) {
    const qty = Math.max(0, Number(prod?.stock_quantity ?? 0));
    const status = String(prod?.status || 'active');
    const inStock = prod?.in_stock !== false;
    totalInventoryUnits += qty;

    if (status === 'active') activeProducts += 1;

    if (status === 'draft' || status === 'archived') {
      draftOrArchivedProducts += 1;
      continue;
    }

    if (status === 'out_of_stock' || !inStock || qty <= 0) {
      outOfStockProducts += 1;
      outOfStockItems.push({
        id: String(prod.id),
        title: String(prod.title || 'Product'),
        sku: String(prod.sku || ''),
      });
    } else if (qty < LOW_STOCK_THRESHOLD) {
      lowStockProducts += 1;
      lowStockItems.push({
        id: String(prod.id),
        title: String(prod.title || 'Product'),
        sku: String(prod.sku || ''),
        stockQuantity: qty,
        shortageUnits: LOW_STOCK_THRESHOLD - qty,
      });
    } else {
      healthyProducts += 1;
    }
  }

  return {
    totalOrders,
    statusSegments,
    paymentChannels,
    topProducts,
    stockHealth: {
      totalProducts: safeProducts.length,
      activeProducts,
      healthyProducts,
      lowStockProducts,
      outOfStockProducts,
      draftOrArchivedProducts,
      totalInventoryUnits,
      lowStockItems: lowStockItems.sort((a, b) => a.stockQuantity - b.stockQuantity),
      outOfStockItems,
    },
  };
}
