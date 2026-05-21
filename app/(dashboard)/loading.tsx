import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-44 rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="h-28 animate-pulse bg-white" />
        <Card className="h-28 animate-pulse bg-white" />
        <Card className="h-28 animate-pulse bg-white" />
      </div>
      <Card className="h-80 animate-pulse bg-white" />
    </div>
  );
}
