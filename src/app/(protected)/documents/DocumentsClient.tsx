"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { FileAudio, FileText, FileImage, File, Download, Trash2, Upload, Lock, Play, Pause, ExternalLink, Rewind, FastForward } from "lucide-react";
import { saveDocumentRecord, deleteDocument } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CATEGORIES, type DocumentRow } from "./types";

type CategoryDef = (typeof CATEGORIES)[number];

function getMimeIcon(mime: string | null) {
  if (!mime) return <File className="h-5 w-5" />;
  if (mime.startsWith("audio/")) return <FileAudio className="h-5 w-5 text-accent" />;
  if (mime === "application/pdf") return <FileText className="h-5 w-5 text-blue-400" />;
  if (mime.startsWith("image/")) return <FileImage className="h-5 w-5 text-emerald-400" />;
  return <File className="h-5 w-5 text-muted" />;
}

function isAudio(mime: string | null) {
  return !!mime?.startsWith("audio/");
}

// Module-level registry: ensures only one <audio> plays at a time across the page.
// Each mounted player registers its element here; when one starts playing it pauses all others.
const audioRegistry = new Set<HTMLAudioElement>();
function pauseOthers(except: HTMLAudioElement) {
  for (const el of audioRegistry) {
    if (el !== except && !el.paused) el.pause();
  }
}

