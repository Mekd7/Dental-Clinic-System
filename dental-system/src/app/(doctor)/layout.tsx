import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Separator } from "@/components/ui/separator";

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-gold-500/30">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center text-slate-900 font-bold">
              G
            </div>
            <h1 className="text-xl font-bold text-gold-500 tracking-tighter uppercase">
              Golden Exam
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Doctor Portal
          </p>
        </div>
        
        <Separator className="bg-slate-800" />
        
        <div className="flex-1 overflow-y-auto">
          {/* Passing 'DOCTOR' role to your Nav component */}
          <DashboardNav role="DOCTOR" />
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-gold-500/10">
            <p className="text-[10px] text-gold-500 font-bold uppercase">Active Session</p>
            <p className="text-sm font-medium text-slate-200">Dr. Abel Solomon</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}