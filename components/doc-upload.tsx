"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileText, Loader2, UploadCloud } from "lucide-react";
import { LanaMark, LANA_GRADIENT } from "./lana";
import { useStore } from "@/lib/store";
import type { KnowledgeDoc } from "@/lib/knowledge";
import { cn, relLabel } from "@/lib/utils";

/** Light-touch document upload for members and sponsors. Files go to Lana for reading. */
export function DocUpload({ owner, by, hint, compact }: { owner: KnowledgeDoc["owner"]; by: string; hint: string; compact?: boolean }) {
  const docs = useStore((s) => s.documents).filter((d) => d.owner.id === owner.id);
  const addDocument = useStore((s) => s.addDocument);
  const toast = useStore((s) => s.toast);
  const input = useRef<HTMLInputElement>(null);

  const ingest = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const kb = f.size / 1024;
      addDocument({ name: f.name, size: kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`, owner, by });
    });
    toast({ title: "Uploaded", body: "Lana is reading your document now.", tone: "info" });
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a document"
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          ingest(e.dataTransfer.files);
        }}
        className={cn("flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-line px-5 transition hover:border-[#8A7BE8]/60", compact ? "py-4" : "py-6")}
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper">
          <UploadCloud size={18} className="text-navy" />
        </span>
        <div className="flex-1">
          <div className="text-[14px] font-medium text-navy">Drop a file or click to upload</div>
          <div className="text-[12px] text-faint">{hint}</div>
        </div>
        <LanaMark size={22} />
        <input ref={input} type="file" multiple className="hidden" onChange={(e) => ingest(e.target.files)} />
      </div>
      <ul className="mt-3 space-y-2">
        <AnimatePresence initial={false}>
          {docs.slice(0, 4).map((d) => (
            <motion.li key={d.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-hair px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <FileText size={14} className="shrink-0 text-faint" />
                <span className="flex-1 truncate text-[13px] text-navy">{d.name}</span>
                {d.status === "Indexed" ? (
                  <span className="flex items-center gap-1 text-[11.5px] text-ok">
                    <Check size={12} /> Read by Lana
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11.5px] text-muted">
                    <Loader2 size={12} className="animate-spin" /> {d.status}…
                  </span>
                )}
              </div>
              {d.status !== "Indexed" ? (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-stone">
                  <motion.div className="h-full rounded-full" style={{ background: LANA_GRADIENT }} animate={{ width: `${d.progress}%` }} />
                </div>
              ) : (
                <div className="mt-1 text-[11.5px] text-faint">
                  {d.facts.slice(0, 2).map((f) => `${f.label}: ${f.value}`).join(" · ")} · {relLabel(d.uploaded)}
                </div>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
