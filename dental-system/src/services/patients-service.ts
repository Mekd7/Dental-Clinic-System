import { db } from "@/drizzle/db";
import { patients, users, clinics, paymentPlans } from "@/drizzle/schema";
import { desc, eq, and } from "drizzle-orm";

export const PatientService = {
  // 1. Generate Next Card ID
  async generateNextCardId() {
    const lastPatient = await db.query.patients.findFirst({
      orderBy: [desc(patients.createdAt)],
    });

    if (!lastPatient) return "DC-1001";

    const lastId = lastPatient.cardId;
    const parts = lastId.split('-');
    const lastNumber = parts.length > 1 ? parseInt(parts[1]) : 1000;
    return `DC-${lastNumber + 1}`;
  },

  // 2. Register Patient
  async register(data: any) {
    const nextCardId = await this.generateNextCardId();
    const [newPatient] = await db.insert(patients).values({
      ...data,
      cardId: nextCardId,
    }).returning();
    return newPatient;
  },

  // 3. Get Directory (Fixes Error #1)
  async getDirectory(clinicId: string) {
    return await db.query.patients.findMany({
      where: eq(patients.clinicId, clinicId),
      with: {
        paymentPlan: true,
      },
      orderBy: [desc(patients.createdAt)],
    });
  },

  // 4. Get Doctors for Check-in
async getDoctors(clinicId: string) {
  console.log("Searching for Doctors in Clinic:", clinicId);
  
  const allUsers = await db.select().from(users);
  console.log("Total Users in DB:", allUsers.length);
  
  const clinicDoctors = allUsers.filter(u => 
    u.clinicId === clinicId && u.role === 'DOCTOR'
  );
  
  console.log("Matched Doctors:", clinicDoctors);
  return clinicDoctors;
},

  // 5. Find by Phone
  async findByPhone(phone: string) {
    return await db.query.patients.findFirst({
      where: eq(patients.phone, phone),
    });
  }
};