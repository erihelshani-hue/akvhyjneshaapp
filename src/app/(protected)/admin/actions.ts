"use server";

import { revalidateTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getUser, getUserRole } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cached-data";
import type { AttendanceStatus, EntityType } from "@/types/database";

async function requireAdmin() {
  const [role, user] = await Promise.all([getUserRole(), getUser()]);
  if (role !== "admin" || !user) throw new Error("Unauthorized");
  return user;
}

// ─── Archive / Restore ───────────────────────────────────────────────────────

export async function archiveEntity(
  type: "rehearsal" | "event",
  id: string,
  action: "archive" | "restore"
) {
  const user = await requireAdmin();
  const supabase = await createServiceClient();
  const table = type === "rehearsal" ? "rehearsals" : "events";
  const tag = type === "rehearsal" ? CACHE_TAGS.rehearsals : CACHE_TAGS.events;

  const { error } = await supabase
    .from(table)
    .update({
      is_archived: action === "archive",
      archived_at: action === "archive" ? new Date().toISOString() : null,
      archived_by: action === "archive" ? user.id : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateTag(tag);
}

// ─── Attendance correction ───────────────────────────────────────────────────

export async function updateAttendanceAdmin(
  entityType: EntityType,
  entityId: string,
  entityDate: string,
  userId: string,
  status: AttendanceStatus | null
) {
  await requireAdmin();
  const supabase = await createServiceClient();

  // Delete first (covers both update and remove cases)
  await supabase
    .from("attendances")
    .delete()
    .eq("user_id", userId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("entity_date", entityDate);

  if (status !== null) {
    const { error } = await supabase.from("attendances").insert({
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      entity_date: entityDate,
      status,
    });
    if (error) throw new Error(error.message);
  }
}

// ─── Member contributions ────────────────────────────────────────────────────

export async function upsertContribution(
  userId: string,
  month: string, // "YYYY-MM-01"
  amountDue: number,
  amountPaid: number,
  notes: string | null
) {
  await requireAdmin();
  const supabase = await createServiceClient();

  const { error } = await supabase.from("member_contributions").upsert(
    {
      user_id: userId,
      contribution_month: month,
      amount_due: amountDue,
      amount_paid: amountPaid,
      paid_at: amountPaid > 0 ? new Date().toISOString() : null,
      notes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,contribution_month" }
  );

  if (error) throw new Error(error.message);
}

export async function createMonthContributions(month: string, defaultAmountDue: number) {
  await requireAdmin();
  const supabase = await createServiceClient();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id");

  if (profilesError || !profiles) throw new Error("Failed to load profiles");

  const { error } = await supabase.from("member_contributions").upsert(
    profiles.map((p) => ({
      user_id: p.id,
      contribution_month: month,
      amount_due: defaultAmountDue,
      amount_paid: 0,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "user_id,contribution_month", ignoreDuplicates: true }
  );

  if (error) throw new Error(error.message);
}
