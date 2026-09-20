import type { Metadata } from "next";
import VolunteerClient from "./VolunteerClient";

export const metadata: Metadata = {
  title: "Volunteer Opportunities",
  description:
    "Join For The Future as a volunteer. Make a direct impact in the lives of vulnerable children across Ghana, Nigeria, and the US.",
  alternates: { canonical: "/volunteer" },
};

export default function VolunteerPage() {
  return <VolunteerClient />;
}
