"use client";
import { useState, useEffect } from "react";
import { Users, MailOpen, Archive, CheckCircle } from "lucide-react";

interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  interest: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

const interestLabels: Record<string, string> = {
  teaching: "Teaching & Tutoring",
  tech: "Tech & Digital",
  marketing: "Marketing & Communications",
  fundraising: "Fundraising",
  healthcare: "Healthcare",
  creative: "Creative Arts",
  other: "Other",
};

const countryLabels: Record<string, string> = {
  ghana: "Ghana",
  nigeria: "Nigeria",
  us: "United States",
  other: "Other",
};

export default function AdminVolunteersPage() {
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VolunteerApplication | null>(null);

  async function load() {
    const res = await fetch("/api/admin/volunteers");
    const data = await res.json();
    setApplications(data.applications || []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch("/api/admin/volunteers");
      const data = await res.json();
      if (!active) return;
      setApplications(data.applications || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/volunteers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (selected?.id === id) setSelected({ ...selected, status });
    load();
  }

  if (loading)
    return <div className="p-8 text-text-secondary">Loading applications...</div>;

  const fresh = applications.filter((a) => a.status === "new").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Users className="h-6 w-6" /> Volunteer Applications
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {fresh} new of {applications.length} total
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Applicant</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Interest</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Country</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Date</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications.map((a) => (
              <tr
                key={a.id}
                className={`hover:bg-bg-secondary/50 ${a.status === "new" ? "font-medium" : ""}`}
              >
                <td className="px-4 py-3">
                  <div>{a.name}</div>
                  <div className="text-xs text-text-muted">{a.email}</div>
                </td>
                <td className="px-4 py-3">
                  {a.interest ? interestLabels[a.interest] || a.interest : "-"}
                </td>
                <td className="px-4 py-3">
                  {a.country ? countryLabels[a.country] || a.country : "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.status === "new"
                        ? "bg-primary/10 text-primary"
                        : a.status === "accepted"
                        ? "bg-success/10 text-success-text"
                        : "bg-accent/10 text-accent-text"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {new Date(a.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelected(a);
                        if (a.status === "new") updateStatus(a.id, "reviewed");
                      }}
                      className="rounded p-1 hover:bg-bg-tertiary text-accent-text"
                      title="View"
                    >
                      <MailOpen className="h-4 w-4" />
                    </button>
                    {a.status !== "accepted" && (
                      <button
                        onClick={() => updateStatus(a.id, "accepted")}
                        className="rounded p-1 hover:bg-bg-tertiary text-text-secondary"
                        title="Mark accepted"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(a.id, "archived")}
                      className="rounded p-1 hover:bg-bg-tertiary text-text-muted"
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                  No volunteer applications yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-text-primary mb-1">{selected.name}</h2>
            <p className="text-sm text-text-secondary mb-4">{selected.email}</p>
            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-text-muted">Interest:</span>{" "}
                <span className="text-text-primary">
                  {selected.interest ? interestLabels[selected.interest] || selected.interest : "-"}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Country:</span>{" "}
                <span className="text-text-primary">
                  {selected.country ? countryLabels[selected.country] || selected.country : "-"}
                </span>
              </div>
              {selected.phone && (
                <div className="col-span-2">
                  <span className="text-text-muted">Phone:</span>{" "}
                  <span className="text-text-primary">{selected.phone}</span>
                </div>
              )}
            </div>
            <div className="rounded-lg bg-bg-primary border border-border p-4 text-sm text-text-primary whitespace-pre-wrap">
              {selected.message || "(No message provided)"}
            </div>
            <p className="mt-4 text-xs text-text-muted">
              {new Date(selected.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
