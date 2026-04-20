/**
 * All date math uses UTC to stay consistent across server (UTC) and client.
 * Birthday strings are ISO dates "YYYY-MM-DD" stored in the database.
 */

export function isTodayBirthday(birthday: string): boolean {
  const [, bMonth, bDay] = birthday.split("-").map(Number);
  const now = new Date();
  return now.getUTCMonth() + 1 === bMonth && now.getUTCDate() === bDay;
}

export function daysUntilBirthday(birthday: string): number {
  const [, bMonth, bDay] = birthday.split("-").map(Number);
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  let next = Date.UTC(now.getUTCFullYear(), bMonth - 1, bDay);
  if (next < todayUTC) {
    next = Date.UTC(now.getUTCFullYear() + 1, bMonth - 1, bDay);
  }
  return Math.round((next - todayUTC) / 86_400_000);
}

/** Returns "15. April" format (day + month, no year) */
export function formatBirthdayShort(birthday: string): string {
  const [year, month, day] = birthday.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return date.toLocaleDateString("de-DE", { day: "numeric", month: "long", timeZone: "UTC" });
}

/** Builds the Albanian push notification body for birthday(s) */
export function buildBirthdayPushMessage(names: string[]): { title: string; body: string } {
  if (names.length === 1) {
    return {
      title: `🎂 Urime ditëlindjen, ${names[0]}!`,
      body: "Të urojmë shumë shëndet, gëzim dhe fat! 🎉🥳❤️",
    };
  }
  const last = names[names.length - 1];
  const rest = names.slice(0, -1).join(", ");
  return {
    title: `🎂 Sot kanë ditëlindjen ${rest} dhe ${last}`,
    body: "Urime ditëlindjen! 🎉🥳❤️",
  };
}
