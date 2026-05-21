"use client";

import { Upload } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PreviewRow = {
  title: string;
  shopifyId?: string;
  sku?: string;
  family?: string;
  style?: string;
  height?: number;
  width?: number;
  thickness?: number;
  core?: string;
  skipped: boolean;
  reason?: string;
};

type ImportResult = {
  rows?: PreviewRow[];
  summary?: { valid: number; skipped: number };
  created?: number;
  updated?: number;
  skipped?: number;
  skippedRows?: { title: string; reason?: string }[];
  preview?: PreviewRow[];
  error?: string;
};

async function uploadImport(file: File, mode: "preview" | "import") {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("mode", mode);

  const response = await fetch("/api/admin/import/products", {
    method: "POST",
    body: formData
  });

  const result = (await response.json()) as ImportResult;
  if (!response.ok) {
    throw new Error(result.error ?? "Import failed.");
  }

  return result;
}

export function ProductImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const rows = result?.rows ?? result?.preview ?? [];

  function run(mode: "preview" | "import") {
    if (!file) {
      toast.error("Choose a CSV or XLSX file first.");
      return;
    }

    startTransition(async () => {
      try {
        const nextResult = await uploadImport(file, mode);
        setResult(nextResult);
        toast.success(mode === "preview" ? "Preview ready." : "Import complete.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Import failed.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card className="grid gap-4 p-4 md:grid-cols-[1fr_auto_auto] md:items-end">
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Shopify export</div>
          <Input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>
        <Button type="button" variant="secondary" onClick={() => run("preview")} disabled={isPending}>
          Preview
        </Button>
        <Button type="button" onClick={() => run("import")} disabled={isPending || !rows.length}>
          <Upload className="h-4 w-4" />
          Confirm import
        </Button>
      </Card>
      {result && (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium">
            {result.summary
              ? `${result.summary.valid} valid, ${result.summary.skipped} skipped`
              : `${result.created ?? 0} created, ${result.updated ?? 0} updated, ${result.skipped ?? 0} skipped`}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Family</th>
                  <th className="px-4 py-3">Style</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Core</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.sku}-${index}`} className="border-t border-slate-100">
                    <td className="px-4 py-3">{row.title}</td>
                    <td className="px-4 py-3">{row.sku ?? ""}</td>
                    <td className="px-4 py-3">{row.family ?? ""}</td>
                    <td className="px-4 py-3">{row.style ?? ""}</td>
                    <td className="px-4 py-3">
                      {[row.height, row.width, row.thickness].filter(Boolean).join(" x ")}
                    </td>
                    <td className="px-4 py-3">{row.core ?? ""}</td>
                    <td className="px-4 py-3">{row.skipped ? row.reason : "Ready"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
