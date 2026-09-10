import type { Metadata } from "next";
import AdvisoryBoardClient from "./AdvisoryBoardClient";

export const metadata: Metadata = {
  title: "Advisory Board",
  description:
    "Meet the advisory board members of For The Future Organization providing expert guidance in Ghana and the United States.",
};

export default function AdvisoryBoardPage() {
  return <AdvisoryBoardClient />;
}
