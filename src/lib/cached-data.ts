import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Announcement, Database, Event, Rehearsal } from "@/types/database";

export const CACHE_TAGS = {
  announcements: "announcements",
  events: "events",
  rehearsals: "rehearsals",
} as const;

const LIST_REVALIDATE_SECONDS = 60;

function createReadClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export const getAnnouncementCount = unstable_cache(
  async () => {
    const supabase = createReadClient();
    const { count, error } = await supabase
      .from("announcements")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count ?? 0;
  },
  ["announcement-count"],
  { revalidate: LIST_REVALIDATE_SECONDS, tags: [CACHE_TAGS.announcements] }
);

export const getAllAnnouncements = unstable_cache(
  async () => {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Announcement[];
  },
  ["all-announcements"],
  { revalidate: LIST_REVALIDATE_SECONDS, tags: [CACHE_TAGS.announcements] }
);

export const getRecentAnnouncements = unstable_cache(
  async (limit: number) => {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as Announcement[];
  },
  ["recent-announcements"],
  { revalidate: LIST_REVALIDATE_SECONDS, tags: [CACHE_TAGS.announcements] }
);

export const getUpcomingEvents = unstable_cache(
  async (today: string) => {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", today)
      .eq("is_archived", false)
      .order("date");

    if (error) throw error;
    return (data ?? []) as Event[];
  },
  ["upcoming-events"],
  { revalidate: LIST_REVALIDATE_SECONDS, tags: [CACHE_TAGS.events] }
);

export const getEventById = unstable_cache(
  async (id: string) => {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as Event | null;
  },
  ["event-by-id"],
  { revalidate: LIST_REVALIDATE_SECONDS, tags: [CACHE_TAGS.events] }
);

export const getAllRehearsals = unstable_cache(
  async () => {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("rehearsals")
      .select("*")
      .eq("is_archived", false)
      .order("date");

    if (error) throw error;
    return (data ?? []) as Rehearsal[];
  },
  ["all-rehearsals"],
  { revalidate: LIST_REVALIDATE_SECONDS, tags: [CACHE_TAGS.rehearsals] }
);

export const getRehearsalById = unstable_cache(
  async (id: string) => {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("rehearsals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as Rehearsal | null;
  },
  ["rehearsal-by-id"],
  { revalidate: LIST_REVALIDATE_SECONDS, tags: [CACHE_TAGS.rehearsals] }
);
