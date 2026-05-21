export type ActionResult<T = unknown> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

export const initialActionState: ActionResult = {
  success: false,
  error: ""
};
