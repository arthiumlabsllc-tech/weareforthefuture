/**
 * Decade milestones, 2016 → 2026 (brief: Our Story / FTF at 10).
 *
 * Shared by /about/our-story and /impact/ftf-at-10 so the timeline is authored
 * once and rendered through the single <Timeline> component (no duplication).
 * Kept separate from src/data/content.ts `timeline`, which is the legacy
 * year-by-year log and still contains pre-rebrand language.
 */
export interface DecadeMilestone {
  year: string;
  title: string;
  blurb: string;
}

export const decadeMilestones: DecadeMilestone[] = [
  {
    year: "2016",
    title: "The founding",
    blurb:
      "Started by students at Wesley Girls' High School, with a first community outreach in Ashaiman.",
  },
  {
    year: "2021",
    title: "STEP",
    blurb:
      "The Student Training & Education Project brings structured learning support to children.",
  },
  {
    year: "2021",
    title: "FTF Village concept",
    blurb:
      "A long-term vision takes shape: a safe place of housing, learning and belonging.",
  },
  {
    year: "2022",
    title: "Chess in Slums",
    blurb:
      "A partnership brings chess-based learning, focus and mentorship to new communities.",
  },
  {
    year: "2023",
    title: "Learning Clubs + Empower Her, Period",
    blurb:
      "Saturday learning clubs and a girls' dignity and retention programme launch.",
  },
  {
    year: "2024",
    title: "Click4Change",
    blurb:
      "Digital inclusion and future-ready skills put technology in young people's hands.",
  },
  {
    year: "2025",
    title: "Nigeria + 501(c)(3)",
    blurb:
      "Operations begin in Ibadan, Nigeria, and a US 501(c)(3) vehicle is established.",
  },
  {
    year: "2026",
    title: "Future Pathways + 10th anniversary",
    blurb:
      "The five-pillar model unifies a decade of learning as FTF enters its second decade.",
  },
];
