import type { Announcement, Event, Profile, Rehearsal } from "@/types/database";

export const DEV_USER: Profile = {
  id: "dev-user-id",
  full_name: "Dev Admin",
  email: "dev@akv-hyjnesha.com",
  role: "admin",
  avatar_url: null,
  language_preference: "de",
  created_at: "2025-01-01T00:00:00Z",
  birthday: null,
};

export const MOCK_REHEARSALS: Rehearsal[] = [
  {
    id: "reh-1",
    title: "Wöchentliche Probe",
    date: "2026-04-21",
    time: "19:00:00",
    end_date: null,
    end_time: "21:00:00",
    location: "Kulturzentrum Graz, Saal 3",
    notes: "Bitte pünktlich erscheinen. Kostüme mitbringen.",
    is_recurring: true,
    recurrence_day: "MON",
    recurrence_time: "19:00:00",
    created_by: "dev-user-id",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "reh-2",
    title: "Sonderprobe Festival Vorbereitung",
    date: "2026-04-26",
    time: "10:00:00",
    end_date: null,
    end_time: "13:00:00",
    location: "Stadthalle Graz",
    notes: "Generalprobe für das Frühjahresfestival.",
    is_recurring: false,
    recurrence_day: null,
    recurrence_time: null,
    created_by: "dev-user-id",
    created_at: "2026-01-15T00:00:00Z",
  },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "Frühjahresfestival Graz 2026",
    date: "2026-05-10",
    time: "18:00:00",
    end_date: null,
    end_time: "21:00:00",
    location: "Grazer Congress, Stefaniensaal",
    event_type: "festival",
    dress_code: "Albanische Volkstracht",
    meetup_time: "16:30:00",
    location_url: "https://maps.google.com/?q=Grazer+Congress",
    notes: "Großes Frühjahresfest mit albanischen Ensembles aus ganz Österreich.",
    created_by: "dev-user-id",
    created_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "evt-2",
    title: "Sommerabend der Diaspora",
    date: "2026-05-23",
    time: "15:00:00",
    end_date: null,
    end_time: "18:00:00",
    location: "Eventlocation Riverside, Graz",
    event_type: "other",
    dress_code: "Weiße Volkstracht",
    meetup_time: "14:00:00",
    location_url: null,
    notes: null,
    created_by: "dev-user-id",
    created_at: "2026-02-10T00:00:00Z",
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "Neue Probenzeiten ab Mai",
    body: "Ab dem 1. Mai ändern sich die Probenzeiten auf Dienstag 19:30 Uhr. Bitte im Kalender vermerken.",
    created_by: "dev-user-id",
    created_at: "2026-04-15T10:00:00Z",
  },
  {
    id: "ann-2",
    title: "Kostüme bitte bis Freitag abholen",
    body: "Die neuen Kostüme für das Frühjahresfestival liegen bei Mimoza bereit. Bitte bis Freitag abholen.",
    created_by: "dev-user-id",
    created_at: "2026-04-12T14:00:00Z",
  },
  {
    id: "ann-3",
    title: "Willkommen im neuen System",
    body: "Das neue interne Koordinationssystem des AKV Hyjnesha ist jetzt aktiv. Bei Fragen bitte an den Admin wenden.",
    created_by: "dev-user-id",
    created_at: "2026-04-01T09:00:00Z",
  },
];

export const MOCK_MEMBERS: Profile[] = [
  DEV_USER,
  { id: "m2", full_name: "Mimoza Berisha", email: "mimoza@example.com", role: "member", avatar_url: null, language_preference: "de", created_at: "2025-03-15T00:00:00Z", birthday: null },
  { id: "m3", full_name: "Arben Krasniqi", email: "arben@example.com", role: "member", avatar_url: null, language_preference: "de", created_at: "2025-04-01T00:00:00Z", birthday: null },
  { id: "m4", full_name: "Fjolla Rama", email: "fjolla@example.com", role: "member", avatar_url: null, language_preference: "de", created_at: "2025-05-10T00:00:00Z", birthday: null },
  { id: "m5", full_name: "Blerim Hoxha", email: "blerim@example.com", role: "member", avatar_url: null, language_preference: "de", created_at: "2025-06-20T00:00:00Z", birthday: null },
];

export const DEV_READ_IDS = new Set(["ann-3"]);
