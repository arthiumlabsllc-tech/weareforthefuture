import { ReactNode } from "react";
import { getSupporterSessionFromCookie } from "@/lib/supporter-auth";
import SupporterNav from "./SupporterNav";

export default async function SupporterLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSupporterSessionFromCookie();

  // Login and register pages don't require auth
  return (
    <div className="min-h-screen bg-bg-primary">
      <SupporterNav supporterName={session?.name} />
      {children}
    </div>
  );
}
