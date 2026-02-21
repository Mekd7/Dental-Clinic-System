"use server";

import { db } from "@/drizzle/db";
import { visits } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
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
