import z from "zod";

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string(),
});

export const updateUserSchema = createUserSchema.partial();

export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});