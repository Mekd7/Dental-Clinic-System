"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { saveDentalChartAction } from "@/app/actions/exams";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DentalChartFormProps {
  visitId: string;
  patientId: string;
  doctorId: string;
  initialChart?: Record<string, string> | null;
}

type ToothType = "molar" | "premolar" | "canine" | "incisor";

interface ToothData {
  id: string;
  x: number;
  y: number;
  rotation: number;
  type: ToothType;
  labelDx: number;
  labelDy: number;
  labelAnchor: "start" | "middle" | "end";
}

const statuses = [
  {
    id: "healthy",
    label: "Healthy",
    dotClass: "bg-emerald-500",
    btnColor: "bg-emerald-50",
    btnBorder: "border-emerald-300",
    btnText: "text-emerald-700",
  },
  {
    id: "treated",
    label: "Has Treatment Before",
    dotClass: "bg-blue-500",
    btnColor: "bg-blue-50",
    btnBorder: "border-blue-300",
    btnText: "text-blue-700",
  },
  {
    id: "watch",
    label: "Recommended to Treat",
    dotClass: "bg-amber-500",
    btnColor: "bg-amber-50",
    btnBorder: "border-amber-300",
    btnText: "text-amber-700",
  },
  {
    id: "issue",
    label: "Caries / Issue",
    dotClass: "bg-rose-500",
    btnColor: "bg-rose-50",
    btnBorder: "border-rose-300",
    btnText: "text-rose-700",
  },
  {
    id: "missing",
    label: "Missing",
    dotClass: "bg-slate-500",
    btnColor: "bg-slate-100",
    btnBorder: "border-slate-400",
    btnText: "text-slate-500",
  },
] as const;

const statusFills: Record<string, { fill: string; stroke: string }> = {
  treated: { fill: "#93c5fd", stroke: "#3b82f6" },
  watch: { fill: "#fcd34d", stroke: "#d97706" },
  issue: { fill: "#fca5a5", stroke: "#ef4444" },
  missing: { fill: "#e2e8f0", stroke: "#94a3b8" },
};

// SVG paths for tooth outlines (occlusal view)
function getOutlinePath(type: ToothType): string {
  switch (type) {
    case "molar":
      return "M-13,-16 C-16,-10 -16,10 -13,16 C-8,20 8,20 13,16 C16,10 16,-10 13,-16 C8,-20 -8,-20 -13,-16 Z";
    case "premolar":
      return "M-10,-13 C-13,-8 -13,8 -10,13 C-6,17 6,17 10,13 C13,8 13,-8 10,-13 C6,-17 -6,-17 -10,-13 Z";
    case "canine":
      return "M-8,-12 C-11,-8 -11,8 -8,12 C-4,16 4,16 8,12 C11,8 11,-8 8,-12 C4,-16 -4,-16 -8,-12 Z";
    case "incisor":
      return "M-7,-10 C-10,-6 -10,6 -7,10 C-3,14 3,14 7,10 C10,6 10,-6 7,-10 C3,-14 -3,-14 -7,-10 Z";
  }
}

// SVG paths for internal groove/fissure details
function getDetailPath(type: ToothType): string {
  switch (type) {
    case "molar":
      return "M-7,0 L7,0 M0,-9 L0,9 M-5,-5 Q-2,-3 0,-4 Q2,-3 5,-5 M-5,5 Q-2,3 0,4 Q2,3 5,5";
    case "premolar":
      return "M-5,0 L5,0 M0,-7 L0,7 M-3,-3 Q0,-2 3,-3 M-3,3 Q0,2 3,3";
    case "canine":
      return "M0,-7 L0,7 M-4,-2 Q0,2 4,-2";
    case "incisor":
      return "M-3,0 L3,0 M0,-5 L0,3";
  }
}

