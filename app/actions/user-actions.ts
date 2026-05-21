"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/action-result";
import { createUserSchema, resetPasswordSchema, userStatusSchema } from "@/lib/validations";

export async function createUserAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role")
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid user data." };
  }

  const { password, ...userData } = parsed.data;

  try {
    await prisma.user.create({
      data: {
        ...userData,
        passwordHash: await hashPassword(password)
      },
      select: { id: true }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "A user with that email already exists." };
    }

    return { success: false, error: "Unable to create user." };
  }

  revalidatePath("/admin");
  return { success: true, message: "User created." };
}

export async function setUserActiveAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = userStatusSchema.safeParse({
    userId: formData.get("userId"),
    isActive: formData.get("isActive") === "true"
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid user status update." };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { isActive: parsed.data.isActive },
    select: { id: true }
  });

  revalidatePath("/admin");
  return { success: true, message: "User updated." };
}

export async function resetPasswordAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = resetPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid password." };
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash: await hashPassword(parsed.data.password) },
    select: { id: true }
  });

  revalidatePath("/admin");
  return { success: true, message: "Password reset." };
}
