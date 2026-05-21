"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/app/actions/user-actions";
import { ActionFeedback } from "@/components/action-feedback";
import { PendingButton } from "@/components/pending-button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-result";

export function PasswordResetForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, initialActionState);

  return (
    <form action={formAction} className="flex min-w-64 gap-2">
      <ActionFeedback state={state} />
      <input type="hidden" name="userId" value={userId} />
      <Input name="password" type="password" minLength={8} placeholder="New password" required />
      <PendingButton size="sm" variant="secondary" pendingText="Saving">
        Reset
      </PendingButton>
    </form>
  );
}