// All 32 tooth positions along the arch
// ViewBox: 0 0 500 850
const teeth: ToothData[] = [
  // ── Upper arch ─ left side (11 at top center → 18 at bottom left) ──
  {
    id: "11",
    x: 215,
    y: 128,
    rotation: 80,
    type: "incisor",
    labelDx: -18,
    labelDy: -22,
    labelAnchor: "middle",
  },
  {
    id: "12",
    x: 170,
    y: 142,
    rotation: 65,
    type: "incisor",
    labelDx: -28,
    labelDy: -16,
    labelAnchor: "end",
  },
  {
    id: "13",
    x: 133,
    y: 170,
    rotation: 50,
    type: "canine",
    labelDx: -32,
    labelDy: -8,
    labelAnchor: "end",
  },
  {
    id: "14",
    x: 108,
    y: 206,
    rotation: 38,
    type: "premolar",
    labelDx: -36,
    labelDy: -2,
    labelAnchor: "end",
  },
  {
    id: "15",
    x: 92,
    y: 246,
    rotation: 26,
    type: "premolar",
    labelDx: -36,
    labelDy: 0,
    labelAnchor: "end",
  },
  {
    id: "16",
    x: 84,
    y: 290,
    rotation: 15,
    type: "molar",
    labelDx: -40,
    labelDy: 0,
    labelAnchor: "end",
  },
  {
    id: "17",
    x: 84,
    y: 336,
    rotation: 6,
    type: "molar",
    labelDx: -40,
    labelDy: 0,
    labelAnchor: "end",
  },
  {
    id: "18",
    x: 94,
    y: 378,
    rotation: -4,
    type: "molar",
    labelDx: -38,
    labelDy: 5,
    labelAnchor: "end",
  },

  // ── Upper arch ─ right side (21 at top center → 28 at bottom right) ──
  {
    id: "21",
    x: 285,
    y: 128,
    rotation: -80,
    type: "incisor",
    labelDx: 18,
    labelDy: -22,
    labelAnchor: "middle",
  },
  {
    id: "22",
    x: 330,
    y: 142,
    rotation: -65,
    type: "incisor",
    labelDx: 28,
    labelDy: -16,
    labelAnchor: "start",
  },
  {
    id: "23",
    x: 367,
    y: 170,
    rotation: -50,
    type: "canine",
    labelDx: 32,
    labelDy: -8,
    labelAnchor: "start",
  },
  {
    id: "24",
    x: 392,
    y: 206,
    rotation: -38,
    type: "premolar",
    labelDx: 36,
    labelDy: -2,
    labelAnchor: "start",
  },
  {
    id: "25",
    x: 408,
    y: 246,
    rotation: -26,
    type: "premolar",
    labelDx: 36,
    labelDy: 0,
    labelAnchor: "start",
  },
  {
    id: "26",
    x: 416,
    y: 290,
    rotation: -15,
    type: "molar",
    labelDx: 40,
    labelDy: 0,
    labelAnchor: "start",
  },
  {
    id: "27",
    x: 416,
    y: 336,
    rotation: -6,
    type: "molar",
    labelDx: 40,
    labelDy: 0,
    labelAnchor: "start",
  },
  {
    id: "28",
    x: 406,
    y: 378,
    rotation: 4,
    type: "molar",
    labelDx: 38,
    labelDy: 5,
    labelAnchor: "start",
  },

  // ── Lower arch ─ left side (48 at top left → 41 at bottom center) ──
  {
    id: "48",
    x: 94,
    y: 472,
    rotation: 4,
    type: "molar",
    labelDx: -38,
    labelDy: -5,
    labelAnchor: "end",
  },
  {
    id: "47",
    x: 84,
    y: 514,
    rotation: -6,
    type: "molar",
    labelDx: -40,
    labelDy: 0,
    labelAnchor: "end",
  },
  {
    id: "46",
    x: 84,
    y: 560,
    rotation: -15,
    type: "molar",
    labelDx: -40,
    labelDy: 0,
    labelAnchor: "end",
  },
  {
    id: "45",
    x: 92,
    y: 604,
    rotation: -26,
    type: "premolar",
    labelDx: -36,
    labelDy: 0,
    labelAnchor: "end",
  },
  {
    id: "44",
    x: 108,
    y: 644,
    rotation: -38,
    type: "premolar",
    labelDx: -36,
    labelDy: 2,
    labelAnchor: "end",
  },
  {
    id: "43",
    x: 133,
    y: 680,
    rotation: -50,
    type: "canine",
    labelDx: -32,
    labelDy: 8,
    labelAnchor: "end",
  },
  {
    id: "42",
    x: 170,
    y: 708,
    rotation: -65,
    type: "incisor",
    labelDx: -28,
    labelDy: 16,
    labelAnchor: "end",
  },
  {
    id: "41",
    x: 215,
    y: 722,
    rotation: -80,
    type: "incisor",
    labelDx: -18,
    labelDy: 22,
    labelAnchor: "middle",
  },

  // ── Lower arch ─ right side (31 at bottom center → 38 at top right) ──
  {
    id: "31",
    x: 285,
    y: 722,
    rotation: 80,
    type: "incisor",
    labelDx: 18,
    labelDy: 22,
    labelAnchor: "middle",
  },
  {
    id: "32",
    x: 330,
    y: 708,
    rotation: 65,
    type: "incisor",
    labelDx: 28,
    labelDy: 16,
    labelAnchor: "start",
  },
  {
    id: "33",
    x: 367,
    y: 680,
    rotation: 50,
    type: "canine",
    labelDx: 32,
    labelDy: 8,
    labelAnchor: "start",
  },
  {
    id: "34",
    x: 392,
    y: 644,
    rotation: 38,
    type: "premolar",
    labelDx: 36,
    labelDy: 2,
    labelAnchor: "start",
  },
  {
    id: "35",
    x: 408,
    y: 604,
    rotation: 26,
    type: "premolar",
    labelDx: 36,
    labelDy: 0,
    labelAnchor: "start",
  },
  {
    id: "36",
    x: 416,
    y: 560,
    rotation: 15,
    type: "molar",
    labelDx: 40,
    labelDy: 0,
    labelAnchor: "start",
  },
  {
    id: "37",
    x: 416,
    y: 514,
    rotation: 6,
    type: "molar",
    labelDx: 40,
    labelDy: 0,
    labelAnchor: "start",
  },
  {
    id: "38",
    x: 406,
    y: 472,
    rotation: -4,
    type: "molar",
    labelDx: 38,
    labelDy: -5,
    labelAnchor: "start",
  },
];

