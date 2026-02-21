import { db } from "@/drizzle/db";
import { examinationRecords, visits } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VitalsForm } from "./_components/VitalsForm";
import { AssessmentForm } from "./_components/AssessmentForm";
import { DentalChartForm } from "./_components/DentalChartForm";
import { TreatmentPlanForm } from "./_components/TreatmentPlanForm";
import { RecentHistoryPanel } from "./_components/RecentHistoryPanel";

export default async function ExaminationPage({
  params,
}: {
  // Fix: params must be treated as a Promise in Next.js 15+
  params: Promise<{ visitId: string }>; 
}) {
  // Fix: Await the params before destructuring
  const { visitId } = await params;

  const visit = await db.query.visits.findFirst({
    where: eq(visits.id, visitId),
    with: {
      patient: true,
      doctor: true,
      record: true,
    },
  });

  // If no visit found, history can't be fetched
  const history = visit
    ? await db.query.examinationRecords.findMany({
        where: eq(examinationRecords.patientId, visit.patientId),
        orderBy: [desc(examinationRecords.date)],
        limit: 3,
      })
    : [];

  const previousRecord =
    history.find((record) => record.visitId !== visitId) ?? null;

  if (!visit) {
    return (
      <div className="p-20 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
           <span className="text-red-500 text-2xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          Visit Session Not Found
        </h1>
        <p className="text-slate-500 font-mono text-xs bg-slate-100 p-2 rounded inline-block">
          Target ID: {visitId}
        </p>
        <p className="text-slate-500">
          Please ensure the patient was checked in correctly at the reception.
        </p>
      </div>
    );
  }

  const currentRecord = visit.record ?? null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* 1. PERSISTENT HEADER BAR */}
      <div className="bg-slate-950 text-white p-5 border-b-2 border-gold-500 sticky top-0 z-20 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-gold-500 font-black text-xl tracking-tighter uppercase">
                Golden Exam
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                Clinical Record
              </p>
            </div>
            <Separator orientation="vertical" className="h-10 bg-slate-800" />
            <div className="space-y-1">
              <p className="text-lg font-bold leading-none">
                {visit.patient.name}
              </p>
              <div className="flex gap-4 text-[10px] text-slate-400 font-mono uppercase">
                <span>Card ID: {visit.patient.cardId}</span>
                <span>Age: {visit.patient.age}</span>
                <span>Sex: {visit.patient.sex}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge className="bg-gold-600 text-slate-900 font-bold px-4 py-1">
              SESSION LIVE
            </Badge>
            <p className="text-[9px] text-slate-500 uppercase mt-1 font-bold">
              Attending: Dr. {visit.doctor?.name || "Unassigned"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. TABBED CONTENT */}
      <div className="max-w-6xl mx-auto p-8">
        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border shadow-sm h-14 p-1 rounded-xl">
            <TabsTrigger
              value="vitals"
              className="font-bold data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900"
            >
              Vitals & History
            </TabsTrigger>
            <TabsTrigger
              value="assessment"
              className="font-bold data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900"
            >
              Assessment
            </TabsTrigger>
            <TabsTrigger
              value="charting"
              className="font-bold data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900"
            >
              Dental Chart
            </TabsTrigger>
            <TabsTrigger
              value="plan"
              className="font-bold data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900"
            >
              Plan & Remark
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: VITALS */}
          <TabsContent
            value="vitals"
            className="mt-8 animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="bg-white rounded-2xl border p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-2 h-8 bg-gold-500 rounded-full"></div>
                  <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                    Medical Assessment
                  </h2>
                </div>

                <VitalsForm
                  visitId={visitId}
                  patientId={visit.patientId}
                  doctorId={visit.doctorId}
                  initialData={currentRecord}
                  previousRecord={previousRecord}
                />
              </div>

              <RecentHistoryPanel history={history} activeVisitId={visitId} />
            </div>
          </TabsContent>

          {/* TAB 2: ASSESSMENT */}
          <TabsContent
            value="assessment"
            className="mt-8 animate-in fade-in duration-300"
          >
            <div className="bg-white rounded-2xl border p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-2 h-8 bg-gold-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                  Clinical Observation
                </h2>
              </div>

              <AssessmentForm
                visitId={visitId}
                patientId={visit.patientId}
                doctorId={visit.doctorId}
                initialData={currentRecord}
              />
            </div>
          </TabsContent>

          {/* TAB 3: DENTAL CHART */}
          <TabsContent
            value="charting"
            className="mt-8 animate-in fade-in duration-300"
          >
            <div className="bg-white rounded-2xl border p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-2 h-8 bg-gold-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                  Dental Chart
                </h2>
              </div>

              <DentalChartForm
                visitId={visitId}
                patientId={visit.patientId}
                doctorId={visit.doctorId}
                initialChart={
                  (currentRecord?.toothMap as Record<string, string> | null) ??
                  null
                }
              />
            </div>
          </TabsContent>

          {/* TAB 4: TREATMENT PLAN */}
          <TabsContent
            value="plan"
            className="mt-8 animate-in fade-in duration-300"
          >
            <div className="bg-white rounded-2xl border p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-2 h-8 bg-gold-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                  Plan & Closing Remarks
                </h2>
              </div>

              <TreatmentPlanForm
                visitId={visitId}
                patientId={visit.patientId}
                doctorId={visit.doctorId}
                initialData={currentRecord}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}