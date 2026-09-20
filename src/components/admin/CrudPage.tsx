"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { Plus, Edit, Trash2, X, Loader2, Save } from "lucide-react";

interface Field {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "select" | "multiselect" | "json";
  required?: boolean;
  options?: { value: string; label: string }[];
  span?: 1 | 2;
}

interface CrudPageProps {
  title: string;
  description: string;
  apiBase: string;
  fields: Field[];
  tableColumns: { key: string; label: string; render?: (val: unknown, row: Record<string, unknown>) => React.ReactNode }[];
  permission?: string;
}

export default function CrudPage({ title, description, apiBase, fields, tableColumns }: CrudPageProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = useCallback(() => {
    return fetch(apiBase)
      .then((res) => res.json())
      .then((data) => {
        const key = Object.keys(data).find((k) => Array.isArray(data[k]));
        setItems(key ? data[key] : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiBase]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function getEmptyForm(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.type === "checkbox") obj[f.name] = true;
      else if (f.type === "number") obj[f.name] = 0;
      else if (f.type === "json") obj[f.name] = "{}";
      else if (f.type === "multiselect") obj[f.name] = [];
      else obj[f.name] = "";
    });
    return obj;
  }

  function openNew() { setError(""); setForm(getEmptyForm()); setEditing({}); setIsNew(true); }

  function openEdit(item: Record<string, unknown>) {
    const f: Record<string, unknown> = {};
    fields.forEach((field) => {
      if (field.type === "json") {
        f[field.name] = JSON.stringify(item[field.name] ?? {}, null, 2);
      } else if (field.type === "multiselect") {
        f[field.name] = Array.isArray(item[field.name]) ? [...(item[field.name] as string[])] : [];
      } else {
        f[field.name] = item[field.name] ?? (field.type === "checkbox" ? true : "");
      }
    });
    setError(""); setForm(f); setEditing(item); setIsNew(false);
  }

  function close() { setEditing(null); setIsNew(false); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form };
      for (const field of fields) {
        if (field.type === "json") {
          try { payload[field.name] = JSON.parse(String(form[field.name] || "{}")); }
          catch { throw new Error(`${field.label} must contain valid JSON.`); }
        }
      }
      const url = isNew ? apiBase : `${apiBase}/${editing!.id as string}`;
      const method = isNew ? "POST" : "PATCH";
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to save changes. Please try again.");
      }
      close(); await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    fetchItems();
  }

  const inputCls = "w-full rounded-lg border border-border-strong bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary">{title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-text-on-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>

      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">No items yet. Click &quot;Add New&quot; to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-tertiary">
                  {tableColumns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase">{col.label}</th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-tertiary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id as string} className="hover:bg-bg-tertiary/50">
                    {tableColumns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-text-secondary">
                        {col.render ? col.render(item[col.key], item) : <>{String(item[col.key] ?? "—")}</>}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button aria-label={`Edit ${item.name || item.title || title}`} onClick={() => openEdit(item)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(item.id as string)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-error/10 hover:text-error"><Trash2 className="h-4 w-4" /></button>
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
          <div role="dialog" aria-modal="true" aria-label={isNew ? `Add ${title}` : `Edit ${title}`} className="w-full max-w-3xl rounded-2xl bg-surface border border-border p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text-primary">{isNew ? `Add ${title}` : `Edit ${title}`}</h2>
              <button onClick={close} className="text-text-muted hover:text-text-primary"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p role="alert" className="text-sm text-error">{error}</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((field) => {
                  const spanCls = field.span === 2 ? "sm:col-span-2" : "";
                  if (field.type === "checkbox") return (
                    <div key={field.name} className={`flex items-center gap-2 ${spanCls}`}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form[field.name] as boolean} onChange={(e) => setForm({ ...form, [field.name]: e.target.checked })} className="rounded" />
                        <span className="text-sm text-text-secondary">{field.label}</span>
                      </label>
                    </div>
                  );
                  if (field.type === "select") return (
                    <div key={field.name} className={spanCls}>
                      <label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">{field.label}</label>
                      <select value={form[field.name] as string} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className={inputCls}>
                        {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  );
                  if (field.type === "multiselect") {
                    const selected = (form[field.name] as string[]) || [];
                    return (
                      <div key={field.name} className={spanCls}>
                        <label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">{field.label}</label>
                        <div className="flex flex-wrap gap-2">
                          {field.options?.map((opt) => {
                            const checked = selected.includes(opt.value);
                            return (
                              <button
                                type="button"
                                key={opt.value}
                                aria-pressed={checked}
                                onClick={() => setForm({
                                  ...form,
                                  [field.name]: checked
                                    ? selected.filter((v) => v !== opt.value)
                                    : [...selected, opt.value],
                                })}
                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                  checked
                                    ? "border-accent bg-accent-subtle text-accent-text"
                                    : "border-border-strong bg-bg-primary text-text-secondary hover:border-accent/50"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  if (field.type === "json") return (
                    <div key={field.name} className={spanCls}>
                      <label htmlFor={`field-${field.name}`} className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">{field.label}</label>
                      <textarea id={`field-${field.name}`} value={String(form[field.name] || "{}")} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} rows={14} spellCheck={false} className={`${inputCls} font-mono`} />
                    </div>
                  );
                  if (field.type === "textarea") return (
                    <div key={field.name} className={spanCls}>
                      <label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">{field.label}</label>
                      <textarea value={(form[field.name] as string) || ""} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} rows={2} className={inputCls} />
                    </div>
                  );
                  return (
                    <div key={field.name} className={spanCls}>
                      <label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase">{field.label}</label>
                      <input type={field.type || "text"} value={(form[field.name] as string) || ""} onChange={(e) => setForm({ ...form, [field.name]: field.type === "number" ? parseInt(e.target.value) || 0 : e.target.value })} required={field.required} className={inputCls} />
                    </div>
                  );
                })}
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
