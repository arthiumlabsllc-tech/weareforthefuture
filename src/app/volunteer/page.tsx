import type { Metadata } from "next";
import VolunteerClient from "./VolunteerClient";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Join For The Future as a volunteer. Make a direct impact in the lives of underprivileged children across Ghana, Nigeria, and the US.",
};

export default function VolunteerPage() {
  return <VolunteerClient />;
}
