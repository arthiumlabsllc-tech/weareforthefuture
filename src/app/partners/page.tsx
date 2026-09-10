import type { Metadata } from "next";
import PartnersClient from "./PartnersClient";

export const metadata: Metadata = {
  title: "Our Partners",
  description:
    "Meet the organizations and businesses partnering with For The Future to create lasting change for underprivileged children.",
};

export default function PartnersPage() {
  return <PartnersClient />;
}