export function DentalChartForm({
  visitId,
  patientId,
  doctorId,
  initialChart,
}: DentalChartFormProps) {
  const [chart, setChart] = useState<Record<string, string>>(
    initialChart || {},
  );
  const [selectedTool, setSelectedTool] = useState<string>("issue");
  const [saving, setSaving] = useState(false);

  const aggregate = useMemo(() => {
    const summary = { watch: 0, issue: 0, treated: 0, missing: 0 };
    Object.values(chart).forEach((status) => {
      if (status in summary) summary[status as keyof typeof summary] += 1;
    });
    return summary;
  }, [chart]);

  function handleToothClick(tooth: string) {
    setChart((prev) => {
      const newChart = { ...prev };
      if (selectedTool === "healthy") {
        delete newChart[tooth];
      } else {
        newChart[tooth] = selectedTool;
      }
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

  function getToothColors(toothId: string) {
    const status = chart[toothId];
    if (!status || status === "healthy")
      return { fill: "white", stroke: "#c8ccd0", detailStroke: "#c8ccd0" };
    const s = statusFills[status];
    return s
      ? { fill: s.fill, stroke: s.stroke, detailStroke: s.stroke }
      : { fill: "white", stroke: "#c8ccd0", detailStroke: "#c8ccd0" };
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* TOOLBOX / LEGEND */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
          Select Status Tool, Then Click Teeth
        </p>
        <div className="flex flex-wrap gap-3">
          {statuses.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedTool(s.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all text-xs font-bold",
                s.btnColor,
                s.btnText,
                s.btnBorder,
                selectedTool === s.id
                  ? "ring-2 ring-gold-500 scale-105 shadow-md opacity-100"
                  : "opacity-50 hover:opacity-75",
              )}
            >
              <span className={cn("w-2.5 h-2.5 rounded-full", s.dotClass)} />
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-3">
          Active tool:{" "}
          <span className="font-bold text-slate-600 capitalize">
            {selectedTool}
          </span>{" "}
          — click any tooth to apply this status
        </p>
      </div>

      {/* DENTAL ARCH SVG */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 sm:p-4">
        <svg
          viewBox="0 0 500 850"
          className="w-full max-w-lg mx-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            .tooth-group { cursor: pointer; }
            .tooth-group:hover .tooth-outline { filter: brightness(0.92); }
            .tooth-group:hover .tooth-outline[fill="white"] { fill: #f1f5f9; }
          `}</style>

          {/* Center cross divider between arches */}
          <line
            x1="250"
            y1="395"
            x2="250"
            y2="455"
            stroke="#d1d5db"
            strokeWidth="1.2"
          />
          <line
            x1="75"
            y1="425"
            x2="425"
            y2="425"
            stroke="#d1d5db"
            strokeWidth="1.2"
          />

          {/* Render each tooth */}
          {teeth.map((tooth) => {
            const colors = getToothColors(tooth.id);
            const hasStatus =
              !!chart[tooth.id] && chart[tooth.id] !== "healthy";

            return (
              <g
                key={tooth.id}
                className="tooth-group"
                onClick={() => handleToothClick(tooth.id)}
              >
                {/* Tooth shape */}
                <g
                  transform={`translate(${tooth.x}, ${tooth.y}) rotate(${tooth.rotation})`}
                >
                  <path
                    className="tooth-outline"
                    d={getOutlinePath(tooth.type)}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="1.5"
                  />
                  <path
                    d={getDetailPath(tooth.type)}
                    fill="none"
                    stroke={colors.detailStroke}
                    strokeWidth="0.7"
                    opacity="0.5"
                  />
                </g>

                {/* Tooth number label */}
                <text
                  x={tooth.x + tooth.labelDx}
                  y={tooth.y + tooth.labelDy}
                  textAnchor={tooth.labelAnchor}
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight={hasStatus ? "700" : "500"}
                  fill={hasStatus ? "#1e293b" : "#94a3b8"}
                  className="select-none pointer-events-none"
                >
                  {tooth.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* AGGREGATE COUNTERS */}
      <div className="flex justify-center gap-4 flex-wrap">
        <div className="px-4 py-2 bg-amber-50 rounded-full border border-amber-100 text-[10px] font-bold text-amber-600 uppercase">
          Watch: {aggregate.watch}
        </div>
        <div className="px-4 py-2 bg-rose-50 rounded-full border border-rose-100 text-[10px] font-bold text-rose-600 uppercase">
          Issues: {aggregate.issue}
        </div>
        <div className="px-4 py-2 bg-blue-50 rounded-full border border-blue-100 text-[10px] font-bold text-blue-600 uppercase">
          Treated: {aggregate.treated}
        </div>
        <div className="px-4 py-2 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
          Missing: {aggregate.missing}
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-slate-900 hover:bg-gold-600 font-bold h-12"
        >
          {saving ? "Saving Chart..." : "Update Dental Chart"}
        </Button>
        <p className="text-center text-[10px] text-slate-400 uppercase font-medium">
          Note: This chart is optional. You only need to save if changes are
          made.
        </p>
      </div>
    </form>
  );
}
