import { ClientStatus, Handing, OrderStatus, UserRole } from "@prisma/client";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : undefined))
  .optional();

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRole)
});

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const userStatusSchema = z.object({
  userId: z.string().min(1),
  isActive: z.boolean()
});

export const clientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  company: optionalText,
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .transform((value) => (value.length ? value : undefined))
    .or(z.literal("").transform(() => undefined))
    .optional(),
  phone: optionalText,
  address: optionalText,
  status: z.nativeEnum(ClientStatus),
  notes: optionalText
});

export const updateClientSchema = clientSchema.extend({
  id: z.string().min(1)
});

const decimalString = z
  .string()
  .trim()
  .min(1, "Required")
  .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Must be a positive number");

const integerString = z
  .string()
  .trim()
  .min(1, "Required")
  .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, "Must be a positive whole number");

export const orderItemSchema = z.object({
  id: optionalText,
  productId: z.string().trim().min(1, "Select a product from the imported catalog"),
  sku: z.string().trim().min(1, "SKU is required"),
  family: z.string().trim().min(1, "Family is required"),
  style: z.string().trim().min(1, "Style is required"),
  height: decimalString,
  width: decimalString,
  thickness: decimalString,
  core: z.string().trim().min(1, "Core is required"),
  quantity: integerString,
  handing: z.nativeEnum(Handing),
  notes: optionalText
});

export const createOrderSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  notes: optionalText,
  items: z.array(orderItemSchema).min(1, "Add at least one door")
});

export const updateOrderSchema = createOrderSchema.extend({
  id: z.string().min(1)
});

export const transitionOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.nativeEnum(OrderStatus)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
