import { describe, expect, test } from "vitest";
import { clientSchema, createUserSchema } from "@/lib/validations";

describe("validation schemas", () => {
  test("requires client names", () => {
    const result = clientSchema.safeParse({ name: "", status: "ACTIVE" });

    expect(result.success).toBe(false);
  });

  test("normalizes user email and accepts supported roles", () => {
    const result = createUserSchema.parse({
      name: "Nazar",
      email: "NAZAR@EXAMPLE.COM",
      password: "strong-password",
      role: "ADMIN"
    });

    expect(result.email).toBe("nazar@example.com");
    expect(result.role).toBe("ADMIN");
  });
});
