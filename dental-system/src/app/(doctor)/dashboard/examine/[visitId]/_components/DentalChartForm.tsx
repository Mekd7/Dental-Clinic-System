"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { saveDentalChartAction } from "@/app/actions/exams";
import { Button } from "@/components/ui/button";

interface DentalChartFormProps {
  visitId: string;
  patientId: string;
  doctorId: string;
  initialChart?: Record<string, string> | null;
}

const upperArch = ["18","17","16","15","14","13","12","11","21","22","23","24","25","26","27","28"];
const lowerArch = ["48","47","46","45","44","43","42","41","31","32","33","34","35","36","37","38"];
const statusOrder = ["healthy", "watch", "issue", "treated", "missing"] as const;

const statusStyles: Record<string, string> = {
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  watch: "bg-amber-50 text-amber-700 border-amber-200",
  issue: "bg-rose-50 text-rose-700 border-rose-200",
  treated: "bg-blue-50 text-blue-700 border-blue-200",
  missing: "bg-slate-100 text-slate-400 border-slate-200 line-through",
};

export function DentalChartForm({ visitId, patientId, doctorId, initialChart }: DentalChartFormProps) {
  const [chart, setChart] = useState<Record<string, string>>(initialChart || {});
  const [saving, setSaving] = useState(false);

  const aggregate = useMemo(() => {
    const summary = { treated: 0, issue: 0, missing: 0 };
    Object.values(chart).forEach((status) => {
      if (status in summary) summary[status as keyof typeof summary] += 1;
    });
    return summary;
  }, [chart]);

  function toggleTooth(tooth: string) {
    setChart((prev) => {
      const currentStatus = prev[tooth];
      const nextIndex = currentStatus ? (statusOrder.indexOf(currentStatus as any) + 1) % statusOrder.length : 1;
      const nextStatus = statusOrder[nextIndex];
      
      const newChart = { ...prev };
      if (nextStatus === "healthy") delete newChart[tooth];
      else newChart[tooth] = nextStatus;
      return newChart;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const result = await saveDentalChartAction({
      visitId,
      patientId,
      doctorId,
      toothMap: chart,
    });

    if (result.success) toast.success("Dental chart updated");
    else toast.error("Could not save chart");
    
    setSaving(false);
  }

  function renderArch(teeth: string[]) {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {teeth.map((tooth) => {
          const status = chart[tooth];
          const style = status ? statusStyles[status] : "bg-white text-slate-400 border-slate-200";
          return (
            <button
              key={tooth}
              type="button"
              onClick={() => toggleTooth(tooth)}
              className={`flex h-14 w-12 flex-col items-center justify-center rounded-lg border text-[10px] font-bold transition-all hover:scale-105 ${style}`}
            >
              <span className="uppercase text-[8px] opacity-60">ID</span>
              <span className="text-sm">{tooth}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-8">
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 text-center">Maxilla (Upper Arch)</p>
          {renderArch(upperArch)}
        </div>
        <div className="border-t border-slate-200 pt-8">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 text-center">Mandible (Lower Arch)</p>
          {renderArch(lowerArch)}
        </div>
      </div>

      <div className="flex justify-center gap-4">
          <div className="px-4 py-2 bg-rose-50 rounded-full border border-rose-100 text-[10px] font-bold text-rose-600 uppercase">Issues: {aggregate.issue}</div>
          <div className="px-4 py-2 bg-blue-50 rounded-full border border-blue-100 text-[10px] font-bold text-blue-600 uppercase">Treated: {aggregate.treated}</div>
          <div className="px-4 py-2 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 uppercase">Missing: {aggregate.missing}</div>
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-gold-600 font-bold h-12">
          {saving ? "Saving Chart..." : "Update Dental Chart"}
        </Button>
        <p className="text-center text-[10px] text-slate-400 uppercase font-medium">
          Note: This chart is optional. You only need to save if changes are made.
        </p>
      </div>
    </form>
  );
}