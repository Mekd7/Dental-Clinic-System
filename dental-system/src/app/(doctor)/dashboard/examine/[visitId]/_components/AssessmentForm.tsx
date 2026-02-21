"use client";

import { useState } from "react";
import { toast } from "sonner";

import { saveAssessmentAction } from "@/app/actions/exams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import type { ExaminationRecord } from "@/drizzle/schema";

interface AssessmentFormProps {
  visitId: string;
  patientId: string;
  doctorId: string;
  initialData?: Pick<
    ExaminationRecord,
    | "extraOralExam"
    | "intraOralExam"
    | "missedTeeth"
    | "mobileTeethDeg"
    | "cariesClass"
    | "rctDone"
    | "fillingTeeth"
  > | null;
}

const cariesOptions = [
  "Class I",
  "Class II",
  "Class III",
  "Class IV",
  "Class V",
  "Rampant",
];
const mobilityOptions = ["None", "Degree I", "Degree II", "Degree III"];

export function AssessmentForm({
  visitId,
  patientId,
  doctorId,
  initialData,
}: AssessmentFormProps) {
  const [saving, setSaving] = useState(false);
  const [cariesClass, setCariesClass] = useState(
    initialData?.cariesClass ?? "",
  );
  const [mobility, setMobility] = useState(initialData?.mobileTeethDeg ?? "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      visitId,
      patientId,
      doctorId,
      extraOralExam: (formData.get("extraOralExam") as string) || "",
      intraOralExam: (formData.get("intraOralExam") as string) || "",
      missedTeeth: (formData.get("missedTeeth") as string) || "",
      mobileTeethDeg: (formData.get("mobileTeethDeg") as string) || "",
      cariesClass: (formData.get("cariesClass") as string) || "",
      rctDone: formData.get("rctDone") === "on",
      fillingTeeth: (formData.get("fillingTeeth") as string) || "",
    };

    const result = await saveAssessmentAction(payload);

    if (result.success) {
      toast.success("Assessment updated");
    } else {
      toast.error(result.error || "Failed to save assessment");
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Extra-Oral Exam
          </Label>
          <Textarea
            name="extraOralExam"
            defaultValue={initialData?.extraOralExam ?? ""}
            placeholder="Facial symmetry, TMJ, lymph nodes..."
            className="min-h-32 bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Intra-Oral Exam
          </Label>
          <Textarea
            name="intraOralExam"
            defaultValue={initialData?.intraOralExam ?? ""}
            placeholder="Soft tissues, tongue, palate, occlusion..."
            className="min-h-32 bg-white"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Missing Teeth
          </Label>
          <Input
            name="missedTeeth"
            defaultValue={initialData?.missedTeeth ?? ""}
            placeholder="e.g. 14, 24, 36"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Filled / Treated Teeth
          </Label>
          <Input
            name="fillingTeeth"
            defaultValue={initialData?.fillingTeeth ?? ""}
            placeholder="e.g. 12 - composite"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Mobility Degree
          </Label>
          <Select
            value={mobility || undefined}
            onValueChange={(value) => setMobility(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select mobility" />
            </SelectTrigger>
            <SelectContent>
              {mobilityOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="mobileTeethDeg" value={mobility} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Caries Class
          </Label>
          <Select
            value={cariesClass || undefined}
            onValueChange={(value) => setCariesClass(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {cariesOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="cariesClass" value={cariesClass} />
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <Checkbox
            id="rctDone"
            name="rctDone"
            defaultChecked={Boolean(initialData?.rctDone)}
          />
          <Label htmlFor="rctDone" className="font-semibold">
            Root Canal Already Done
          </Label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-slate-900 font-semibold text-white hover:bg-gold-600"
      >
        {saving ? "Saving assessment..." : "Save Assessment"}
      </Button>
    </form>
  );
}
