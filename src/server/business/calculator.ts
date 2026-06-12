import type {
  BusinessTemplate,
  ComputedProduct,
  FinancialProjection,
  NetMarginBenchmark,
  ScenarioResult,
} from "./types";

const DEFAULT_OPERATING_DAYS = 26;

const GENERAL_NET_MARGIN: NetMarginBenchmark = {
  industry: "Umum",
  normalRange: [5, 10],
  veryGoodRange: [10, 20],
  note: "Margin laba bersih 5-10% tergolong normal dan sehat; 10-20% sangat baik.",
};

const NET_MARGIN_BENCHMARKS = {
  retail: {
    industry: "Ritel/Grosir",
    normalRange: [2, 6],
    veryGoodRange: [6, 10],
    note: "Ritel dan grosir biasanya mengambil laba bersih tipis dari volume penjualan tinggi.",
  },
  fmcg: {
    industry: "FMCG / Barang Konsumsi",
    normalRange: [5, 10],
    veryGoodRange: [10, 20],
    note: "Barang konsumsi bergerak cepat bergantung pada volume, repeat order, dan kekuatan merek.",
  },
  fnb: {
    industry: "F&B / Restoran & Kuliner",
    normalRange: [3, 9],
    veryGoodRange: [9, 15],
    note: "F&B perlu menjaga food cost, waste, sewa, tenaga kerja, dan promosi agar margin bersih sehat.",
  },
  fashion: {
    industry: "Fesyen & Pakaian",
    normalRange: [3, 8],
    veryGoodRange: [8, 15],
    note: "Fesyen rentan biaya retur, stok mati, diskon, dan iklan sehingga margin bersih sehat biasanya moderat.",
  },
  serviceDigital: {
    industry: "Jasa & Digital",
    normalRange: [15, 25],
    veryGoodRange: [25, 35],
    note: "Jasa dan digital bisa memiliki margin bersih lebih tinggi karena minim stok barang fisik.",
  },
} satisfies Record<string, NetMarginBenchmark>;

export function getNetMarginBenchmark(template: BusinessTemplate): NetMarginBenchmark {
  const category = template.category.toLowerCase();
  const text = `${template.name} ${template.description ?? ""}`.toLowerCase();

  if (category.includes("f&b") || category.includes("food")) {
    return NET_MARGIN_BENCHMARKS.fnb;
  }
  if (
    text.includes("fashion") ||
    text.includes("hijab") ||
    text.includes("baju") ||
    text.includes("pakaian") ||
    text.includes("tunik")
  ) {
    return NET_MARGIN_BENCHMARKS.fashion;
  }
  if (text.includes("sembako") || text.includes("skincare") || text.includes("fmcg")) {
    return NET_MARGIN_BENCHMARKS.fmcg;
  }
  if (category.includes("retail") || category.includes("reseller")) {
    return NET_MARGIN_BENCHMARKS.retail;
  }
  if (
    category.includes("digital") ||
    category.includes("jasa") ||
    category.includes("laundry") ||
    category.includes("beauty")
  ) {
    return NET_MARGIN_BENCHMARKS.serviceDigital;
  }
  return GENERAL_NET_MARGIN;
}

function buildScenario(
  label: string,
  factor: number,
  baseRevenue: number,
  baseGrossProfit: number,
  monthlyOperationalCost: number,
  totalInitialCapital: number
): ScenarioResult {
  const monthlyRevenue = Math.round(baseRevenue * factor);
  const monthlyGrossProfit = Math.round(baseGrossProfit * factor);
  const monthlyNetProfit = monthlyGrossProfit - monthlyOperationalCost;
  const paybackPeriodMonth =
    monthlyNetProfit > 0
      ? Number((totalInitialCapital / monthlyNetProfit).toFixed(2))
      : null;

  return {
    label,
    factor,
    monthlyRevenue,
    monthlyGrossProfit,
    monthlyNetProfit,
    paybackPeriodMonth,
  };
}

