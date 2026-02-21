"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { savePlanAction } from "@/app/actions/exams";
import { completeVisitAction } from "@/app/actions/visits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { ExaminationRecord } from "@/drizzle/schema";

interface TreatmentPlanFormProps {
  visitId: string;
  patientId: string;
  doctorId: string;
  initialData?: Pick<
    ExaminationRecord,
    "diagnosis" | "treatmentPlan" | "treatmentDone" | "remark"
  > | null;
}

export function TreatmentPlanForm({
  visitId,
  patientId,
  doctorId,
  initialData,
}: TreatmentPlanFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);

  function extractPayload(form: HTMLFormElement) {
    const formData = new FormData(form);
    return {
      visitId,
      patientId,
      doctorId,
      diagnosis: (formData.get("diagnosis") as string) || "",
      treatmentPlan: (formData.get("treatmentPlan") as string) || "",
      treatmentDone: (formData.get("treatmentDone") as string) || "",
      remark: (formData.get("remark") as string) || "",
    };
  }

  async function persistPlan(form: HTMLFormElement) {
    const payload = extractPayload(form);
    return savePlanAction(payload);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const result = await persistPlan(event.currentTarget);

    if (result.success) {
      toast.success("Plan saved");
    } else {
      toast.error(result.error || "Failed to save plan");
    }

    setSaving(false);
  }

  async function handleComplete() {
    if (!formRef.current) return;
    setFinishing(true);

    const result = await persistPlan(formRef.current);

    if (!result.success) {
      toast.error(result.error || "Save plan before finishing");
      setFinishing(false);
      return;
    }

    toast.success("Plan saved. Completing visit...", { duration: 2000 });

    try {
      await completeVisitAction(visitId);
    } catch (error) {
      const message = (error as Error)?.message ?? "";
      if (!message.includes("NEXT_REDIRECT")) {
        console.error("Complete visit error", error);
        toast.error("Unable to complete visit. Please try again.");
        setFinishing(false);
      }
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Diagnosis
        </Label>
        <Textarea
          name="diagnosis"
          defaultValue={initialData?.diagnosis ?? ""}
          placeholder="Primary diagnosis / ICD whenever applicable"
          className="min-h-32 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Treatment Plan
        </Label>
        <Textarea
          name="treatmentPlan"
          defaultValue={initialData?.treatmentPlan ?? ""}
          placeholder="Outline phases, required visits, suggested materials..."
          className="min-h-32 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Treatment Done Today
        </Label>
        <Textarea
          name="treatmentDone"
          defaultValue={initialData?.treatmentDone ?? ""}
          placeholder="Document the procedures performed during this visit"
          className="min-h-24 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Remark
        </Label>
        <Textarea
          name="remark"
          defaultValue={initialData?.remark ?? ""}
          placeholder="Special notes, requested medication, follow-up reminders..."
          className="min-h-20 bg-white"
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Button
          type="submit"
          disabled={saving || finishing}
          className="flex-1 bg-slate-900 font-semibold text-white hover:bg-gold-600"
        >
          {saving ? "Saving plan..." : "Save Plan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={finishing}
          onClick={handleComplete}
          className="flex-1 border-gold-400 text-gold-700 hover:bg-gold-50"
        >
          {finishing ? "Completing visit..." : "Finish & Complete Visit"}
        </Button>
      </div>
    </form>
  );
}
