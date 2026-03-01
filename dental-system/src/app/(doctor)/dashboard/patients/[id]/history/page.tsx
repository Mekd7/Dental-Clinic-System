import { db } from "@/drizzle/db";
import { examinationRecords, patients } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";

export default async function FullHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const patient = await db.query.patients.findFirst({
    where: eq(patients.id, id),
  });

  const records = await db.query.examinationRecords.findMany({
    where: eq(examinationRecords.patientId, id),
    orderBy: [desc(examinationRecords.date)],
  });

  if (!patient) {
    return (
      <div className="p-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Patient Not Found</h1>
        <p className="text-slate-500">No patient record matches this ID.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-slate-950 text-white p-5 border-b-2 border-gold-500 sticky top-0 z-20 shadow-2xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard/waiting-room"
              className="flex items-center gap-2 text-slate-400 hover:text-gold-500 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Separator orientation="vertical" className="h-10 bg-slate-800" />
            <div>
              <h1 className="text-gold-500 font-black text-xl tracking-tighter uppercase">
                {patient.name}&apos;s Records
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                Examination Archive
              </p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex gap-4 text-[10px] text-slate-400 font-mono uppercase">
              <span>Card: {patient.cardId}</span>
              <span>Age: {patient.age}</span>
              <span>Sex: {patient.sex}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECORDS LIST */}
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            All Examinations
          </h2>
          <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200">
            {records.length} Record{records.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {records.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-white">
            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              No examination records found for this patient.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => (
              <Link
                key={record.id}
                href={`/dashboard/patients/${id}/history/${record.id}`}
                className="flex items-center gap-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gold-300 transition-all group"
              >
                {/* Number */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm group-hover:bg-gold-500 group-hover:text-slate-900 transition-colors">
                  {index + 1}
                </div>

                {/* Date + Complaint */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800">
                    {new Date(record.date ?? Date.now()).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                  <p className="text-sm text-slate-500 mt-1 truncate">
                    {record.chiefComplaint || "No complaint recorded"}
                  </p>
                </div>

                {/* Diagnosis badge */}
                {record.diagnosis && (
                  <Badge
                    variant="outline"
                    className="flex-shrink-0 text-emerald-700 border-emerald-200 bg-emerald-50"
                  >
                    Dx: {record.diagnosis.slice(0, 25)}
                    {record.diagnosis.length > 25 ? "..." : ""}
                  </Badge>
                )}

                {/* Arrow */}
                <ArrowRight className="flex-shrink-0 h-5 w-5 text-slate-300 group-hover:text-gold-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
