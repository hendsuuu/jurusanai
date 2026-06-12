export type RiskLevel = "rendah" | "sedang" | "tinggi";

export type BusinessProduct = {
  name: string;
  sellingPrice: number;
  hpp: number;
  dailySales: number;
};

export type CapitalItem = {
  name: string;
  amount: number;
};

export type MonthlyCost = {
  name: string;
  amount: number;
};

export type BusinessTemplate = {
  id: string;
  name: string;
  category: string;
  description?: string;
  minCapital: number;
  maxCapital: number;
  suitableAreas: string[];
  suitableModels: string[];
  suitableAssets: string[];
  riskLevel: RiskLevel;
  marginRange: [number, number];
  estimatedPaybackMonth: [number, number];
  products: BusinessProduct[];
  capitalItems: CapitalItem[];
  monthlyCosts: MonthlyCost[];
};

export type ComputedProduct = BusinessProduct & {
  grossProfitPerUnit: number;
  marginPercentage: number;
  dailyRevenue: number;
  dailyGrossProfit: number;
};

export type NetMarginBenchmark = {
  industry: string;
  normalRange: [number, number];
  veryGoodRange: [number, number];
  note: string;
};

export type FinancialProjection = {
  operatingDays: number;
  products: ComputedProduct[];
  totalInitialCapital: number;
  monthlyOperationalCost: number;
  marginAdjustmentCost: number;
  monthlyRevenue: number;
  monthlyGrossProfit: number;
  monthlyNetProfit: number;
  netMarginPercentage: number;
  marginBenchmark: NetMarginBenchmark;
  paybackPeriodMonth: number | null;
  scenarios: {
    conservative: ScenarioResult;
    normal: ScenarioResult;
    optimistic: ScenarioResult;
  };
};

export type ScenarioResult = {
  label: string;
  factor: number;
  monthlyRevenue: number;
  monthlyGrossProfit: number;
  monthlyNetProfit: number;
  paybackPeriodMonth: number | null;
};

export type UserPlannerInput = {
  capitalRange: string;
  capitalMin?: number;
  capitalMax?: number;
  capitalAmount?: number;
  locationCity: string;
  ageRange?: string;
  areaType: string;
  categoryInterest: string;
  sellingModel?: string;
  availableTime?: string;
  targetIncome?: string;
  riskPreference?: string;
  marginPreference?: string;
  assets: string[];
};
