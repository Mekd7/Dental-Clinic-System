import { db } from "@/drizzle/db";
import { visits } from "@/drizzle/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { reopenVisitAction } from "@/app/actions/visits";
import { CheckCircle2, RotateCcw } from "lucide-react";

export default async function CompletedTodayPage() {
  const CLINIC_ID = "default-clinic-id";
  const MOCK_DOCTOR_ID = "mock-doctor-id";

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const completedToday = await db.query.visits.findMany({
    where: and(
      eq(visits.clinicId, CLINIC_ID),
      eq(visits.doctorId, MOCK_DOCTOR_ID),
      eq(visits.status, "COMPLETED"),
      gte(visits.checkInTime, twentyFourHoursAgo),
    ),
    with: { patient: true },
    orderBy: [desc(visits.checkInTime)],
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Completed Today</h1>
          <p className="text-gold-600 font-semibold uppercase text-xs tracking-widest mt-1">
            Visits completed within the last 24 hours
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-emerald-600 border-emerald-200 bg-emerald-50"
        >
          {completedToday.length} Completed
        </Badge>
      </div>

      <div className="space-y-4">
        {completedToday.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-slate-50">
            <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              No completed visits in the last 24 hours.
            </p>
          </div>
        ) : (
          completedToday.map((visit) => (
            <div
              key={visit.id}
              className="flex items-center gap-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
            >
              {/* Status dot */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              {/* Patient info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-slate-800 truncate">
                    {visit.patient.name}
                  </p>
                  <span className="text-xs font-mono text-slate-500">
                    {visit.patient.cardId}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 truncate">
                  {visit.reason || "No reason recorded"}
                </p>
              </div>

              {/* Time */}
              <div className="flex-shrink-0 text-right">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {new Date(visit.checkInTime!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Badge>
              </div>

              {/* Re-open action */}
              <form action={reopenVisitAction.bind(null, visit.id)}>
                <Button
                  variant="outline"
                  className="flex-shrink-0 border-amber-300 text-amber-700 hover:bg-amber-50 group"
                >
                  <RotateCcw className="mr-2 h-4 w-4 group-hover:-rotate-45 transition-transform" />
                  Edit
                </Button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
