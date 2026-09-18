import type { Prisma, PrismaClient } from "@prisma/client";
import { programMetricsSchema } from "../src/lib/programme-content";

// Initial leadership-supplied copy. After import, the CMS is the public source of truth.
// The original diagram and identifiable stories are withheld pending safeguarding approval.
export const futurePathways = {
  slug: "future-pathways",
  name: "Future Pathways",
  shortDescription: "FTF’s employability and enterprise programme connects young people’s talents to skills, work experience and a route toward sustainable livelihoods.",
  description: "Launched in February 2025, Future Pathways is For The Future Organization’s employability and enterprise programme under the Future-Ready Skills and Digital Inclusion pillar. It helps young people in Ghana’s underserved communities move from talent to training, work experience and future opportunity.",
  image: null,
  impactMetrics: programMetricsSchema.parse({
    category: "Technology",
    country: "Ghana",
    year: 2025,
    status: "active",
    beneficiaries: null,
    featured: true,
    pillars: ["Future-Ready Skills and Digital Inclusion"],
    highlights: ["Identify → Prepare → Train → Place", "Stages 1–4 running and proven through individual journeys", "Partners sought for Launch and Employ"],
    detail: {
      headline: "From talent to livelihood.",
      formerName: "Project Future Ready",
      launched: "February 2025",
      challenge: "The barrier facing a talented young person is rarely ability. It is the absence of a route. Between a young person’s gift and a livelihood sit school fees, unrecognized talent, limited access to technical training, no work experience and no startup capital. Future Pathways connects these missing steps so talent can develop into opportunity.",
      evidenceSummary: "Stages 1–4 are already running and proven through individual journeys. FTF is seeking partners to build stages 5 and 6 and scale the model; graduate enterprises and cohort-scale results are not yet claimed as achieved outcomes.",
      stages: [
        { name: "Identify", description: "Spot talent and potential in underserved communities through STEP and community outreach.", status: "running" },
        { name: "Prepare", description: "Build foundational, digital and life skills, with mentorship and workplace readiness.", status: "running" },
        { name: "Train", description: "Match each young person to technical or vocational training that fits their gift.", status: "running" },
        { name: "Place", description: "Secure real work experience through internships and industry placements.", status: "running" },
        { name: "Launch", description: "Build enterprise support, tools and startup capital so graduates can establish their own businesses.", status: "seeking-partners" },
        { name: "Employ", description: "Support graduate enterprises to take on and train the next cohort, turning one opportunity into many.", status: "seeking-partners" },
      ],
      evidence: [
        { title: "Creative talent to technical training", description: "A STEP participant’s interest in carving toy cars from scrap wood developed into a robotics scholarship, technical education in automechanics and automotive training." },
        { title: "Education to workplace experience", description: "Another young person began a school internship after completing basic education, taking an early step from learning into workplace experience." },
      ],
      partnershipIntro: "Help build the route from skills to sustainable work. Future Pathways offers partners an aspirational vocational-training model that includes STEM, IT and green-economy skills. The immediate partnership opportunity is to build Launch and Employ while strengthening training and placements.",
      partnershipOptions: [
        "Technical and vocational training, including STEM, IT and green-economy skills",
        "Internships, apprenticeships and industry placements",
        "Business training, professional mentorship and enterprise readiness",
        "Tools, equipment and startup capital for graduate businesses",
        "Partnerships to help graduate enterprises train and employ the next cohort",
      ],
      roadmap: [
        { title: "Today · Individual journeys", description: "The first four stages are working through individual journeys, with training and placements secured one young person at a time." },
        { title: "Phase 1 · Prove at cohort scale", description: "Proposed: build full annual cohorts through Launch and Employ across Greater Accra, Central, Eastern and Volta, where FTF already works." },
        { title: "Phase 2 · Widen the footprint", description: "Proposed: deepen the model in those regions and expand into Bono East and Savannah, with a standing network of employers and training opportunities." },
        { title: "Phase 3 · Replicate and grow", description: "Proposed: extend the model to Ibadan, Nigeria, with graduate enterprises training future cohorts. These are expansion ambitions, not current Future Pathways delivery claims." },
      ],
      safeguarding: "Support is administered through FTF. Programme examples are anonymized; identifiable stories and the original diagram are withheld pending current consent and safeguarding approval. There is no direct contact or private financial relationship between supporters and children.",
    },
  }),
};

export async function syncFuturePathways(prisma: PrismaClient, replaceContent = false) {
  const records = await prisma.program.findMany({
    where: { slug: { in: ["future-pathways", "project-future-ready"] } },
  });
  if (records.length > 1) throw new Error("Both programme slugs exist; reconcile them before importing.");
  const existing = records[0];
  if (existing?.deletedAt) throw new Error("Programme is archived; restore it explicitly before importing.");
  // Normal seeds never overwrite subsequent CMS edits.
  if (existing?.slug === "future-pathways" && !replaceContent) return existing;
  const data = {
    ...futurePathways,
    impactMetrics: futurePathways.impactMetrics as Prisma.InputJsonObject,
  };
  if (existing) {
    return prisma.program.update({ where: { id: existing.id }, data });
  }
  return prisma.program.create({ data: { ...data, order: 0, published: true } });
}
