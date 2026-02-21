import { pgTable, text, integer, boolean, timestamp, real, json, pgEnum, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- 1. ENUMS ---
export const roleEnum = pgEnum('role', ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']);
export const paymentStatusEnum = pgEnum('payment_status', ['GREEN', 'YELLOW', 'RED']);
export const visitStatusEnum = pgEnum('visit_status', ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

// --- 2. TABLES ---

export const clinics = pgTable('clinics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
});

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: roleEnum('role').default('RECEPTIONIST'),
  clinicId: text('clinic_id').references(() => clinics.id),
  patientProfileId: text('patient_profile_id'), 
});

export const patients = pgTable('patients', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  cardId: varchar('card_id', { length: 50 }).unique().notNull(), // Permanent ID like DC-1001
  clinicId: text('clinic_id').notNull().references(() => clinics.id),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  sex: text('sex').notNull(),
  address: text('address'),
  subCity: text('sub_city'), 
  woreda: text('woreda'),
  phone: text('phone').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const visits = pgTable('visits', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text('patient_id').notNull().references(() => patients.id),
  clinicId: text('clinic_id').notNull().references(() => clinics.id),
  doctorId: text('doctor_id').notNull().references(() => users.id), // Assigned to specific doctor
  status: visitStatusEnum('status').default('WAITING'),
  reason: text('reason'), 
  checkInTime: timestamp('check_in_time').defaultNow(),
});

export const examinationRecords = pgTable('examination_records', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text('patient_id').notNull().references(() => patients.id),
  visitId: text('visit_id').notNull().references(() => visits.id), // Tied to today's visit
  doctorId: text('doctor_id').notNull().references(() => users.id), // The doctor performing the exam
  date: timestamp('date').defaultNow(),
  
  // Medical Data (Vitals)
  temp: text('temp'),
  bp: text('bp'),
  diabeticLevel: text('diabetic_level'),
  
  // Clinical Findings
  chiefComplaint: text('chief_complaint'),
  extraOralExam: text('extra_oral_exam'),
  intraOralExam: text('intra_oral_exam'),
  
  // Medical History (JSON for flexibility)
  medicalHistory: json('medical_history').$type<{
    cardiac: boolean; 
    diabetic: boolean; 
    allergy: boolean; 
    giProblem: boolean; 
    pregnant: boolean;
  }>(),
  otherMedicalHX: text('other_medical_hx'),

  // Dental History 
  missedTeeth: text('missed_teeth'),
  mobileTeethDeg: text('mobile_teeth_deg'),
  cariesClass: text('caries_class'),
  rctDone: boolean('rct_done').default(false),
  prosthesis: text('prosthesis'),
  fillingTeeth: text('filling_teeth'),

  // Diagnosis & Plan
  diagnosis: text('diagnosis'),
  treatmentPlan: text('treatment_plan'),
  treatmentDone: text('treatment_done'),
  remark: text('remark'),
  
  // Visual Chart
  toothMap: json('tooth_map').$type<Record<string, string>>().default({}),
});

export const paymentPlans = pgTable('payment_plans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text('patient_id').notNull().unique().references(() => patients.id),
  clinicId: text('clinic_id').notNull().references(() => clinics.id),
  totalContractValue: real('total_contract_value').notNull(),
  totalPaid: real('total_paid').default(0),
  balanceRemaining: real('balance_remaining').notNull(),
  status: paymentStatusEnum('status').default('GREEN'),
  lastPaymentDate: timestamp('last_payment_date'),          
  firstPaymentDate: timestamp('first_payment_date'),
  contractStartDate: timestamp('contract_start_date').defaultNow(),
});

export const installments = pgTable('installments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  paymentPlanId: text('payment_plan_id').notNull().references(() => paymentPlans.id),
  amountPaid: real('amount_paid').notNull(),
  datePaid: timestamp('date_paid').defaultNow(),
  paymentMethod: text('payment_method').notNull(),
});

export const appointments = pgTable('appointments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text('patient_id').notNull().references(() => patients.id),
  clinicId: text('clinic_id').notNull().references(() => clinics.id),
  date: timestamp('date').notNull(),
  purpose: text('purpose').notNull(),
  status: text('status').default('SCHEDULED'),
});



// --- 3. RELATIONS (Strictly Typed for One-to-One) ---

export const patientsRelations = relations(patients, ({ one, many }) => ({
  clinic: one(clinics, { 
    fields: [patients.clinicId], 
    references: [clinics.id] 
  }),
  records: many(examinationRecords),
  visits: many(visits),
  // Explicitly mapping the 1:1 relation from the Patient side
  paymentPlan: one(paymentPlans, {
    fields: [patients.id],
    references: [paymentPlans.patientId],
    relationName: "patient_payment_plan"
  }),
}));

export const visitRelations = relations(visits, ({ one }) => ({
  patient: one(patients, { 
    fields: [visits.patientId], 
    references: [patients.id] 
  }),
  doctor: one(users, { 
    fields: [visits.doctorId], 
    references: [users.id] 
  }),
  // Explicitly mapping the 1:1 relation from the Visit side
  record: one(examinationRecords, {
    fields: [visits.id],
    references: [examinationRecords.visitId],
    relationName: "visit_record"
  }),
}));

export const recordsRelations = relations(examinationRecords, ({ one }) => ({
  patient: one(patients, { 
    fields: [examinationRecords.patientId], 
    references: [patients.id] 
  }),
  // The side that HOLDS the foreign key (visitId)
  visit: one(visits, { 
    fields: [examinationRecords.visitId], 
    references: [visits.id],
    relationName: "visit_record" 
  }),
  doctor: one(users, { 
    fields: [examinationRecords.doctorId], 
    references: [users.id] 
  }),
}));

export const paymentPlansRelations = relations(paymentPlans, ({ one, many }) => ({
  // The side that HOLDS the foreign key (patientId)
  patient: one(patients, { 
    fields: [paymentPlans.patientId], 
    references: [patients.id],
    relationName: "patient_payment_plan"
  }),
  installments: many(installments),
}));
// --- 4. TYPES ---
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;
export type User = typeof users.$inferSelect;
export type ExaminationRecord = typeof examinationRecords.$inferSelect;
export type NewExaminationRecord = typeof examinationRecords.$inferInsert;