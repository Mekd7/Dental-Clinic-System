"use server";

import { db } from "@/drizzle/db";
import { examinationRecords } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- TYPES ---
type MedicalHistory = {
  cardiac: boolean;
  diabetic: boolean;
  allergy: boolean;
  giProblem: boolean;
  pregnant: boolean;
};

interface ExaminationContext {
  visitId: string;
  patientId: string;
  doctorId: string;
}

// --- HELPERS ---

/**
 * Ensures a database row exists for this visit before we try to update it.
 */
async function ensureRecord(context: ExaminationContext) {
  const existing = await db.query.examinationRecords.findFirst({
    where: eq(examinationRecords.visitId, context.visitId),
  });

  if (!existing) {
    await db.insert(examinationRecords).values({
      visitId: context.visitId,
      patientId: context.patientId,
      doctorId: context.doctorId,
    });
  }
}

/**
 * Refreshes the cache for the examination card and the queue.
 * This fixes the "Cannot find name" error.
 */
function revalidateExamRoutes(visitId: string) {
  // Since we moved it out of dashboard, the path is /examine/[id]
  revalidatePath(`/examine/${visitId}`); 
  revalidatePath("/dashboard/waiting-room");
}

// --- EXPORTED ACTIONS ---

export async function saveVitalsAction(
  data: ExaminationContext & {
    temp?: string;
    bp?: string;
    diabeticLevel?: string;
    chiefComplaint?: string;
    medicalHistory: MedicalHistory;
    otherMedicalHX?: string;
  },
) {
  try {
    await ensureRecord(data);

    await db
      .update(examinationRecords)
      .set({
        temp: data.temp || null,
        bp: data.bp || null,
        diabeticLevel: data.diabeticLevel || null,
        chiefComplaint: data.chiefComplaint || null,
        medicalHistory: data.medicalHistory,
        otherMedicalHX: data.otherMedicalHX || null,
      })
      .where(eq(examinationRecords.visitId, data.visitId));

    revalidateExamRoutes(data.visitId);
    return { success: true };
  } catch (error) {
    console.error("Vitals Save Error:", error);
    return { success: false, error: "Could not save vitals." };
  }
}

export async function saveDentalChartAction(
  data: ExaminationContext & {
    toothMap: Record<string, string> | null;
  },
) {
  try {
    await ensureRecord(data);

    await db
      .update(examinationRecords)
      .set({
        toothMap: data.toothMap || {}, 
      })
      .where(eq(examinationRecords.visitId, data.visitId));

    revalidateExamRoutes(data.visitId);
    return { success: true };
  } catch (error) {
    console.error("Chart Save Error:", error);
    return { success: false, error: "Could not save chart." };
  }
}

export async function saveAssessmentAction(
  data: ExaminationContext & {
    extraOralExam?: string;
    intraOralExam?: string;
    missedTeeth?: string;
    mobileTeethDeg?: string;
    cariesClass?: string;
    rctDone?: boolean;
    fillingTeeth?: string;
  },
) {
  try {
    await ensureRecord(data);

    await db
      .update(examinationRecords)
      .set({
        extraOralExam: data.extraOralExam || null,
        intraOralExam: data.intraOralExam || null,
        missedTeeth: data.missedTeeth || null,
        mobileTeethDeg: data.mobileTeethDeg || null,
        cariesClass: data.cariesClass || null,
        rctDone: data.rctDone ?? false,
        fillingTeeth: data.fillingTeeth || null,
      })
      .where(eq(examinationRecords.visitId, data.visitId));

    revalidateExamRoutes(data.visitId);
    return { success: true };
  } catch (error) {
    console.error("Assessment Save Error:", error);
    return { success: false, error: "Could not save assessment." };
  }
}

export async function savePlanAction(
  data: ExaminationContext & {
    diagnosis?: string;
    treatmentPlan?: string;
    treatmentDone?: string;
    remark?: string;
  },
) {
  try {
    await ensureRecord(data);

    await db
      .update(examinationRecords)
      .set({
        diagnosis: data.diagnosis || null,
        treatmentPlan: data.treatmentPlan || null,
        treatmentDone: data.treatmentDone || null,
        remark: data.remark || null,
      })
      .where(eq(examinationRecords.visitId, data.visitId));

    revalidateExamRoutes(data.visitId);
    return { success: true };
  } catch (error) {
    console.error("Plan Save Error:", error);
    return { success: false, error: "Could not save plan." };
  }
}