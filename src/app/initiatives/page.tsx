import type { Metadata } from "next";
import InitiativesClient from "./InitiativesClient";

export const metadata: Metadata = {
  title: "Our Initiatives",
  description:
    "Explore the impactful initiatives of For The Future Organization - from education and health programs to digital empowerment and community development.",
};

export default function InitiativesPage() {
  return <InitiativesClient />;
}
