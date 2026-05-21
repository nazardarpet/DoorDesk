import { describe, expect, test } from "vitest";
import { clientArchiveWhere } from "@/lib/client-archive";

describe("client archive filters", () => {
  test("hides archived clients by default", () => {
    expect(clientArchiveWhere("active")).toEqual({ archivedAt: null });
  });

  test("can filter to archived clients", () => {
    expect(clientArchiveWhere("archived")).toEqual({ archivedAt: { not: null } });
  });

  test("can include all clients", () => {
    expect(clientArchiveWhere("all")).toEqual({});
  });
});
