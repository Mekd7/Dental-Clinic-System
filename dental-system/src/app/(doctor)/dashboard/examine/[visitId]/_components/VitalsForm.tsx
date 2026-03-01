"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveVitalsAction } from "@/app/actions/exams";

interface MedicalHistory {
  cardiac: boolean;
  diabetic: boolean;
  allergy: boolean;
  giProblem: boolean;
  pregnant: boolean;
}

interface VitalsFormProps {
  visitId: string;
  patientId: string;
  doctorId: string;
  initialData?: {
    temp?: string | null;
    bp?: string | null;
    diabeticLevel?: string | null;
    chiefComplaint?: string | null;
    medicalHistory?: MedicalHistory | null;
    otherMedicalHX?: string | null;
  } | null;
}

const medicalHistoryFields: Array<{
  id: string;
  label: string;
  key: keyof MedicalHistory;
}> = [
  { id: "cardiac", label: "Cardiac Problem", key: "cardiac" },
  { id: "diabetic", label: "Diabetic", key: "diabetic" },
  { id: "allergy", label: "Allergy", key: "allergy" },
  { id: "gi", label: "G.I Problem", key: "giProblem" },
  { id: "pregnant", label: "Is Pregnant", key: "pregnant" },
];

export function VitalsForm({
  visitId,
  patientId,
  doctorId,
  initialData,
}: VitalsFormProps) {
  const [loading, setLoading] = useState(false);
  const historySnapshot = initialData?.medicalHistory ?? undefined;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      visitId,
      patientId,
      doctorId,
      temp: (formData.get("temp") as string) || "",
      bp: (formData.get("bp") as string) || "",
      diabeticLevel: (formData.get("diabeticLevel") as string) || "",
      chiefComplaint: (formData.get("chiefComplaint") as string) || "",
      otherMedicalHX: (formData.get("otherMedicalHX") as string) || "",
      medicalHistory: {
        cardiac: formData.get("cardiac") === "on",
        diabetic: formData.get("diabetic") === "on",
        allergy: formData.get("allergy") === "on",
        giProblem: formData.get("gi") === "on",
        pregnant: formData.get("pregnant") === "on",
      },
    };

    const result = await saveVitalsAction(payload);

    if (result.success) {
      toast.success("Medical History Saved Successfully");
    } else {
      toast.error(result.error || "Failed to save vitals");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-gold-700 font-bold uppercase text-xs tracking-wider">
            Temp (T/T)
          </Label>
          <Input
            name="temp"
            placeholder="--"
            defaultValue={initialData?.temp ?? ""}
            className="border-slate-200 focus:ring-gold-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gold-700 font-bold uppercase text-xs tracking-wider">
            BP (B/P)
          </Label>
          <Input
            name="bp"
            placeholder="--"
            defaultValue={initialData?.bp ?? ""}
            className="border-slate-200 focus:ring-gold-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gold-700 font-bold uppercase text-xs tracking-wider">
            Sugar (mg/dl)
          </Label>
          <Input
            name="diabeticLevel"
            placeholder="--"
            defaultValue={initialData?.diabeticLevel ?? ""}
            className="border-slate-200 focus:ring-gold-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gold-700 font-bold uppercase text-xs tracking-wider">
          Chief Complaint (c/c)
        </Label>
        <Textarea
          name="chiefComplaint"
          className="h-24 bg-slate-50 focus:ring-gold-500"
          placeholder="Type patient's complaint here..."
          defaultValue={initialData?.chiefComplaint ?? ""}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
          Medical History Check
        </h3>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {medicalHistoryFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center space-x-3 rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
            >
              <Checkbox
                id={field.id}
                name={field.id}
                defaultChecked={Boolean(historySnapshot?.[field.key])}
                className="data-[state=checked]:border-gold-500 data-[state=checked]:bg-gold-500"
              />
              <Label
                htmlFor={field.id}
                className="cursor-pointer font-semibold capitalize text-slate-700"
              >
                {field.label}
              </Label>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <Label className="text-[10px] font-bold uppercase text-slate-400">
            Other Medical History
          </Label>
          <Input
            name="otherMedicalHX"
            className="bg-white"
            defaultValue={initialData?.otherMedicalHX ?? ""}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-slate-900 font-bold text-white transition-colors hover:bg-gold-600"
      >
        {loading ? "Saving Medical Record..." : "Confirm & Save Vitals"}
      </Button>
    </form>
  );
}
