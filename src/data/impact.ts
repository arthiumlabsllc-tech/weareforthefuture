import { Users, BookOpen, Heart, MapPin } from "lucide-react";
import { siteConfig } from "@/data/site";

/**
 * Single source of truth for the public impact figures shown on /impact and
 * /impact-stories. Headline numbers are derived from `siteConfig.stats` so the
 * whole site stays consistent; edit the values there (or below) in one place.
 *
 * Verified institutional record (brief Section 2): 10 years · 9,000+ children
 * and young people reached · 500+ volunteers · 200+ campaigns. The invented
 * year-by-year growth chart was removed - it contradicted the verified figures
 * and was a credibility risk.
 */

const { beneficiaries, volunteers, campaigns, yearsOfFoundation, countries } = siteConfig.stats;

export const impactMetrics = [
  { icon: Users,    value: `${beneficiaries.toLocaleString()}+`, label: "Children and young people reached",   description: "Across ten years of community-rooted programming in Ghana and Nigeria.", color: "primary" },
  { icon: BookOpen, value: `${campaigns}+`,                       label: "Campaigns and activities delivered",  description: "Programme activities, community outreach, and school-based initiatives.", color: "accent" },
  { icon: Heart,    value: `${volunteers}+`,                      label: "Volunteers mobilised",                description: "Youth-led, community-powered delivery across both countries.",           color: "accent" },
  { icon: MapPin,   value: `${countries}`,                        label: "Countries of programme delivery",     description: "Ghana (Greater Accra core, 7+ regions) and Nigeria (Ibadan, Oyo State).", color: "charcoal" },
];

export const fundAllocation = [
  { category: "Education & Learning Support",  percentage: 40, hex: "#4CB64D" },
  { category: "Girls' Education & Dignity",    percentage: 20, hex: "#3973B8" },
  { category: "Future-Ready Skills",           percentage: 15, hex: "#2E7D32" },
  { category: "Mentorship & Wellbeing",        percentage: 10, hex: "#494949" },
  { category: "Community & Family Support",    percentage: 10, hex: "#9AA1A6" },
  { category: "Operations & Governance",       percentage: 5,  hex: "#6C7277" },
];

export const successStories = [
  { name: "Prince",  age: null, location: "Greater Accra", story: "Spotted through STEP for his talent and curiosity, Prince has grown through mentorship and skills exposure. He is now part of FTF's Future Pathways cohort, preparing for technical training.", program: "STEP · Future Pathways", pillar: "Future-Ready Skills & Digital Inclusion", status: "safeguarding-approved" },
  { name: "Comfort", age: null, location: "Greater Accra", story: "Comfort stayed in school through FTF's girls' dignity and retention programming. Today she mentors younger girls in her community and is exploring a pathway into STEM.", program: "Empower Her, Period · Girls' Dignity & Retention", pillar: "Girls' Education, Dignity & Retention", status: "safeguarding-approved" },
];

/** Headline counters for the /impact-stories stat bar (static - no count-up). */
export const storyStats = [
  { value: `${yearsOfFoundation}`, suffix: "", label: "Years of continuous impact" },
  { value: `${beneficiaries.toLocaleString()}`, suffix: "+", label: "Children and young people reached" },
  { value: `${volunteers}`, suffix: "+", label: "Volunteers mobilised" },
  { value: `${campaigns}`, suffix: "+", label: "Campaigns and activities" },
];
