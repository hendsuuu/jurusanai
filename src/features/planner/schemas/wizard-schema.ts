import { z } from "zod";

export const plannerWizardSchema = z.object({
  locationCity: z.string().min(2, "Tulis nama kamu dulu ya."),
  ageRange: z.string().min(1, "Pilih rentang umur kamu dulu ya."),
  capitalRange: z.string().min(1, "Pilih jawaban terlebih dahulu."),
  areaType: z.string().min(1, "Pilih salah satu jawaban."),
  categoryInterest: z.string().min(1, "Pilih hal yang paling bikin kamu penasaran."),
  sellingModel: z.string().optional(),
  availableTime: z.string().optional(),
  targetIncome: z.string().optional(),
  riskPreference: z.string().optional(),
  marginPreference: z.string().optional(),
  assets: z.array(z.string()).default([]),
});

export type PlannerWizardValues = z.infer<typeof plannerWizardSchema>;

export const initialPlannerValues: PlannerWizardValues = {
  locationCity: "",
  ageRange: "",
  capitalRange: "",
  areaType: "",
  categoryInterest: "",
  sellingModel: "",
  availableTime: "",
  targetIncome: "",
  riskPreference: "",
  marginPreference: "",
  assets: [],
};
