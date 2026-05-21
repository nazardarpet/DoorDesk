"use client";

import { useActionState } from "react";
import { setUserActiveAction } from "@/app/actions/user-actions";
import { ActionFeedback } from "@/components/action-feedback";
import { PendingButton } from "@/components/pending-button";
import { initialActionState } from "@/lib/action-result";

export function UserStatusForm({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [state, formAction] = useActionState(setUserActiveAction, initialActionState);

  return (
    <form action={formAction}>
      <ActionFeedback state={state} />
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <PendingButton type="submit" size="sm" variant={isActive ? "secondary" : "default"} pendingText="Saving">
        {isActive ? "Deactivate" : "Reactivate"}
      </PendingButton>
    </form>
  );
}
