import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/admin-auth";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <AdminSidebar session={session} />
      <main className="flex-1 lg:ml-64">
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
              src="/images/team/exec-kezia.png"
              alt="Admin"
              className="h-8 w-8 rounded-full object-cover"
            />
          </div>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
