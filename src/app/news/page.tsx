import type { Metadata } from "next";
import NewsClient from "./NewsClient";

export const metadata: Metadata = {
  title: "News & Stories",
  description:
    "Stay updated with the latest news, stories, and updates from For The Future Organization.",
};

export default function NewsPage() {
  return <NewsClient />;
}
