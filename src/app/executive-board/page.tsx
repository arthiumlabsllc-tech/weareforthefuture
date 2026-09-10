import type { Metadata } from "next";
import ExecutiveBoardClient from "./ExecutiveBoardClient";

export const metadata: Metadata = {
  title: "Executive Board",
  description:
    "Meet the executive board members of For The Future Organization leading our mission across Ghana and Nigeria.",
};

export default function ExecutiveBoardPage() {
  return <ExecutiveBoardClient />;
}
