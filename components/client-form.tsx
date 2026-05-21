"use client";

import { ClientStatus } from "@prisma/client";
import { useActionState } from "react";
import { createClientAndRedirectAction, updateClientAction } from "@/app/actions/client-actions";
import { ActionFeedback } from "@/components/action-feedback";
import { PendingButton } from "@/components/pending-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/action-result";

type ClientFormValue = {
  id?: string;
  name?: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: ClientStatus;
  notes?: string | null;
};

export function ClientForm({ client }: { client?: ClientFormValue }) {
  const action = client?.id ? updateClientAction : createClientAndRedirectAction;
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <Card className="p-4">
      <ActionFeedback state={state} />
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        {client?.id && <input type="hidden" name="id" value={client.id} />}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={client?.name ?? ""} autoFocus required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" defaultValue={client?.company ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={client?.status ?? ClientStatus.PROSPECT}>
            <option value={ClientStatus.ACTIVE}>Active</option>
            <option value={ClientStatus.PAST}>Past</option>
            <option value={ClientStatus.PROSPECT}>Prospect</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" defaultValue={client?.address ?? ""} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" defaultValue={client?.notes ?? ""} />
        </div>
        <div className="md:col-span-2">
          <PendingButton pendingText="Saving...">{client?.id ? "Save client" : "Add client"}</PendingButton>
        </div>
      </form>
    </Card>
  );
}
