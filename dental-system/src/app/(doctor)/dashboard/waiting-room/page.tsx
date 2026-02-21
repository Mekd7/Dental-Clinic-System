import { db } from "@/drizzle/db";
import { visits } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { startExaminationAction } from "@/app/actions/visits";
import { Clock, User, ArrowRight, Activity } from "lucide-react";

export default async function DoctorQueuePage() {
  const CLINIC_ID = "default-clinic-id";
  const MOCK_DOCTOR_ID = "mock-doctor-id";

  const queue = await db.query.visits.findMany({
    where: and(
      eq(visits.clinicId, CLINIC_ID),
      eq(visits.doctorId, MOCK_DOCTOR_ID),
      eq(visits.status, "WAITING")
    ),
    with: { patient: true },
    orderBy: [desc(visits.checkInTime)],
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Queue</h1>
          <p className="text-gold-600 font-semibold uppercase text-xs tracking-widest mt-1">
            Golden Dental • Dr. Abel Solomon
          </p>
        </div>
        <Badge className="bg-gold-500 text-slate-900 hover:bg-gold-500">
          {queue.length} Waiting
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {queue.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-slate-50">
            <Clock className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No patients in the queue.</p>
          </div>
        ) : (
          queue.map((visit) => (
            <Card key={visit.id} className="border-l-4 border-l-gold-500 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-xl font-bold">{visit.patient.name}</CardTitle>
                  <p className="text-xs font-mono text-gold-700 mt-1">{visit.patient.cardId}</p>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {new Date(visit.checkInTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-3 rounded-lg border mb-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Reason for Visit</p>
                  <p className="text-sm font-medium text-slate-700">{visit.reason}</p>
                </div>
                <form action={startExaminationAction.bind(null, visit.id)}>
                  <Button className="w-full bg-slate-900 hover:bg-gold-600 text-white group">
                    Start Examination
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}