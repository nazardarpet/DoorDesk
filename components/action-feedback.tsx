"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-result";

export function ActionFeedback({ state }: { state: ActionResult }) {
  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
    }

    if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return null;
}
