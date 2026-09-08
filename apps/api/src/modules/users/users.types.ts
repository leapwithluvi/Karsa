import z from "zod";
import { User } from "@/db/schema/users";
import { createUserSchema, getUsersQuerySchema, updateUserSchema, userIdParamSchema } from "./users.schema";

export type {User};

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type UserResponse = Omit<User,"deletedAt">;