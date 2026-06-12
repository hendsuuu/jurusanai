export type AdminOverview = {
  totalOrders: number;
  successOrders: number;
  pendingOrders: number;
  failedOrders: number;
  expiredOrders: number;
  canceledOrders: number;
  totalRevenue: number;
  totalPlans: number;
  conversionRate: number;
  /** Daily revenue + order counts for the last 30 days. */
  revenueSeries: Array<{
    /** ISO `YYYY-MM-DD` */
    date: string;
    revenue: number;
    orders: number;
  }>;
  packageBreakdown: Array<{
    packageType: "BASIC" | "PRO" | "PREMIUM";
    orders: number;
    revenue: number;
  }>;
  statusBreakdown: Array<{
    status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CANCELED";
    orders: number;
  }>;
};

export type AdminOrderItem = {
  id: string;
  orderCode: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  /** BASIC/PRO retained for legacy orders; new checkout only sells PREMIUM. */
  packageType: "BASIC" | "PRO" | "PREMIUM";
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CANCELED";
  paymentProvider: string;
  createdAt: string;
  paidAt: string | null;
  emailStatus: "PENDING" | "SENT" | "FAILED" | "BOUNCED" | null;
  emailSentAt: string | null;
  discoveryResult: {
    id: string;
    personalityTitle: string | null;
    status: string;
  };
};

export type AdminPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type AdminOrdersResponse = {
  items: AdminOrderItem[];
  meta: AdminPaginationMeta;
};

export type AdminPlanItem = {
  id: string;
  personalityTitle: string | null;
  interestArea: string;
  studentName: string | null;
  dailyEnergy: string;
  status: string;
  pdfUrl: string | null;
  createdAt: string;
  _count: { orders: number };
};

export type AdminPlansResponse = {
  items: AdminPlanItem[];
  meta: AdminPaginationMeta;
};

export type AdminLogItem = {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: string;
};

export type AdminLogsResponse = {
  items: AdminLogItem[];
  meta: AdminPaginationMeta;
};

export type AdminOrderDetail = {
  order: AdminOrderItem & {
    paymentToken: string | null;
    paymentUrl: string | null;
    providerReference: string | null;
    rawPaymentRequest: unknown;
    rawPaymentResponse: unknown;
    rawWebhookPayload: unknown;
    expiredAt: string | null;
    updatedAt: string;
    /** Email delivery state for the PDF report. */
    email: {
      status: "PENDING" | "SENT" | "FAILED" | "BOUNCED" | null;
      sentAt: string | null;
      messageId: string | null;
      error: string | null;
      attempts: number;
      to: string | null;
    };
    user: { id: string; email: string; name: string | null; role: string } | null;
    discoveryResult: {
      id: string;
      personalityTitle: string | null;
      interestArea: string;
      studentName: string | null;
      dailyEnergy: string;
      status: string;
      pdfUrl: string | null;
      createdAt: string;
      reportJson: unknown;
      personalityJson: unknown;
    };
  };
  auditLogs: AdminLogItem[];
};

/**
 * Full discovery result detail used by the admin detail page (TanStack-cached).
 * Includes reportJson, personalityJson, and the list of related orders.
 */
export type AdminPlanDetail = {
  plan: {
    id: string;
    userId: string | null;
    personalityTitle: string | null;
    personalityId: string | null;
    interestArea: string;
    studentName: string | null;
    futureLifestyle: string;
    dailyEnergy: string;
    workStyle: string | null;
    naturalBehavior: string | null;
    motivation: string | null;
    socialStyle: string | null;
    status: string;
    pdfUrl: string | null;
    createdAt: string;
    updatedAt: string;
    reportJson: unknown;
    personalityJson: unknown;
    metaJson: unknown;
    orders: Array<{
      id: string;
      orderCode: string;
      packageType: "BASIC" | "PRO" | "PREMIUM";
      amount: number;
      status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CANCELED";
      createdAt: string;
    }>;
  };
};
