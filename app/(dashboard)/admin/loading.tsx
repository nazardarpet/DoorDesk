import { Card } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 rounded bg-slate-200" />
      <Card className="h-32 animate-pulse bg-white" />
      <Card className="h-96 animate-pulse bg-white" />
    </div>
  );
}
