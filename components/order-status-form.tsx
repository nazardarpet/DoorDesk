"use client";

import { OrderStatus } from "@prisma/client";
import { useActionState } from "react";
import { transitionOrderStatusAction } from "@/app/actions/order-actions";
import { ActionFeedback } from "@/components/action-feedback";
import { PendingButton } from "@/components/pending-button";
import { Select } from "@/components/ui/select";
import { initialActionState } from "@/lib/action-result";
import { nextOrderStatuses } from "@/lib/order-status";

export function OrderStatusForm({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [state, formAction] = useActionState(transitionOrderStatusAction, initialActionState);
  const nextStatuses = nextOrderStatuses(status);

  if (!nextStatuses.length) {
    return <span className="text-sm text-slate-500">No status changes available</span>;
  }

  return (
    <form action={formAction} className="flex gap-2">
      <ActionFeedback state={state} />
      <input type="hidden" name="orderId" value={orderId} />
      <Select name="status" defaultValue={nextStatuses[0] ?? OrderStatus.CANCELLED}>
        {nextStatuses.map((nextStatus) => (
          <option key={nextStatus} value={nextStatus}>
            {nextStatus}
          </option>
        ))}
      </Select>
      <PendingButton variant="secondary" pendingText="Updating...">
        Update status
      </PendingButton>
    </form>
  );
}
