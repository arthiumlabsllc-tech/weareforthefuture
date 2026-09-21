import type { Metadata } from "next";
import VolunteerPageClient from "./VolunteerPageClient";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Volunteer with For The Future Organization - teaching, health, digital skills, mentorship, creative arts, fundraising and more. On-site across Ghana and Nigeria, or remote. Safeguarding-first onboarding.",
  alternates: { canonical: "/get-involved/volunteer" },
};

export default function GetInvolvedVolunteerPage() {
  return <VolunteerPageClient />;
}
