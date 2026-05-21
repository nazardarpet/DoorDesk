import Link from "next/link";
import { ClientStatus, Prisma } from "@prisma/client";
import { ClientForm } from "@/components/client-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireUser } from "@/lib/auth-guards";
import { clientArchiveWhere, type ClientArchiveFilter } from "@/lib/client-archive";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  q?: string;
  status?: ClientStatus;
  archive?: ClientArchiveFilter;
  sort?: "name" | "date";
  page?: string;
}>;

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();
  const params = await searchParams;
  const page = Math.max(Number(params.page ?? "1"), 1);
  const query = params.q?.trim();
  const status = Object.values(ClientStatus).includes(params.status as ClientStatus)
    ? params.status
    : undefined;
  const archive: ClientArchiveFilter =
    params.archive === "archived" || params.archive === "all" ? params.archive : "active";
  const sort = params.sort === "name" ? "name" : "date";

  const where: Prisma.ClientWhereInput = {
    ...clientArchiveWhere(archive),
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { uniqueClientId: { contains: query, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [clients, count] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: sort === "name" ? { name: "asc" } : { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        uniqueClientId: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        status: true,
        archivedAt: true,
        createdAt: true
      }
    }),
    prisma.client.count({ where })
  ]);

  const totalPages = Math.max(Math.ceil(count / PAGE_SIZE), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Clients</h1>
        <p className="text-sm text-slate-500">Search, filter, and add sales clients.</p>
      </div>
      <ClientForm />
      <Card className="overflow-hidden">
        <form className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_160px_160px_160px_auto]">
          <Input name="q" placeholder="Search clients" defaultValue={query ?? ""} />
          <Select name="status" defaultValue={status ?? ""}>
            <option value="">All statuses</option>
            <option value={ClientStatus.ACTIVE}>Active</option>
            <option value={ClientStatus.PAST}>Past</option>
            <option value={ClientStatus.PROSPECT}>Prospect</option>
          </Select>
          <Select name="sort" defaultValue={sort}>
            <option value="date">Newest</option>
            <option value="name">Name</option>
          </Select>
          <Select name="archive" defaultValue={archive}>
            <option value="active">Active list</option>
            <option value="archived">Archived</option>
            <option value="all">All clients</option>
          </Select>
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Client ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Archive</th>
                <th className="px-4 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">{client.uniqueClientId}</td>
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3">{client.company ?? ""}</td>
                  <td className="px-4 py-3">{client.email ?? ""}</td>
                  <td className="px-4 py-3">{client.phone ?? ""}</td>
                  <td className="px-4 py-3">{client.status}</td>
                  <td className="px-4 py-3">{client.archivedAt ? "Archived" : ""}</td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/clients/${client.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {!clients.length && (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={8}>
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href={`/clients?page=${Math.max(page - 1, 1)}&archive=${archive}`}>Previous</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/clients?page=${Math.min(page + 1, totalPages)}&archive=${archive}`}>Next</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
