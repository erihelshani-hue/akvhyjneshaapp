import webpush from "web-push";
import { createServiceClient } from "./supabase/server";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

type StoredPushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

type PushSendResult = {
  sent: number;
  removed: number;
  failed: number;
  total: number;
  errors: Array<{
    endpoint: string;
    statusCode: number | null;
    message: string;
  }>;
};

type WebPushSendError = {
  statusCode?: number;
  body?: string;
  message?: string;
};

function configureWebPush() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

function isExpiredSubscriptionError(error: unknown) {
  const statusCode = (error as WebPushSendError | null)?.statusCode;
  return statusCode === 404 || statusCode === 410;
}

async function sendToSubscriptions(
  subscriptions: StoredPushSubscription[] | null,
  payload: PushPayload
): Promise<PushSendResult> {
  const result: PushSendResult = {
    sent: 0,
    removed: 0,
    failed: 0,
    total: subscriptions?.length ?? 0,
    errors: [],
  };

  if (!subscriptions || subscriptions.length === 0) return result;

  configureWebPush();
  const supabase = await createServiceClient();

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
        result.sent += 1;
      } catch (error) {
        const pushError = error as WebPushSendError;
        if (isExpiredSubscriptionError(error)) {
          result.removed += 1;
          result.errors.push({
            endpoint: sub.endpoint,
            statusCode: pushError.statusCode ?? null,
            message: pushError.message ?? "Subscription expired or gone",
          });
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
          return;
        }

        result.failed += 1;
        result.errors.push({
          endpoint: sub.endpoint,
          statusCode: pushError.statusCode ?? null,
          message: pushError.message ?? pushError.body ?? "Unknown push send error",
        });
        console.error("[Push] sendNotification failed without removing subscription", {
          endpoint: sub.endpoint,
          error,
        });
      }
    })
  );

  return result;
}

export async function sendPushToAll(payload: PushPayload) {
  const supabase = await createServiceClient();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  if (error) {
    console.error("[Push] Failed to load push subscriptions", error);
    throw error;
  }

  return sendToSubscriptions(subscriptions, payload);
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const supabase = await createServiceClient();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    console.error("[Push] Failed to load user push subscriptions", { userId, error });
    throw error;
  }

  return sendToSubscriptions(subscriptions, payload);
}
