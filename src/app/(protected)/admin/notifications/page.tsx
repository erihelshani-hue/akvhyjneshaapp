import { getTodayBirthdays } from "./actions";
import { NotificationsPanel } from "./NotificationsPanel";

export default async function NotificationsPage() {
  const todayBirthdays = await getTodayBirthdays();

  return <NotificationsPanel todayBirthdays={todayBirthdays} />;
}
