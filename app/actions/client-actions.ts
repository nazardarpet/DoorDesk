"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { nextClientIdFromLatest } from "@/lib/client-id";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/action-result";
import { clientSchema, updateClientSchema } from "@/lib/validations";

export async function createClientAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid client data." };
  }

  try {
    const client = await prisma.$transaction(async (tx) => {
      const latestClient = await tx.client.findFirst({
        orderBy: { uniqueClientId: "desc" },
        select: { uniqueClientId: true }
      });

      return tx.client.create({
        data: {
          ...parsed.data,
          uniqueClientId: nextClientIdFromLatest(latestClient?.uniqueClientId ?? null),
          createdById: user.id
        },
        select: { id: true }
      });
    });

    revalidatePath("/clients");
    return { success: true, data: client, message: "Client created." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Client ID collision. Please try again." };
    }

    return { success: false, error: "Unable to create client." };
  }
}

export async function updateClientAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();

  const parsed = updateClientSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid client data." };
  }

  const { id, ...data } = parsed.data;

  await prisma.client.update({
    where: { id },
    data,
    select: { id: true }
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return { success: true, message: "Client updated." };
}

export async function createClientAndRedirectAction(
  previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const result = await createClientAction(previousState, formData);

  if (!result.success) {
    return result;
  }

  redirect(`/clients/${result.data?.id}`);
}

export async function archiveClientAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { success: false, error: "Client is required." };
  }

  await prisma.client.update({
    where: { id },
    data: { archivedAt: new Date() },
    select: { id: true }
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return { success: true, message: "Client archived." };
}

export async function restoreClientAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { success: false, error: "Client is required." };
  }

  await prisma.client.update({
    where: { id },
    data: { archivedAt: null },
    select: { id: true }
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return { success: true, message: "Client restored." };
}
