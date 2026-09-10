import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with For The Future Organization. Reach out for volunteering, partnerships, donations, or general inquiries.",
};

export default function ContactPage() {
  return <ContactClient />;
}
