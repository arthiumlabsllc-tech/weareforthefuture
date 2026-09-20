import type { Metadata } from "next";
import GetInvolvedClient from "./GetInvolvedClient";

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "Volunteer, join the FTF Fellowship, become a mentor, or partner with For The Future Organization. Four ways to help children and young people move from disadvantage to opportunity across Ghana and Nigeria.",
  alternates: { canonical: "/get-involved" },
};

export default function GetInvolvedPage() {
  return <GetInvolvedClient />;
}
