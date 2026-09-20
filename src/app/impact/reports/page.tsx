import type { Metadata } from "next";
import { getAnnualReports } from "@/lib/documents";
import ReportsClient from "./ReportsClient";

export const metadata: Metadata = {
  title: "Reports & Transparency",
  description:
    "For The Future Organization annual reports, fund allocation, registration and audit information, and institutional policies — how we steward and report on every contribution.",
  alternates: { canonical: "/impact/reports" },
};

// Refresh the document list periodically so newly published reports appear.
export const revalidate = 300;

export default async function ReportsPage() {
  // Annual reports come from the Document model via the data-access layer,
  // which fails soft to [] when the database is unreachable. The client then
  // renders its intentional empty state — never a 500, never an invented file.
  const annualReports = await getAnnualReports();

  return <ReportsClient annualReports={annualReports} />;
}
