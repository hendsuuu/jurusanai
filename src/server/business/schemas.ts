import { z } from "zod";

export const recommendBusinessSchema = z.object({
  capitalRange: z.string().min(1, "Jawaban wajib dipilih"),
  locationCity: z.string().min(2, "Nama wajib diisi"),
  ageRange: z.string().min(1, "Rentang umur wajib dipilih"),
  areaType: z.string().min(1, "Jawaban wajib dipilih"),
  categoryInterest: z.string().min(1, "Jawaban wajib dipilih"),
  sellingModel: z.string().optional(),
  availableTime: z.string().optional(),
  targetIncome: z.string().optional(),
  riskPreference: z.string().optional(),
  marginPreference: z.string().optional(),
  assets: z.array(z.string()).default([]),
});

export type RecommendBusinessInput = z.infer<typeof recommendBusinessSchema>;

export const selectBusinessIdeaSchema = z.object({
  planId: z.string().min(1),
  templateId: z.string().min(1),
});

export type SelectBusinessIdeaInput = z.infer<typeof selectBusinessIdeaSchema>;

export const createPaymentSchema = z.object({
  planId: z.string().min(1),
  /**
   * The recommended business idea slug the user picked. AI plan
   * generation is deferred until payment succeeds — the webhook reads
   * this from the order to know which idea to generate the plan for.
   */
  templateId: z.string().min(1),
  packageType: z.enum(["PREMIUM"]),
  customerName: z.string().min(2).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(8).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
