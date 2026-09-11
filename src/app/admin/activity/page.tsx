"use client";
import { useState, useEffect } from "react";
import { Activity } from "lucide-react";

interface LogEntry {
  id: string; action: string; entity: string; entityId: string;
  ip: string; userAgent: string; createdAt: string;
  user: { name: string; email: string } | null;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/audit");
    const data = await res.json();
    setLogs(data.logs || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="p-8 text-text-secondary">Loading audit log...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Activity className="h-6 w-6" /> Activity Log
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Recent admin actions (last 200 entries)</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Time</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">User</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Action</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Entity</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-bg-secondary/50">
                <td className="px-4 py-3 text-text-secondary text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">{l.user?.name || l.user?.email || "System"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    l.action === "CREATE" ? "bg-success/10 text-success-text" :
                    l.action === "DELETE" ? "bg-error/10 text-error" :
                    l.action === "LOGIN" ? "bg-info/10 text-info-text" : "bg-accent/10 text-accent"
                  }`}>{l.action}</span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{l.entity}{l.entityId ? ` #${l.entityId.slice(0, 8)}` : ""}</td>
                <td className="px-4 py-3 text-text-muted text-xs font-mono">{l.ip || "-"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-text-muted">No activity logged yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
