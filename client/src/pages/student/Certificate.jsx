import React from "react";
import { Button } from "@/components/ui/button";
import { Award, Printer } from "lucide-react";

const Certificate = ({ courseTitle, userName, completedAt = new Date() }) => {
  const date = new Date(completedAt).toLocaleDateString();
  const handlePrint = () => window.print();

  return (
    <div className="space-y-3">
      <div className="flex justify-end print:hidden">
        <Button onClick={handlePrint} variant="outline"><Printer className="mr-2 h-4 w-4" /> Print / Save PDF</Button>
      </div>
      <section className="mx-auto max-w-4xl border-8 border-double border-gray-700 bg-white p-10 text-center text-gray-900 shadow-xl print:shadow-none">
        <Award className="mx-auto mb-4 h-16 w-16" />
        <p className="text-sm uppercase tracking-[0.3em]">E-Coders</p>
        <h2 className="mt-5 text-4xl font-bold">Certificate of Completion</h2>
        <p className="mt-8 text-lg">This certificate is proudly presented to</p>
        <h3 className="mt-3 text-3xl font-semibold">{userName}</h3>
        <p className="mx-auto mt-6 max-w-2xl text-lg">for successfully completing the course</p>
        <h4 className="mt-3 text-2xl font-bold">{courseTitle}</h4>
        <p className="mt-8 text-sm">Completed on {date}</p>
        <div className="mx-auto mt-12 w-56 border-t border-gray-700 pt-2 text-sm">E-Coders</div>
      </section>
    </div>
  );
};

export default Certificate;
