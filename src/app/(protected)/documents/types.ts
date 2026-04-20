export const CATEGORIES = [
  { key: "musik",     label: "Musik",          emoji: "🎵" },
  { key: "tracht",   label: "Trachteninfos",  emoji: "👗" },
  { key: "auftritte",label: "Auftrittspläne", emoji: "📋" },
  { key: "intern",   label: "Intern",          emoji: "🔒" },
  { key: "sonstiges",label: "Sonstiges",       emoji: "📎" },
] as const;

export type DocumentRow = {
  id: string;
  title: string;
  category: string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  is_admin_only: boolean;
  created_at: string;
  url: string;
};
