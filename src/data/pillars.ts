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
      "Sponsorship, school supplies and learning clubs that keep children enrolled, learning and thriving in class.",
    icon: BookOpen,
  },
  {
    id: "girls-education-dignity",
    number: 2,
    title: "Girls' Education, Dignity & Retention",
    summary:
      "Menstrual health, dignity kits, mentorship circles and caregiver engagement that keep girls in school.",
    icon: Flower2,
  },
  {
    id: "future-ready-skills",
    number: 3,
    title: "Future-Ready Skills & Digital Inclusion",
    summary:
      "Digital, creative and vocational skills - from photography to financial literacy - for the future of work.",
    icon: Laptop,
  },
  {
    id: "mentorship-leadership",
    number: 4,
    title: "Mentorship, Leadership & Child Wellbeing",
    summary:
      "Structured mentorship, leadership development and play-based programmes that build confidence and character.",
    icon: Compass,
  },
  {
    id: "community-family-support",
    number: 5,
    title: "Community & Family Support",
    summary:
      "Essential supplies, family strengthening and safe community spaces that support the whole child.",
    icon: HeartHandshake,
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
