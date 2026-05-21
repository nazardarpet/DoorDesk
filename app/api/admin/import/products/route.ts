import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { parseShopifyCsv, rowsFromWorksheetJson, summarizeImportRows } from "@/lib/product-import";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("file");
  const mode = String(formData.get("mode") ?? "preview");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a CSV or XLSX file." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop()?.toLowerCase();
  const isExcel = extension === "xlsx" || extension === "xls";
  const rows = isExcel
    ? await (async () => {
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(buffer, { type: "buffer" });
        return rowsFromWorksheetJson(
          XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]])
        );
      })()
    : parseShopifyCsv(buffer.toString("utf8"));

  const summary = summarizeImportRows(rows);

  if (mode !== "import") {
    return NextResponse.json({
      rows: rows.slice(0, 50),
      summary
    });
  }

  let created = 0;
  let updated = 0;
  const skipped = rows.filter((row) => row.skipped).map((row) => ({ title: row.title, reason: row.reason }));

  for (const row of rows) {
    if (row.skipped) {
      continue;
    }

    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          ...(row.shopifyId ? [{ shopifyId: row.shopifyId }] : []),
          ...(row.sku ? [{ sku: row.sku }] : [])
        ]
      },
      select: { id: true }
    });

    const data = {
      shopifyId: row.shopifyId,
      title: row.title,
      family: row.family,
      style: row.style,
      sku: row.sku,
      height: row.height,
      width: row.width,
      thickness: row.thickness,
      core: row.core,
      rawData: row.rawData
    };

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data,
        select: { id: true }
      });
      updated += 1;
    } else {
      await prisma.product.create({
        data,
        select: { id: true }
      });
      created += 1;
    }
  }

  return NextResponse.json({
    created,
    updated,
    skipped: skipped.length,
    skippedRows: skipped,
    preview: rows.slice(0, 20)
  });
}
