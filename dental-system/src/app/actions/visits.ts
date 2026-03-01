"use server";

import { db } from "@/drizzle/db";
import { visits } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function startExaminationAction(visitId: string) {
  // 1. Update status to IN_PROGRESS
  await db
    .update(visits)
    .set({ status: "IN_PROGRESS" })
    .where(eq(visits.id, visitId));

  // 2. Refresh the queue
  revalidatePath("/dashboard/waiting-room");
  revalidatePath("/dashboard/queue");

  // 3. Redirect to the examination card
  redirect(`/dashboard/examine/${visitId}`);
}

export async function checkInAction(data: {
  patientId: string;
  doctorId: string;
  reason: string;
  clinicId: string;
}) {
  try {
    await db.insert(visits).values({
      patientId: data.patientId,
      doctorId: data.doctorId,
      reason: data.reason,
      clinicId: data.clinicId, // Will be "default-clinic-id" from the dialog
      status: "WAITING",
    });

    revalidatePath("/dashboard/queue");
    revalidatePath("/dashboard/waiting-room");
    revalidatePath("/dashboard/patients");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to check in" };
  }
}

export async function completeVisitAction(
  visitId: string,
  options?: { redirectTo?: string | null },
) {
  await db
    .update(visits)
    .set({ status: "COMPLETED" })
    .where(eq(visits.id, visitId));

  revalidatePath(`/dashboard/examine/${visitId}`);
  revalidatePath("/dashboard/waiting-room");
  revalidatePath("/dashboard/queue");

  if (options?.redirectTo === null) {
    return { success: true };
  }

  redirect(options?.redirectTo ?? "/dashboard/waiting-room");
}

export async function reopenVisitAction(visitId: string) {
  // Only allow reopening visits completed within the last 24 hours.
  // We do NOT change the status — the visit stays COMPLETED so it remains
  // visible in the "Completed Today" list. We just redirect the doctor
  // back to the examination page so they can make edits.
  const visit = await db.query.visits.findFirst({
    where: and(eq(visits.id, visitId), eq(visits.status, "COMPLETED")),
  });

  if (!visit) {
    redirect("/dashboard/completed-today");
  }

  const checkInTime = visit.checkInTime;
  if (checkInTime) {
    const hoursSince =
      (Date.now() - new Date(checkInTime).getTime()) / (1000 * 60 * 60);
    if (hoursSince > 24) {
      redirect("/dashboard/completed-today");
    }
  }

  revalidatePath("/dashboard/completed-today");
  revalidatePath(`/dashboard/examine/${visitId}`);

  redirect(`/dashboard/examine/${visitId}`);
}
