import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ExaminationRecord } from "@/drizzle/schema";

interface RecentHistoryPanelProps {
  history: Array<
    Pick<
      ExaminationRecord,
      | "id"
      | "visitId"
      | "date"
      | "bp"
      | "temp"
      | "diabeticLevel"
      | "chiefComplaint"
      | "diagnosis"
    >
  >;
  activeVisitId: string;
}

export function RecentHistoryPanel({
  history,
  activeVisitId,
}: RecentHistoryPanelProps) {
  if (!history.length) {
    return (
      <aside className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
        No examinations recorded yet.
      </aside>
    );
  }

  return (
    <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
          Recent History
        </p>
        <p className="text-sm text-slate-500">
          Last three examinations for this patient
        </p>
      </div>

      <div className="space-y-4">
        {history.map((record, index) => {
          const isCurrent = record.visitId === activeVisitId;
          return (
            <div
              key={record.id}
              className={`rounded-2xl border p-4 text-sm ${
                isCurrent ? "border-gold-400 bg-gold-50/60" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-500">
                <span>
                  {new Date(record.date ?? Date.now()).toLocaleDateString()}
                </span>
                {isCurrent ? (
                  <Badge className="bg-gold-500 text-slate-900">Current</Badge>
                ) : (
                  <Badge variant="outline">Past</Badge>
                )}
              </div>
              <Separator className="my-3" />
              <div className="grid gap-3 text-[13px] text-slate-600">
                <p className="font-medium text-slate-800">
                  {record.chiefComplaint || "—"}
                </p>
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-widest text-slate-500">
                  <span>BP: {record.bp || "--"}</span>
                  <span>Temp: {record.temp || "--"}</span>
                  <span>Sugar: {record.diabeticLevel || "--"}</span>
                </div>
                {record.diagnosis && (
                  <p className="text-xs text-emerald-700">
                    Diagnosis: {record.diagnosis}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
