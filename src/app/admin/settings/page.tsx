"use client";
import { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";

interface Setting {
  id: string; key: string; value: unknown; description: string | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    const s: Setting[] = data.settings || [];
    setSettings(s);
    const e: Record<string, string> = {};
    s.forEach((item) => {
      e[item.key] = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
    });
    setEdits(e);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    setSaving(true);
    const updates = Object.entries(edits).map(([key, value]) => ({
      key, value: isNaN(Number(value)) || value === "" ? value : Number(value),
    }));
    await fetch("/api/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: updates }),
    });
    setSaving(false);
    load();
  }

  if (loading) return <div className="p-8 text-text-secondary">Loading settings...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Settings className="h-6 w-6" /> Site Settings
          </h1>
          <p className="mt-1 text-sm text-text-secondary">Manage global site configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-text-on-primary hover:bg-primary-hover disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="space-y-4">
        {settings.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-surface p-4">
            <label className="mb-1 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              {s.key.replace(/_/g, " ")}
            </label>
            {s.description && <p className="mb-2 text-xs text-text-muted">{s.description}</p>}
            <input
              type="text"
              value={edits[s.key] || ""}
              onChange={(e) => setEdits({ ...edits, [s.key]: e.target.value })}
              className="w-full rounded-lg border border-border-strong bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        ))}
        {settings.length === 0 && (
          <p className="text-center text-text-muted py-12">No settings configured yet</p>
        )}
      </div>
    </div>
  );
}
