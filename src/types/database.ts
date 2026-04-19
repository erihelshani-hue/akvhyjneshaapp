export type Role = "admin" | "member";
export type AttendanceStatus = "yes" | "no" | "maybe";
export type EntityType = "rehearsal" | "event";
export type EventType = "performance" | "wedding" | "festival" | "other";
export type RecurrenceDay = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  language_preference: string;
  created_at: string;
}

export interface Rehearsal {
  id: string;
  title: string;
  date: string;
  time: string;
  end_date: string | null;
  end_time: string | null;
  location: string;
  notes: string | null;
  is_recurring: boolean;
  recurrence_day: RecurrenceDay | null;
  recurrence_time: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  end_date: string | null;
  end_time: string | null;
  location: string;
  event_type: EventType;
  dress_code: string | null;
  meetup_time: string | null;
  location_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  entity_date: string | null;
  status: AttendanceStatus;
  created_at: string;
}

export interface AttendanceWithProfile extends Attendance {
  profiles: Profile;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  created_by: string | null;
  created_at: string;
}

export interface AnnouncementRead {
  id: string;
  user_id: string;
  announcement_id: string;
  read_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface RehearsalOccurrence {
  rehearsal: Rehearsal;
  date: string;
  isRecurring: boolean;
}

export type RehearsalInsert = Omit<
  Rehearsal,
  "id" | "created_at" | "end_date" | "end_time"
> & {
  end_date?: string | null;
  end_time?: string | null;
};

export type EventInsert = Omit<
  Event,
  "id" | "created_at" | "end_date" | "end_time"
> & {
  end_date?: string | null;
  end_time?: string | null;
};

export type AnnouncementInsert = Omit<
  Announcement,
  "id" | "created_at"
>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      rehearsals: {
        Row: Rehearsal;
        Insert: RehearsalInsert;
        Update: Partial<Omit<Rehearsal, "id" | "created_at">>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: Partial<Omit<Event, "id" | "created_at">>;
        Relationships: [];
      };
      attendances: {
        Row: Attendance;
        Insert: Omit<Attendance, "id" | "created_at">;
        Update: Partial<Omit<Attendance, "id" | "created_at">>;
        Relationships: [];
      };
      announcements: {
        Row: Announcement;
        Insert: AnnouncementInsert;
        Update: Partial<Omit<Announcement, "id" | "created_at">>;
        Relationships: [];
      };
      announcement_reads: {
        Row: AnnouncementRead;
        Insert: Omit<AnnouncementRead, "id" | "read_at">;
        Update: never;
        Relationships: [];
      };
      push_subscriptions: {
        Row: PushSubscription;
        Insert: Omit<PushSubscription, "id" | "created_at">;
        Update: Partial<Omit<PushSubscription, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
