import { z } from "zod";

const text = z.string().trim().min(1).max(4000);

// Structured public content; render as text, never as untrusted HTML.
export const programmeDetailSchema = z.object({
  headline: text,
  formerName: text.optional(),
  launched: text,
  challenge: text,
  evidenceSummary: text,
  stages: z.array(z.object({
    name: text,
    description: text,
    status: z.enum(["running", "seeking-partners"]),
  })).min(1).max(12),
  evidence: z.array(z.object({ title: text, description: text })).max(10),
  partnershipIntro: text,
  partnershipOptions: z.array(text).min(1).max(12),
  roadmap: z.array(z.object({ title: text, description: text })).max(8),
  safeguarding: text,
});

export const programMetricsSchema = z.object({
  category: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  beneficiaries: z.number().int().nonnegative().nullable().optional(),
  status: z.enum(["active", "completed", "upcoming"]).optional(),
  highlights: z.array(text).max(20).optional(),
  pillars: z.array(text).max(5).optional(),
  featured: z.boolean().optional(),
  detail: programmeDetailSchema.optional(),
}).catchall(z.json());

export type ProgrammeDetail = z.infer<typeof programmeDetailSchema>;
