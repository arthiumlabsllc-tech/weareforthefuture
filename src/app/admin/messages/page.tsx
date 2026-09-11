"use client";
import { useState, useEffect } from "react";
import { Mail, MailOpen, Archive, CheckCircle } from "lucide-react";

interface Message {
  id: string; name: string; email: string; phone: string; subject: string; message: string;
  status: string; createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  async function load() {
    const res = await fetch("/api/admin/messages");
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (loading) return <div className="p-8 text-text-secondary">Loading messages...</div>;

  const unread = messages.filter((m) => m.status === "unread").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Mail className="h-6 w-6" /> Messages
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{unread} unread of {messages.length} total</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">From</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Subject</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Date</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {messages.map((m) => (
              <tr key={m.id} className={`hover:bg-bg-secondary/50 ${m.status === "unread" ? "font-medium" : ""}`}>
                <td className="px-4 py-3">
                  <div>{m.name}</div>
                  <div className="text-xs text-text-muted">{m.email}</div>
                </td>
                <td className="px-4 py-3">{m.subject || "(No subject)"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    m.status === "unread" ? "bg-primary/10 text-primary" :
                    m.status === "replied" ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent"
                  }`}>{m.status}</span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{new Date(m.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setSelected(m)} className="rounded p-1 hover:bg-bg-tertiary text-accent" title="View">
                      <MailOpen className="h-4 w-4" />
                    </button>
                    {m.status === "unread" && (
                      <button onClick={() => updateStatus(m.id, "read")} className="rounded p-1 hover:bg-bg-tertiary text-text-secondary" title="Mark read">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => updateStatus(m.id, "archived")} className="rounded p-1 hover:bg-bg-tertiary text-text-muted" title="Archive">
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-text-muted">No messages</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text-primary mb-1">{selected.subject || "(No subject)"}</h2>
            <p className="text-sm text-text-secondary mb-4">From {selected.name} ({selected.email})</p>
            {selected.phone && <p className="text-sm text-text-secondary mb-2">Phone: {selected.phone}</p>}
            <div className="rounded-lg bg-bg-primary border border-border p-4 text-sm text-text-primary whitespace-pre-wrap">
              {selected.message}
            </div>
            <p className="mt-4 text-xs text-text-muted">{new Date(selected.createdAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
