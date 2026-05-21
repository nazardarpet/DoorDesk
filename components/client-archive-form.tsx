"use client";

import { useActionState } from "react";
import { archiveClientAction, restoreClientAction } from "@/app/actions/client-actions";
import { ActionFeedback } from "@/components/action-feedback";
import { PendingButton } from "@/components/pending-button";
import { initialActionState } from "@/lib/action-result";

export function ClientArchiveForm({
  clientId,
  archived
}: {
  clientId: string;
  archived: boolean;
}) {
  const action = archived ? restoreClientAction : archiveClientAction;
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction}>
      <ActionFeedback state={state} />
      <input type="hidden" name="id" value={clientId} />
      <PendingButton variant={archived ? "default" : "secondary"} pendingText="Saving...">
        {archived ? "Restore client" : "Archive client"}
      </PendingButton>
    </form>
  );
}
