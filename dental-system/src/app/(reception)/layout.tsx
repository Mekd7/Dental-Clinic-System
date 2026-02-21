import { DashboardNav } from "@/components/dashboard/DashboardNav"; // Role-specific nav

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 border-r bg-white">
        <div className="p-6">
          <h1 className="text-gold-600 font-bold text-xl uppercase">Golden Reception</h1>
        </div>
        {/* Navigation specific to Receptionist */}
        <DashboardNav role="RECEPTIONIST" /> 
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}