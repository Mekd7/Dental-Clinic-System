import { db } from "../../../drizzle/db";
import { users, clinics } from "../../../drizzle/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET() {
  const CLINIC_ID = "default-clinic-id";
  const DOCTOR_ID = "mock-doctor-id";

  try {
    // 1. Clean start: Check if clinic exists
    const existingClinic = await db.select().from(clinics).where(eq(clinics.id, CLINIC_ID));
    
    if (existingClinic.length === 0) {
      await db.insert(clinics).values({
        id: CLINIC_ID,
        name: "Golden Dental Speciality Clinic",
      });
    }

    // 2. Insert/Update Doctor
    // We use .onConflictDoUpdate to ensure it's there even if you run this 100 times
    await db.insert(users)
      .values({
        id: DOCTOR_ID,
        name: "Dr. Abel Solomon",
        email: "doctor@golden.com",
        role: "DOCTOR", // MUST BE UPPERCASE
        clinicId: CLINIC_ID,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: { role: "DOCTOR", clinicId: CLINIC_ID }
      });

    return NextResponse.json({ 
      success: true, 
      message: "Seeded Dr. Abel Solomon into default-clinic-id" 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}