export function calculateFinancialProjection(
  template: BusinessTemplate,
  operatingDays: number = DEFAULT_OPERATING_DAYS
): FinancialProjection {
  const products: ComputedProduct[] = template.products.map((product) => {
    const grossProfitPerUnit = product.sellingPrice - product.hpp;
    const marginPercentage =
      product.sellingPrice > 0
        ? Number(((grossProfitPerUnit / product.sellingPrice) * 100).toFixed(2))
        : 0;
    const dailyRevenue = product.sellingPrice * product.dailySales;
    const dailyGrossProfit = grossProfitPerUnit * product.dailySales;

    return {
      ...product,
      grossProfitPerUnit,
      marginPercentage,
      dailyRevenue,
      dailyGrossProfit,
    };
  });

  const totalInitialCapital = template.capitalItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const monthlyOperationalCost = template.monthlyCosts.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const monthlyRevenue =
    products.reduce((sum, p) => sum + p.dailyRevenue, 0) * operatingDays;

  const monthlyGrossProfit =
    products.reduce((sum, p) => sum + p.dailyGrossProfit, 0) * operatingDays;

  const marginBenchmark = getNetMarginBenchmark(template);
  const rawMonthlyNetProfit = monthlyGrossProfit - monthlyOperationalCost;
  const maxHealthyNetProfit = monthlyRevenue * (marginBenchmark.normalRange[1] / 100);
  const marginAdjustmentCost =
    rawMonthlyNetProfit > maxHealthyNetProfit
      ? Math.round(rawMonthlyNetProfit - maxHealthyNetProfit)
      : 0;
  const normalizedMonthlyOperationalCost =
    monthlyOperationalCost + marginAdjustmentCost;
  const monthlyNetProfit =
    monthlyGrossProfit - normalizedMonthlyOperationalCost;
  const netMarginPercentage =
    monthlyRevenue > 0
      ? Number(((monthlyNetProfit / monthlyRevenue) * 100).toFixed(2))
      : 0;

  const paybackPeriodMonth =
    monthlyNetProfit > 0
      ? Number((totalInitialCapital / monthlyNetProfit).toFixed(2))
      : null;

  // Scenario factors are intentionally biased downward so the
  // Scenario factors represent achievable sales targets. The baseline
  // (factor 1.0) is the "ideal" target. Conservative at 75% ensures
  // the report never shows negative profit for viable businesses.
  const scenarios = {
    conservative: buildScenario(
      "Konservatif",
      0.75,
      monthlyRevenue,
      monthlyGrossProfit,
      normalizedMonthlyOperationalCost,
      totalInitialCapital
    ),
    normal: buildScenario(
      "Normal",
      0.9,
      monthlyRevenue,
      monthlyGrossProfit,
      normalizedMonthlyOperationalCost,
      totalInitialCapital
    ),
    optimistic: buildScenario(
      "Optimis",
      1.0,
      monthlyRevenue,
      monthlyGrossProfit,
      normalizedMonthlyOperationalCost,
      totalInitialCapital
    ),
  };

  return {
    operatingDays,
    products,
    totalInitialCapital,
    monthlyOperationalCost: Math.round(normalizedMonthlyOperationalCost),
    marginAdjustmentCost,
    monthlyRevenue: Math.round(monthlyRevenue),
    monthlyGrossProfit: Math.round(monthlyGrossProfit),
    monthlyNetProfit: Math.round(monthlyNetProfit),
    netMarginPercentage,
    marginBenchmark,
    paybackPeriodMonth,
    scenarios,
  };
}

function formatIDR(amount: number): string {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

export function formatCapitalRange(template: BusinessTemplate) {
  return `${formatIDR(template.minCapital)} - ${formatIDR(template.maxCapital)}`;
}

export function formatMarginRange(template: BusinessTemplate) {
  const benchmark = getNetMarginBenchmark(template);
  return `${benchmark.normalRange[0]}% - ${benchmark.normalRange[1]}% bersih`;
}

export function formatMonthlyProfitRange(projection: FinancialProjection) {
  const lo = projection.scenarios.conservative.monthlyNetProfit;
  const hi = projection.scenarios.optimistic.monthlyNetProfit;
  if (lo <= 0 && hi <= 0) return "Rugi pada estimasi awal — perlu review asumsi";
  return `${formatIDR(Math.max(lo, 0))} - ${formatIDR(Math.max(hi, 0))}`;
}

export function formatPaybackPeriod(template: BusinessTemplate) {
  return `${template.estimatedPaybackMonth[0]} - ${template.estimatedPaybackMonth[1]} bulan`;
}
