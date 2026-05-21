import { describe, expect, test } from "vitest";
import { formatClientId, nextClientIdFromLatest } from "@/lib/client-id";

describe("client id generation", () => {
  test("formats numeric sequences as padded client ids", () => {
    expect(formatClientId(1)).toBe("CLT-00001");
    expect(formatClientId(42)).toBe("CLT-00042");
  });

  test("generates the next id from the latest stored id", () => {
    expect(nextClientIdFromLatest(null)).toBe("CLT-00001");
    expect(nextClientIdFromLatest("CLT-00042")).toBe("CLT-00043");
  });

  test("falls back to the first id if the latest id is malformed", () => {
    expect(nextClientIdFromLatest("CLIENT-42")).toBe("CLT-00001");
  });
});
