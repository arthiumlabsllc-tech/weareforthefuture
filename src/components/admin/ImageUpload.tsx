"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export default function ImageUpload({ value, onChange, folder = "ftf", label = "Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);

      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {value && (
        <div className="relative mb-2">
          <img src={value} alt="" className="h-32 w-auto rounded-lg border border-slate-200 object-cover" />
          <button type="button" onClick={() => onChange("")} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-50">
            <X className="h-4 w-4 text-red-500" />
          </button>
        </div>
      )}
      <label className={`flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg px-4 py-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
        {uploading ? <Loader2 className="h-5 w-5 text-blue-500 animate-spin" /> : <Upload className="h-5 w-5 text-slate-400" />}
        <span className="text-sm text-slate-600">{uploading ? "Uploading..." : value ? "Replace image" : "Upload image"}</span>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
    </div>
  );
}
