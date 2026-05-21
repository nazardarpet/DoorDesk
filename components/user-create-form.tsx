"use client";

import { UserRole } from "@prisma/client";
import { useActionState } from "react";
import { createUserAction } from "@/app/actions/user-actions";
import { ActionFeedback } from "@/components/action-feedback";
import { PendingButton } from "@/components/pending-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { initialActionState } from "@/lib/action-result";

export function UserCreateForm() {
  const [state, formAction] = useActionState(createUserAction, initialActionState);

  return (
    <Card className="p-4">
      <ActionFeedback state={state} />
      <form action={formAction} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_150px_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select id="role" name="role" defaultValue={UserRole.SALES}>
            <option value={UserRole.SALES}>Sales</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </Select>
        </div>
        <PendingButton pendingText="Adding...">Add user</PendingButton>
      </form>
    </Card>
  );
}
