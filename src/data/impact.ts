import { Users, BookOpen, Heart, MapPin } from "lucide-react";
import { siteConfig } from "@/data/site";

/**
 * Single source of truth for the public impact figures shown on /impact and
 * /impact-stories. Headline numbers are derived from `siteConfig.stats` so the
 * whole site stays consistent; edit the values there (or below) in one place.
 *
 * NOTE: these figures are placeholders carried over from the previous static
 * site and should be confirmed against FTF's real monitoring data before launch.
 */

const { beneficiaries, volunteers, campaigns, yearsOfFoundation } = siteConfig.stats;

export const impactMetrics = [
  {
    icon: Users,
    value: `${beneficiaries.toLocaleString()}+`,
    label: "Children Reached",
    description:
      "Underprivileged children supported through our programs since 2016.",
    color: "gold",
  },
  {
    icon: BookOpen,
    value: "5,000+",
    label: "Students Sponsored",
    description:
      "Children enrolled in school with full tuition, books, and mentorship.",
    color: "emerald",
  },
  {
    icon: Heart,
    value: "50,000+",
    label: "Health Kits Distributed",
    description:
      "Hygiene and menstrual health products provided to girls and families.",
    color: "coral",
  },
  {
    icon: MapPin,
    value: "30+",
    label: "Communities Served",
    description:
      "Underserved communities across Ghana, Nigeria, and the United States.",
    color: "navy",
  },
];

export const impactByYear = [
  { year: "2016", children: 50, volunteers: 10, initiatives: 2 },
  { year: "2017", children: 200, volunteers: 50, initiatives: 4 },
  { year: "2018", children: 800, volunteers: 150, initiatives: 6 },
  { year: "2019", children: 2000, volunteers: 400, initiatives: 8 },
  { year: "2020", children: 5000, volunteers: 800, initiatives: 10 },
  { year: "2021", children: 15000, volunteers: 1200, initiatives: 12 },
  { year: "2022", children: 30000, volunteers: 1800, initiatives: 14 },
  { year: "2023", children: 50000, volunteers: 2200, initiatives: 16 },
  { year: "2024", children: 75000, volunteers: 2800, initiatives: 18 },
  { year: "2025", children: beneficiaries, volunteers, initiatives: siteConfig.stats.initiatives },
];

/**
 * Fund allocation. `hex` drives both the progress bar and the donut chart so
 * the visualisation always uses the FTF brand palette (green / blue / charcoal)
 * instead of the legacy gold-emerald-coral colours.
 */
export const fundAllocation = [
  { category: "Education Programs", percentage: 40, hex: "#4CB64D" },
  { category: "Healthcare & Hygiene", percentage: 20, hex: "#3973B8" },
  { category: "Community Development", percentage: 15, hex: "#2E7D32" },
  { category: "FTF Village Project", percentage: 15, hex: "#494949" },
  { category: "Operations & Admin", percentage: 10, hex: "#9AA1A6" },
];

export const successStories = [
  {
    name: "Ama, Age 14",
    location: "Jamestown, Ghana",
    story:
      "Through the S.T.E.P program, Ama received full school sponsorship and mentorship. She is now top of her class and dreams of becoming a doctor.",
    program: "S.T.E.P",
  },
  {
    name: "Chidi, Age 16",
    location: "Lagos, Nigeria",
    story:
      "Chidi participated in Project Momentum's leadership workshop. He went on to start a peer tutoring group at his school, helping 30+ students improve their grades.",
    program: "Project Momentum",
  },
  {
    name: "Abena, Age 12",
    location: "Takoradi, Ghana",
    story:
      "The Empower Her, Period program gave Abena access to sanitary products and confidence. She hasn't missed a day of school since.",
    program: "Empower Her, Period",
  },
];

/** Headline counters for the /impact-stories stat bar. */
export const storyStats = [
  { value: yearsOfFoundation, suffix: "+", label: "Years of Foundation" },
  { value: volunteers, suffix: "+", label: "Amazing Volunteers" },
  { value: beneficiaries, suffix: "", label: "Incredible Beneficiaries" },
  { value: campaigns, suffix: "+", label: "Successful Campaigns" },
];
