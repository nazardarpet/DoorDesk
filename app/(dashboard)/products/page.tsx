import Link from "next/link";
import { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireUser } from "@/lib/auth-guards";
import { buildProductWhere, productPageHref, resolveProductListParams } from "@/lib/product-filters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  q?: string;
  family?: string;
  height?: string;
  width?: string;
  core?: string;
  thickness?: string;
  page?: string;
}>;

function formatInches(value: { toString(): string } | number | string | null, suffix = "\"") {
  return value == null ? "" : `${value.toString()}${suffix}`;
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = resolveProductListParams(await searchParams);
  const where = buildProductWhere(params);

  const [products, count, totalProducts, families, heights, widths, cores, thicknesses] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ familyCode: "asc" }, { style: "asc" }, { sku: "asc" }],
      skip: (params.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        sku: true,
        title: true,
        family: true,
        familyCode: true,
        familyName: true,
        style: true,
        height: true,
        heightCode: true,
        width: true,
        widthCode: true,
        thickness: true,
        thicknessCode: true,
        core: true,
        coreCode: true,
        updatedAt: true
      }
    }),
    prisma.product.count({ where }),
    prisma.product.count(),
    prisma.product.findMany({
      where: { familyCode: { not: null } },
      distinct: ["familyCode"],
      orderBy: { familyCode: "asc" },
      select: { familyCode: true, familyName: true, family: true }
    }),
    prisma.product.findMany({
      where: { heightCode: { not: null } },
      distinct: ["heightCode"],
      orderBy: { heightCode: "asc" },
      select: { heightCode: true, height: true }
    }),
    prisma.product.findMany({
      where: { widthCode: { not: null } },
      distinct: ["widthCode"],
      orderBy: { widthCode: "asc" },
      select: { widthCode: true, width: true }
    }),
    prisma.product.findMany({
      where: { coreCode: { not: null } },
      distinct: ["coreCode"],
      orderBy: { coreCode: "asc" },
      select: { coreCode: true, core: true }
    }),
    prisma.product.findMany({
      where: { thicknessCode: { not: null } },
      distinct: ["thicknessCode"],
      orderBy: { thicknessCode: "asc" },
      select: { thicknessCode: true, thickness: true }
    })
  ]);

  const totalPages = Math.max(Math.ceil(count / PAGE_SIZE), 1);
  const previousHref = productPageHref("/products", { ...params, page: Math.max(params.page - 1, 1) });
  const nextHref = productPageHref("/products", { ...params, page: Math.min(params.page + 1, totalPages) });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Products</h1>
          <p className="text-sm text-slate-500">Browse imported Shopify door products by SKU and catalog specs.</p>
        </div>
        {user.role === UserRole.ADMIN && (
          <Button asChild variant="secondary">
            <Link href="/admin/import">Import products</Link>
          </Button>
        )}
      </div>
      <Card className="overflow-hidden">
        <form className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[minmax(180px,1fr)_140px_120px_120px_120px_120px_auto]">
          <Input name="q" placeholder="Search SKU, title, family, core" defaultValue={params.query} />
          <Select name="family" defaultValue={params.familyCode}>
            <option value="">All families</option>
            {families.map((family) => (
              <option key={family.familyCode ?? ""} value={family.familyCode ?? ""}>
                {family.familyName ?? family.family ?? family.familyCode}
              </option>
            ))}
          </Select>
          <Select name="height" defaultValue={params.heightCode}>
            <option value="">All heights</option>
            {heights.map((height) => (
              <option key={height.heightCode ?? ""} value={height.heightCode ?? ""}>
                {height.heightCode} - {formatInches(height.height)}
              </option>
            ))}
          </Select>
          <Select name="width" defaultValue={params.widthCode}>
            <option value="">All widths</option>
            {widths.map((width) => (
              <option key={width.widthCode ?? ""} value={width.widthCode ?? ""}>
                {width.widthCode} - {formatInches(width.width)}
              </option>
            ))}
          </Select>
          <Select name="core" defaultValue={params.coreCode}>
            <option value="">All cores</option>
            {cores.map((core) => (
              <option key={core.coreCode ?? ""} value={core.coreCode ?? ""}>
                {core.coreCode} - {core.core}
              </option>
            ))}
          </Select>
          <Select name="thickness" defaultValue={params.thicknessCode}>
            <option value="">All thick.</option>
            {thicknesses.map((thickness) => (
              <option key={thickness.thicknessCode ?? ""} value={thickness.thicknessCode ?? ""}>
                {thickness.thicknessCode} - {formatInches(thickness.thickness)}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Title / Style</th>
                <th className="px-4 py-3">Family</th>
                <th className="px-4 py-3">Height</th>
                <th className="px-4 py-3">Width</th>
                <th className="px-4 py-3">Thick</th>
                <th className="px-4 py-3">Core</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-slate-950">{product.sku ?? ""}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">{product.title}</div>
                    {product.style && product.style !== product.title ? (
                      <div className="text-xs text-slate-500">{product.style}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{product.familyName ?? product.family ?? ""}</td>
                  <td className="px-4 py-3">{formatInches(product.height)}</td>
                  <td className="px-4 py-3">{formatInches(product.width)}</td>
                  <td className="px-4 py-3">{formatInches(product.thickness)}</td>
                  <td className="px-4 py-3">{product.core ?? ""}</td>
                  <td className="px-4 py-3">{product.updatedAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {!products.length && (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={8}>
                    {totalProducts === 0 ? (
                      <>
                        No imported products yet.
                        {user.role === UserRole.ADMIN ? (
                          <>
                            {" "}
                            <Link className="font-medium text-cyan-800 hover:underline" href="/admin/import">
                              Import products
                            </Link>
                            .
                          </>
                        ) : null}
                      </>
                    ) : (
                      "No products found."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <span>
            Page {params.page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href={previousHref}>Previous</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={nextHref}>Next</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
