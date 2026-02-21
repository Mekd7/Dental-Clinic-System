"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { checkInAction } from "@/app/actions/visits";

export function CheckInDialog({ patient, doctors }: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCheckIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    // Safely extract and cast to string
    const doctorId = formData.get("doctorId") as string;
    const reason = formData.get("reason") as string;

    // Validation check for TypeScript and UX
    if (!doctorId || !reason) {
      toast.error("Please select a doctor and provide a reason.");
      setLoading(false);
      return;
    }

    const data = {
      patientId: patient.id as string,
      doctorId: doctorId,
      reason: reason,
      clinicId: "default-clinic-id",
    };

    const res = await checkInAction(data);

    if (res.success) {
      toast.success(`${patient.name} is now in the queue`);
      setOpen(false);
    } else {
      toast.error(res.error || "Failed to check in");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-gold-600 text-white border border-gold-500/20">
          Check In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] bg-white border-t-4 border-gold-500 shadow-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Assign to Doctor
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Starting visit for {patient.name}
          </p>
        </DialogHeader>
        <form onSubmit={handleCheckIn} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="doctorId">Attending Doctor</Label>
            <Select name="doctorId" required>
              <SelectTrigger className="focus:ring-gold-500">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doc: any) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Input
              id="reason"
              name="reason"
              placeholder="e.g., Braces Tightening, Pain, Consultation"
              required
              className="focus-visible:ring-gold-500"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold"
            >
              {loading ? "Adding to Queue..." : "Confirm Check-In"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
