// TODO(tech-debt, LOW priority): this file doubles as the ISR fallback and the
// seed source. It is small (~143 lines), so this is not urgent — when next
// touched, consider splitting into src/data/pillars-fallback.ts (minimal) and
// scripts/seed-data/pillars.ts (full copy).
import {
  BookOpen,
  Compass,
  Flower2,
  HeartHandshake,
  Laptop,
  type LucideIcon,
} from "lucide-react";

export interface Pillar {
  id: string;
  number: number;
  title: string;
  summary: string;
  icon: LucideIcon;
  /** The barrier this pillar addresses, described concretely and without pity. */
  challenge: string;
  /** The specific delivery model and activities FTF runs under this pillar. */
  whatWeDo: string;
  /** Who the pillar serves (broad age/group). */
  whoItServes: string;
  /** Where the pillar is delivered (regions/countries). */
  whereItWorks: string;
}

/**
 * The five strategic pillars of For The Future Organization.
 * Every initiative and programme is grouped under exactly one primary pillar
 * (initiatives may carry additional pillar tags for cross-cutting work).
 */
export const pillars: Pillar[] = [
  {
    id: "foundational-education",
    number: 1,
    title: "Foundational Education & Learning Support",
    summary:
      "School access, retention, foundational learning, literacy, numeracy and academic transition support.",
    icon: BookOpen,
    challenge:
      "Many vulnerable children enrol in school but do not remain, or remain without learning at the expected level. Household income, distance, learning gaps, and competing priorities all contribute.",
    whatWeDo:
      "We support school access, retention, and learning outcomes through sponsorship, learning clubs, and academic transition support — working alongside schools and caregivers rather than replacing them.",
    whoItServes:
      "Vulnerable children and young people, primarily primary and junior secondary age.",
    whereItWorks:
      "Greater Accra core programming, with wider regional outreach across 7+ regions of Ghana.",
  },
  {
    id: "girls-education-dignity",
    number: 2,
    title: "Girls' Education, Dignity & Retention",
    summary:
      "Helping girls stay in school with dignity, confidence, protection, mentorship and opportunity.",
    icon: Flower2,
    challenge:
      "Girls face barriers that are specific and compounding: period poverty, safety concerns, early marriage and pregnancy, and household expectations that pull them out of school first. When a girl misses school because she cannot manage her period with dignity, the cost is measured in learning, confidence and retention.",
    whatWeDo:
      "We deliver menstrual health education and free sanitary products, create safe spaces where girls can learn and ask questions, and pair dignity support with mentorship and retention follow-up so girls stay in school and progress with confidence.",
    whoItServes:
      "Adolescent girls and young women, in and out of school, with priority given to those at risk of dropping out.",
    whereItWorks:
      "Greater Accra core programming, with school and community outreach across regions of Ghana.",
  },
  {
    id: "future-ready-skills",
    number: 3,
    title: "Future-Ready Skills & Digital Inclusion",
    summary:
      "Digital literacy, STEM, employability, entrepreneurship, financial literacy and career pathways.",
    icon: Laptop,
    challenge:
      "Many young people complete basic education without the digital, technical or employability skills the modern economy rewards. Without access to devices, training and networks, talent goes unrealised and the transition from school to work stalls.",
    whatWeDo:
      "We provide digital literacy, STEM, vocational and entrepreneurship training, together with career guidance and work-readiness support, so young people can move from learning to livelihood and independent income.",
    whoItServes:
      "Young people transitioning from school to work, including out-of-school youth and recent graduates seeking a first pathway.",
    whereItWorks:
      "Greater Accra core programming, with partner-led delivery reaching youth across Ghana and in Ibadan, Nigeria.",
  },
  {
    id: "mentorship-leadership",
    number: 4,
    title: "Mentorship, Leadership & Child Wellbeing",
    summary:
      "Role models, values, emotional support, confidence, resilience and leadership development.",
    icon: Compass,
    challenge:
      "Vulnerable children often lack consistent, positive adult role models and safe spaces to build confidence, values and emotional resilience. Without that support, potential is undermined by circumstance rather than by ability.",
    whatWeDo:
      "We connect children and young people with trained mentors and role models, deliver leadership and life-skills programming, and provide emotional and wellbeing support that builds confidence, resilience and a sense of belonging.",
    whoItServes:
      "Children and young people across primary, secondary and transition stages, with priority for those facing adversity.",
    whereItWorks:
      "Greater Accra core programming, with mentorship and leadership activities across regions of Ghana and in Ibadan, Nigeria.",
  },
  {
    id: "community-family-support",
    number: 5,
    title: "Community & Family Support",
    summary:
      "Strengthening the family and community conditions children need to learn, stay safe and thrive.",
    icon: HeartHandshake,
    challenge:
      "A child's ability to learn and stay safe depends on conditions at home and in the community: household stability, food security, essential supplies, and adults who are supported to care for them. Vulnerability at the family level shows up in the classroom.",
    whatWeDo:
      "We strengthen the family and community conditions around children through essential supplies, household and caregiver support, community outreach and seasonal campaigns — working with local partners and a safeguarding-first practice.",
    whoItServes:
      "Children and their families and caregivers in vulnerable communities, alongside the local partners who support them.",
    whereItWorks:
      "Greater Accra core programming, with community outreach across regions of Ghana.",
  },
];

/** Pillars whose titles appear in an initiative's `pillars` tags, in pillar order. */
export function pillarsForTags(tags: string[] | undefined): Pillar[] {
  if (!tags?.length) return [];
  return pillars.filter((pillar) => tags.includes(pillar.title));
}

/** The primary pillar for an initiative (first tag in pillar order), if any. */
export function primaryPillar(tags: string[] | undefined): Pillar | null {
  return pillarsForTags(tags)[0] ?? null;
}

/**
 * "How FTF changes a future" — the theory of change made visual.
 * Each stage maps to the pillar that primarily delivers it, so the journey
 * stepper on the homepage can render a single coherent access-to-opportunity
 * pathway rather than a list of disconnected projects.
 */
export interface JourneyStage {
  id: string;
  label: string;
  description: string;
  pillarId: string;
}

export const journeyStages: JourneyStage[] = [
  { id: "access",     label: "Access & Stay in School",      description: "Children enrol, attend and remain in school.",                 pillarId: "foundational-education" },
  { id: "learn",      label: "Learn",                         description: "Foundational literacy, numeracy and academic support.",        pillarId: "foundational-education" },
  { id: "dignity",    label: "Live with Dignity & Wellbeing", description: "Girls' dignity, menstrual health, safety and confidence.",    pillarId: "girls-education-dignity" },
  { id: "skills",     label: "Build Skills",                  description: "Digital, vocational, entrepreneurial and financial literacy.", pillarId: "future-ready-skills" },
  { id: "mentorship", label: "Receive Mentorship",            description: "Role models, values, resilience and leadership.",             pillarId: "mentorship-leadership" },
  { id: "transition", label: "Transition to Work",            description: "TVET, apprenticeship, enterprise and employment pathways.",   pillarId: "future-ready-skills" },
  { id: "giveback",   label: "Give Back & Lead",              description: "Graduates mentor and train the next cohort.",                 pillarId: "mentorship-leadership" },
];
