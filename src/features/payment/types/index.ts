export type PackageType = "PREMIUM";

export type CreatePaymentRequest = {
  planId: string;
  /**
   * Recommended business idea slug. Stored on the order so the webhook
   * can generate the AI plan after payment success.
   */
  templateId: string;
  packageType: PackageType;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

export type CreatePaymentResponse = {
  orderId: string;
  orderCode: string;
  amount: number;
  status: "PENDING";
  paymentToken: string | null;
  paymentUrl: string | null;
};

export type OrderStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "CANCELED";

export type OrderDetailResponse = {
  orderId: string;
  orderCode: string;
  status: OrderStatus;
  amount: number;
  packageType: PackageType;
  planId: string;
  paymentUrl?: string | null;
  /** ISO timestamp when the Midtrans payment session expires. */
  expiredAt?: string | null;
  discoveryResult: {
    id: string;
    status: string;
    pdfReady: boolean;
    pdfUrl: string | null;
    selectedIdeaName: string | null;
  };
};
