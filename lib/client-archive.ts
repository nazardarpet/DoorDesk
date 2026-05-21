import type { Prisma } from "@prisma/client";

export type ClientArchiveFilter = "active" | "archived" | "all";

export function clientArchiveWhere(filter: ClientArchiveFilter = "active"): Prisma.ClientWhereInput {
  if (filter === "archived") {
    return { archivedAt: { not: null } };
  }

  if (filter === "all") {
    return {};
  }

  return { archivedAt: null };
}
