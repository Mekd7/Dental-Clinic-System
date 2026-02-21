import { PatientService } from "@/services/patients-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckInDialog } from "./_components/CheckInDialog";

export default async function PatientDirectory() {
  const clinicId = "default-clinic-id"; 
  
  const patientsList = await PatientService.getDirectory(clinicId);
  const doctors = await PatientService.getDoctors(clinicId);

  //Debugging logs
   console.log("FETCHED DOCTORS:", doctors);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
        <p className="text-slate-500">Manage records and check-in patients for visits.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-gold-700 font-bold">Card ID</TableHead>
            <TableHead className="font-bold">Full Name</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="text-right font-bold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patientsList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                No patients found. Register a new patient to see them here.
              </TableCell>
            </TableRow>
          ) : (
            patientsList.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono font-bold text-gold-600">
                  {p.cardId}
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  {/* Fixed variant here */}
                  <Badge variant={p.paymentPlan?.status === 'RED' ? 'destructive' : 'default'}>
                    {p.paymentPlan?.status || "CLEAN"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <CheckInDialog patient={p} doctors={doctors} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}