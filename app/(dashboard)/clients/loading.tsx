import { Card } from "@/components/ui/card";

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded bg-slate-200" />
      <Card className="h-56 animate-pulse bg-white" />
      <Card className="h-96 animate-pulse bg-white" />
    </div>
  );
}
