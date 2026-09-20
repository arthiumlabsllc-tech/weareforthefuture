import type { Metadata } from "next";
import MentorClient from "./MentorClient";

export const metadata: Metadata = {
  title: "Mentor",
  description:
    "Become a mentor with For The Future Organization. Share your professional or lived experience with a young person — academic guidance, career pathways, digital skills, leadership and entrepreneurship.",
  alternates: { canonical: "/get-involved/mentor" },
};

export default function GetInvolvedMentorPage() {
  return <MentorClient />;
}
