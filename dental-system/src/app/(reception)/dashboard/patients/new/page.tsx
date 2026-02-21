"use client";

import { useState } from "react";
import { registerPatientAction } from "@/app/actions/patients";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function NewPatientPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const result = await registerPatientAction(data);

    if (result.success) {
      toast.success("Success", { description: "Patient added and assigned Card ID." });
      // REDIRECT to the list
      router.push("/dashboard/patients");
    } else {
      toast.error("Error", { description: result.error });
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card className="border-t-4 border-t-gold-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-800">Patient Registration</CardTitle>
          <CardDescription>Fill in bio-data to generate a new medical card.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="name" required className="focus-visible:ring-gold-500" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input name="phone" required placeholder="09..." />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input name="age" type="number" required />
              </div>
              <div className="space-y-2">
                <Label>Sex</Label>
                <Select name="sex" required>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>Sub-City (S.C)</Label>
                  <Input name="subCity" className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label>Woreda (W)</Label>
                  <Input name="woreda" className="bg-white" />
                </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold">
              {loading ? "Processing..." : "Register & Open Card"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}