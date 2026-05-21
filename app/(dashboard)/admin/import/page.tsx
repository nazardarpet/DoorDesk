import { ProductImportForm } from "@/components/product-import-form";
import { requireAdmin } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function ProductImportPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Product import</h1>
        <p className="text-sm text-slate-500">Preview and import Shopify CSV or XLSX exports into the product catalog.</p>
      </div>
      <ProductImportForm />
    </div>
  );
}
