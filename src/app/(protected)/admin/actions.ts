"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cached-data";
import type { AttendanceStatus, EntityType } from "@/types/database";

async function requireAdmin() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || data?.role !== "admin") throw new Error("Unauthorized");
  return user;
}

function revalidateContributions() {
  revalidatePath("/admin");
  revalidatePath("/admin/contributions");
  revalidatePath("/members");
  revalidatePath("/settings");
}

function isMissingNotesColumn(error: { message?: string }) {
  return error.message?.includes("'notes' column") || error.message?.includes("member_contributions.notes");
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

// ─── Rehearsal / event title edit ───────────────────────────────────────────

export async function updateEntityTitle(
  type: "rehearsal" | "event",
  id: string,
  title: string,
) {
  await requireAdmin();
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Titel darf nicht leer sein");

  const supabase = await createServiceClient();
  const table = type === "rehearsal" ? "rehearsals" : "events";
  const tag = type === "rehearsal" ? CACHE_TAGS.rehearsals : CACHE_TAGS.events;

  const { error } = await supabase.from(table).update({ title: trimmed }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidateTag(tag);
  revalidatePath("/admin/archive");
  revalidatePath(`/admin/archive/${type}/${id}`);
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

  const payload = {
      user_id: userId,
      contribution_month: month,
      amount_due: amountDue,
      amount_paid: amountPaid,
      paid_at: amountPaid > 0 ? new Date().toISOString() : null,
      notes,
      updated_at: new Date().toISOString(),
    };

  const { error } = await supabase.from("member_contributions").upsert(
    payload,
    { onConflict: "user_id,contribution_month" }
  );

  if (error && isMissingNotesColumn(error)) {
    const payloadWithoutNotes = {
      user_id: payload.user_id,
      contribution_month: payload.contribution_month,
      amount_due: payload.amount_due,
      amount_paid: payload.amount_paid,
      paid_at: payload.paid_at,
      updated_at: payload.updated_at,
    };
    const retry = await supabase.from("member_contributions").upsert(
      payloadWithoutNotes,
      { onConflict: "user_id,contribution_month" }
    );

    if (retry.error) throw new Error(retry.error.message);
    revalidateContributions();
    return;
  }

  if (error) throw new Error(error.message);
  revalidateContributions();
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
  revalidateContributions();
}

export async function deleteContribution(userId: string, month: string) {
  await requireAdmin();
  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("member_contributions")
    .delete()
    .eq("user_id", userId)
    .eq("contribution_month", month);

  if (error) throw new Error(error.message);
  revalidateContributions();
}
