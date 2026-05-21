"use client";

import { ClientStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { createClientAction } from "@/app/actions/client-actions";
import { ActionFeedback } from "@/components/action-feedback";
import { PendingButton } from "@/components/pending-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { initialActionState } from "@/lib/action-result";

export function QuickClientCreateForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(createClientAction, initialActionState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state]);

  return (
    <Card className="p-4">
      <ActionFeedback state={state} />
      <div className="mb-3 text-sm font-medium text-slate-700">Quick-create client</div>
      <form action={formAction} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_150px_auto]">
        <Input name="name" placeholder="Client name" required />
        <Input name="company" placeholder="Company" />
        <Input name="phone" placeholder="Phone" />
        <Select name="status" defaultValue={ClientStatus.PROSPECT}>
          <option value={ClientStatus.PROSPECT}>Prospect</option>
          <option value={ClientStatus.ACTIVE}>Active</option>
          <option value={ClientStatus.PAST}>Past</option>
        </Select>
        <PendingButton pendingText="Adding...">Add client</PendingButton>
      </form>
    </Card>
  );
}
