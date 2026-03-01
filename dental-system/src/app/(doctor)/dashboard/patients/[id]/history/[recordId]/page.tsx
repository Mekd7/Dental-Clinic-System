import { db } from "@/drizzle/db";
import { examinationRecords, patients } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>;
}) {
  const { id, recordId } = await params;

  const patient = await db.query.patients.findFirst({
    where: eq(patients.id, id),
  });

  const record = await db.query.examinationRecords.findFirst({
    where: eq(examinationRecords.id, recordId),
  });

  if (!patient || !record) {
    return (
      <div className="p-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Record Not Found</h1>
        <p className="text-slate-500">
          This examination record could not be loaded.
        </p>
      </div>
    );
  }

  const medHx = record.medicalHistory as {
    cardiac?: boolean;
    diabetic?: boolean;
    allergy?: boolean;
    giProblem?: boolean;
    pregnant?: boolean;
  } | null;

  const toothMap = record.toothMap as Record<string, string> | null;
  const toothEntries = toothMap ? Object.entries(toothMap) : [];

  const recordDate = new Date(record.date ?? Date.now()).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-slate-950 text-white p-5 border-b-2 border-gold-500 sticky top-0 z-20 shadow-2xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link
              href={`/dashboard/patients/${id}/history`}
              className="flex items-center gap-2 text-slate-400 hover:text-gold-500 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              All Records
            </Link>
            <Separator orientation="vertical" className="h-10 bg-slate-800" />
            <div>
              <h1 className="text-gold-500 font-black text-xl tracking-tighter uppercase">
                {patient.name}
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                {recordDate}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-[10px] text-slate-400 font-mono uppercase">
            <span>Card: {patient.cardId}</span>
            <span>Age: {patient.age}</span>
            <span>Sex: {patient.sex}</span>
          </div>
        </div>
      </div>

      {/* RECORD DETAIL */}
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        {/* SECTION: Vitals */}
        <section className="bg-white rounded-2xl border p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-8 bg-gold-500 rounded-full" />
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
              Vitals
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
                Temperature
              </p>
              <p className="text-lg font-semibold text-slate-700">
                {record.temp || "--"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
                Blood Pressure
              </p>
              <p className="text-lg font-semibold text-slate-700">
                {record.bp || "--"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
                Sugar Level
              </p>
              <p className="text-lg font-semibold text-slate-700">
                {record.diabeticLevel || "--"}
              </p>
            </div>
          </div>

          {record.chiefComplaint && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                Chief Complaint
              </p>
              <p className="text-base text-slate-700">
                {record.chiefComplaint}
              </p>
            </div>
          )}
        </section>

        {/* SECTION: Medical History */}
        <section className="bg-white rounded-2xl border p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-8 bg-gold-500 rounded-full" />
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
              Medical History
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {medHx?.cardiac && (
              <Badge className="bg-rose-50 text-rose-700 border border-rose-200 px-4 py-1.5">
                Cardiac Problem
              </Badge>
            )}
            {medHx?.diabetic && (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-4 py-1.5">
                Diabetic
              </Badge>
            )}
            {medHx?.allergy && (
              <Badge className="bg-purple-50 text-purple-700 border border-purple-200 px-4 py-1.5">
                Allergy
              </Badge>
            )}
            {medHx?.giProblem && (
              <Badge className="bg-orange-50 text-orange-700 border border-orange-200 px-4 py-1.5">
                G.I Problem
              </Badge>
            )}
            {medHx?.pregnant && (
              <Badge className="bg-pink-50 text-pink-700 border border-pink-200 px-4 py-1.5">
                Pregnant
              </Badge>
            )}
            {!medHx?.cardiac &&
              !medHx?.diabetic &&
              !medHx?.allergy &&
              !medHx?.giProblem &&
              !medHx?.pregnant && (
                <p className="text-sm text-slate-400">None reported</p>
              )}
          </div>
          {record.otherMedicalHX && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                Other
              </p>
              <p className="text-base text-slate-700">
                {record.otherMedicalHX}
              </p>
            </div>
          )}
        </section>

        {/* SECTION: Clinical Assessment */}
        {(record.extraOralExam ||
          record.intraOralExam ||
          record.missedTeeth ||
          record.fillingTeeth) && (
          <section className="bg-white rounded-2xl border p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-gold-500 rounded-full" />
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                Clinical Assessment
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {record.extraOralExam && (
                <div>
                  <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                    Extra-Oral Exam
                  </p>
                  <p className="text-base text-slate-700">
                    {record.extraOralExam}
                  </p>
                </div>
              )}
              {record.intraOralExam && (
                <div>
                  <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                    Intra-Oral Exam
                  </p>
                  <p className="text-base text-slate-700">
                    {record.intraOralExam}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t">
              {record.missedTeeth && (
                <div>
                  <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
                    Missing Teeth
                  </p>
                  <p className="text-sm text-slate-700">{record.missedTeeth}</p>
                </div>
              )}
              {record.fillingTeeth && (
                <div>
                  <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
                    Fillings
                  </p>
                  <p className="text-sm text-slate-700">
                    {record.fillingTeeth}
                  </p>
                </div>
              )}
              {record.mobileTeethDeg && (
                <div>
                  <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
                    Mobility
                  </p>
                  <p className="text-sm text-slate-700">
                    {record.mobileTeethDeg}
                  </p>
                </div>
              )}
              {record.cariesClass && (
                <div>
                  <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
                    Caries Class
                  </p>
                  <p className="text-sm text-slate-700">{record.cariesClass}</p>
                </div>
              )}
            </div>

            {record.rctDone && (
              <div className="mt-4">
                <Badge
                  variant="outline"
                  className="text-blue-700 bg-blue-50 border-blue-200"
                >
                  RCT Previously Done
                </Badge>
              </div>
            )}
          </section>
        )}

        {/* SECTION: Dental Chart */}
        {toothEntries.length > 0 && (
          <section className="bg-white rounded-2xl border p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-gold-500 rounded-full" />
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                Dental Chart
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {toothEntries.map(([tooth, status]) => {
                const colors: Record<string, string> = {
                  watch: "bg-amber-50 text-amber-700 border-amber-200",
                  issue: "bg-rose-50 text-rose-700 border-rose-200",
                  treated: "bg-blue-50 text-blue-700 border-blue-200",
                  missing: "bg-slate-100 text-slate-500 border-slate-200",
                };
                return (
                  <span
                    key={tooth}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${colors[status] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
                    #{tooth}: {status}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION: Plan & Remarks */}
        <section className="bg-white rounded-2xl border p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-8 bg-gold-500 rounded-full" />
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
              Plan & Remarks
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                Diagnosis
              </p>
              <p className="text-base text-slate-700">
                {record.diagnosis || "--"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                Treatment Done
              </p>
              <p className="text-base text-slate-700">
                {record.treatmentDone || "--"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                Treatment Plan
              </p>
              <p className="text-base text-slate-700">
                {record.treatmentPlan || "--"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                Remark
              </p>
              <p className="text-base text-slate-700">
                {record.remark || "--"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
