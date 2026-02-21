"use server";

import { PatientService } from "../../services/patients-service";
import { revalidatePath } from "next/cache";

export async function registerPatientAction(formData: any) {
  try {
    const clinicId = "default-clinic-id"; // Eventually from auth

    // 1. Check for existing patient (Logic handled by Service)
    const existing = await PatientService.findByPhone(formData.phone);
    if (existing) {
      return { success: false, error: "Phone number already registered." };
    }

    // 2. Register the patient (Logic handled by Service)
    const newPatient = await PatientService.register({
      ...formData,
      age: parseInt(formData.age),
      clinicId: clinicId,
    });

    revalidatePath("/dashboard/patients");

    return { success: true, id: newPatient.id };
  } catch (error) {
    console.error("Action Error:", error);
    return { success: false, error: "Failed to create patient." };
  }
}
