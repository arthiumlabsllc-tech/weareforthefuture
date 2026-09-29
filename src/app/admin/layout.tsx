import { redirect } from "next/navigation";
import { getSessionFromCookie, type AdminSession } from "@/lib/admin-auth";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false, noarchive: true }, referrer: "no-referrer", openGraph: null, twitter: null };
import { img } from "@/lib/imageUrl";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: AdminSession | null;
  try { session = await getSessionFromCookie(); }
  catch { return <div role="alert" className="p-8">Admin access is temporarily unavailable. Please try again.</div>; }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <AdminSidebar session={session} />
      <div className="min-w-0 flex-1 lg:ml-64">
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              Welcome, <span className="font-semibold text-text-primary">{session.name || session.email}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            >
              View Site
            </a>
            <img
              src={img("/images/team/exec-kezia.png")}
              alt="Admin"
              className="h-8 w-8 rounded-full object-cover"
            />
          </div>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
