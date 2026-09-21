"use client";

import { useState, useEffect, FormEvent } from "react";
import { prisma } from "@/lib/db";
import { Plus, Edit, Trash2, X, Loader2, Save, Eye, EyeOff } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image: string | null;
  department: string | null;
  country: string | null;
  email: string | null;
  linkedin: string | null;
  twitter: string | null;
  order: number;
  published: boolean;
}

const EMPTY: Omit<TeamMember, "id"> = {
  name: "", role: "", bio: "", image: "", department: "", country: "",
  email: "", linkedin: "", twitter: "", order: 0, published: true,
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<TeamMember, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    const res = await fetch("/api/admin/team");
    const data = await res.json();
    setMembers(data.members || []);
    setLoading(false);
  }

  function openNew() {
    setForm(EMPTY);
    setEditing({ id: "", ...EMPTY });
    setIsNew(true);
  }

  function openEdit(m: TeamMember) {
    setForm({ name: m.name, role: m.role, bio: m.bio || "", image: m.image || "", department: m.department || "", country: m.country || "", email: m.email || "", linkedin: m.linkedin || "", twitter: m.twitter || "", order: m.order, published: m.published });
    setEditing(m);
    setIsNew(false);
  }

  function close() { setEditing(null); setIsNew(false); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = isNew ? "/api/admin/team" : `/api/admin/team/${editing!.id}`;
    const method = isNew ? "POST" : "PATCH";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    close();
    fetchMembers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this team member?")) return;
    await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    fetchMembers();
  }

  const inputCls = "w-full rounded-lg border border-border-strong bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary">Team</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage team members</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-text-on-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">No team members yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-tertiary">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-tertiary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-bg-tertiary/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {m.image ? <img src={m.image} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-tertiary text-sm font-bold text-text-muted">{m.name.charAt(0)}</div>}
                        <span className="text-sm font-medium text-text-primary">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{m.role}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{m.country || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${m.published ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent-text"}`}>
                        {m.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {m.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(m)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(m.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-error/10 hover:text-error"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={close}>
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text-primary">{isNew ? "Add Team Member" : "Edit Member"}</h2>
              <button onClick={close} className="text-text-muted hover:text-text-primary"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">Role *</label><input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required className={inputCls} /></div>
              </div>
              <div><label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">Bio</label><textarea value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} className={inputCls} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">Image URL</label><input value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">Country</label><input value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputCls} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">Department</label><input value={form.department || ""} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">Email</label><input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">LinkedIn</label><input value={form.linkedin || ""} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className={inputCls} /></div>
                <div><label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">Twitter</label><input value={form.twitter || ""} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className={inputCls} /></div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded" /><span className="text-sm text-text-secondary">Published</span></label>
                <div className="flex-1"><label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">Order</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={close} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-tertiary">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-text-on-primary hover:bg-primary-hover disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