function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function AudioPlayer({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    audioRegistry.add(el);
    return () => {
      audioRegistry.delete(el);
      el.pause();
    };
  }, []);

  async function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      pauseOthers(el);
      try {
        await el.play();
      } catch {
        // play() may reject on iOS without user gesture chain; state will sync via events.
      }
    } else {
      el.pause();
    }
  }

  function skip(delta: number) {
    const el = audioRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min((el.duration || 0), el.currentTime + delta));
    el.currentTime = next;
    setCurrentTime(next);
  }

  function onSeekInput(e: React.ChangeEvent<HTMLInputElement>) {
    setSeeking(true);
    setCurrentTime(Number(e.target.value));
  }

  function onSeekCommit(e: React.SyntheticEvent<HTMLInputElement>) {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Number(e.currentTarget.value);
    setSeeking(false);
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mt-2 rounded-lg bg-surface-2/60 px-3 py-2.5 space-y-2">
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        playsInline
        onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration || 0); setLoading(false); }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => { if (!seeking) setCurrentTime(e.currentTarget.currentTime); }}
        onPlay={(e) => { pauseOthers(e.currentTarget); setPlaying(true); }}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => skip(-10)}
          aria-label="10 Sekunden zurück"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-surface-3/60 transition-colors"
        >
          <Rewind className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Abspielen"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent hover:bg-accent/25 active:bg-accent/30 transition-colors"
        >
          {loading && !playing ? (
            <span className="h-3.5 w-3.5 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
          ) : playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 translate-x-px" />
          )}
        </button>

        <button
          type="button"
          onClick={() => skip(10)}
          aria-label="10 Sekunden vor"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-surface-3/60 transition-colors"
        >
          <FastForward className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-[11px] tabular-nums text-muted shrink-0 w-9 text-right">{fmtTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={onSeekInput}
            onPointerUp={onSeekCommit}
            onMouseUp={onSeekCommit}
            onTouchEnd={onSeekCommit}
            onKeyUp={onSeekCommit}
            disabled={!duration}
            aria-label="Position"
            className="audio-seek flex-1 h-6"
            style={{ ["--audio-pct" as string]: `${pct}%` }}
          />
          <span className="text-[11px] tabular-nums text-muted shrink-0 w-9">{fmtTime(duration)}</span>
        </div>
      </div>

      <style jsx>{`
        .audio-seek {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          touch-action: none;
        }
        .audio-seek::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 9999px;
          background: linear-gradient(
            to right,
            rgb(var(--accent-rgb, 99 102 241) / 0.9) 0%,
            rgb(var(--accent-rgb, 99 102 241) / 0.9) var(--audio-pct, 0%),
            rgb(255 255 255 / 0.1) var(--audio-pct, 0%),
            rgb(255 255 255 / 0.1) 100%
          );
        }
        .audio-seek::-moz-range-track {
          height: 4px;
          border-radius: 9999px;
          background: rgb(255 255 255 / 0.1);
        }
        .audio-seek::-moz-range-progress {
          height: 4px;
          border-radius: 9999px;
          background: currentColor;
        }
        .audio-seek::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: -7px;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: currentColor;
          color: rgb(var(--accent-rgb, 99 102 241));
          box-shadow: 0 1px 4px rgb(0 0 0 / 0.4);
          cursor: pointer;
        }
        .audio-seek::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          border: none;
          background: currentColor;
          color: rgb(var(--accent-rgb, 99 102 241));
          cursor: pointer;
        }
        .audio-seek:disabled {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

function DocumentCard({ doc, isAdmin, onDelete }: { doc: DocumentRow; isAdmin: boolean; onDelete: () => void }) {
  const audio = isAudio(doc.mime_type);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{getMimeIcon(doc.mime_type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
            {doc.is_admin_only && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted border border-border rounded-full px-1.5 py-0.5">
                <Lock className="h-2.5 w-2.5" /> Intern
              </span>
            )}
          </div>
          <p className="text-xs text-muted truncate mt-0.5">{doc.file_name}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            download={!audio}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors"
            title={audio ? "Öffnen" : "Herunterladen"}
          >
            {audio ? <ExternalLink className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
          </a>
          {isAdmin && (
            <button
              type="button"
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:text-red-400 hover:border-red-400/30 transition-colors"
              title="Löschen"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {audio && <AudioPlayer url={doc.url} />}
    </div>
  );
}

function UploadForm({ categories, onClose }: { categories: readonly CategoryDef[]; onClose: () => void }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0].key);
  const [adminOnly, setAdminOnly] = useState(false);
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !title.trim()) return;
    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      const supabase = createClient();
      const path = `${selectedCategory}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

      setProgress(30);
      const { error: storageError } = await supabase.storage.from("documents").upload(path, file);
      if (storageError) throw new Error(storageError.message);

      setProgress(80);
      const result = await saveDocumentRecord({
        title: title.trim(),
        category: selectedCategory,
        filePath: path,
        fileName: file.name,
        mimeType: file.type,
        isAdminOnly: adminOnly,
      });

      if (!result.ok) throw new Error(result.error);

      setProgress(100);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Upload");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-5 space-y-4">
      <p className="text-sm font-semibold text-foreground">Dokument hochladen</p>

      <div className="space-y-1">
        <label className="text-xs text-muted font-medium">Titel</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="z.B. Vallja e Përdrinit" className="w-full h-9 rounded-md border border-border bg-surface-2 px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50" />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted font-medium">Kategorie</label>
        <select
          name="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full h-9 rounded-md border border-border bg-surface-2 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
        >
          {categories.map((c) => (
            <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted font-medium">Datei</label>
        <input ref={fileRef} name="file" type="file" required accept=".pdf,.mp3,.wav,.ogg,.aac,.m4a,.jpg,.jpeg,.png,.webp,.docx,.xlsx" className="w-full text-sm text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border file:bg-surface-2 file:text-xs file:text-muted hover:file:text-foreground file:transition-colors" />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={adminOnly} onChange={(e) => setAdminOnly(e.target.checked)} className="rounded border-border accent-accent" />
        <span className="text-xs text-muted">Nur für Admins sichtbar</span>
      </label>

      {uploading && (
        <div className="space-y-1.5">
          <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted">Wird hochgeladen… {progress}%</p>
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={uploading} className="h-9 px-4 rounded-md bg-accent text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-opacity">
          {uploading ? "Läuft..." : "Hochladen"}
        </button>
        <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border border-border text-xs text-muted hover:text-foreground transition-colors">
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export function DocumentsClient({
  docs: initialDocs,
  isAdmin,
  categories,
}: {
  docs: DocumentRow[];
  isAdmin: boolean;
  categories: readonly CategoryDef[];
}) {
  const router = useRouter();
  const [docs, setDocs] = useState(initialDocs);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showUpload, setShowUpload] = useState(false);
  const [, startTransition] = useTransition();

  function handleDelete(doc: DocumentRow) {
    if (!window.confirm(`"${doc.title}" wirklich löschen?`)) return;
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    startTransition(async () => {
      try {
        await deleteDocument(doc.id, doc.file_path);
        router.refresh();
      } catch {
        setDocs(initialDocs);
      }
    });
  }

  const filtered = activeCategory === "all" ? docs : docs.filter((d) => d.category === activeCategory);

  return (
    <div className="space-y-5">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            activeCategory === "all"
              ? "border-accent/60 bg-accent/10 text-foreground font-medium"
              : "border-border text-muted hover:border-border-strong hover:text-foreground"
          }`}
        >
          Alle ({docs.length})
        </button>
        {categories.map((cat) => {
          const count = docs.filter((d) => d.category === cat.key).length;
          if (count === 0 && !isAdmin) return null;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat.key
                  ? "border-accent/60 bg-accent/10 text-foreground font-medium"
                  : "border-border text-muted hover:border-border-strong hover:text-foreground"
              }`}
            >
              {cat.emoji} {cat.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Upload button */}
      {isAdmin && !showUpload && (
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-md border border-border text-sm text-muted hover:text-foreground hover:border-border-strong transition-colors"
        >
          <Upload className="h-4 w-4" />
          Dokument hochladen
        </button>
      )}

      {showUpload && <UploadForm categories={categories} onClose={() => setShowUpload(false)} />}

      {/* Document grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted italic">Keine Dokumente in dieser Kategorie.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} isAdmin={isAdmin} onDelete={() => handleDelete(doc)} />
          ))}
        </div>
      )}
    </div>
  );
}
