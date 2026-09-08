import z from "zod";
import { sanitizeHtml } from "@/common/utils/sanitize";

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().transform(sanitizeHtml).optional(),
});

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format").transform(sanitizeHtml),
  name: z.string().transform(sanitizeHtml),
});

export const updateUserSchema = createUserSchema.partial();

export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});