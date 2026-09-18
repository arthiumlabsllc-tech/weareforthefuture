import { ReactNode } from "react";
import { getSupporterSessionFromCookie } from "@/lib/supporter-auth";
import SupporterChrome from "./SupporterChrome";

export default async function SupporterLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSupporterSessionFromCookie();

  // Login and register pages don't require auth
  return (
    <SupporterChrome supporterName={session?.name}>
      {children}
    </SupporterChrome>
  );
}
