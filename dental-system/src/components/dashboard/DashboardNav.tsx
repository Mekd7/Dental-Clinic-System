"use client";
import Link from "next/link";
import {
  Users,
  Clock,
  ClipboardPlus,
  CreditCard,
  Activity,
  CheckCircle2,
} from "lucide-react";

export function DashboardNav({
  role,
}: {
  role: "DOCTOR" | "RECEPTIONIST" | "PATIENT";
}) {
  const menuItems = {
    RECEPTIONIST: [
      { name: "Patient Directory", href: "/dashboard/patients", icon: Users },
      {
        name: "New Patients",
        href: "/dashboard/patients/new",
        icon: ClipboardPlus,
      },
      { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    ],
    DOCTOR: [
      { name: "Waiting Room", href: "/dashboard/waiting-room", icon: Clock },
      {
        name: "Completed Today",
        href: "/dashboard/completed-today",
        icon: CheckCircle2,
      },
      { name: "My Exams", href: "/dashboard/history", icon: Activity },
    ],
    PATIENT: [
      { name: "My Balance", href: "/portal/billing", icon: CreditCard },
      { name: "My Records", href: "/portal/history", icon: Activity },
    ],
  };

  const activeMenu = menuItems[role];

  return (
    <div className="p-4 space-y-2">
      {activeMenu.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gold-500/10 hover:text-gold-600 transition-all"
        >
          <item.icon className="w-5 h-5" />
          <span className="font-medium">{item.name}</span>
        </Link>
      ))}
    </div>
  );
}
