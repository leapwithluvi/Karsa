import { and, count, desc, eq, ilike, isNotNull, isNull, or, SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { createUserSchema, getUsersQuerySchema, updateUserSchema } from "./users.schema";
import { users } from "@/db/schema";
import z from "zod";
import { CreateUserInput, GetUsersQuery, UpdateUserInput } from "./users.types";

export const UserService = {
  async findPaginated(dbUrl: string, query: GetUsersQuery) {
    const db = getDb(dbUrl);
    const {page, limit, search} = query;
    const offset = (page - 1) * limit;
    
    const conditions: SQL[] = [isNull(users.deletedAt)];
    if (search) {
        const searchCondition = or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`)
        );

        if (searchCondition) {
            conditions.push(searchCondition);
        }
    }

    const whereClause = and(...conditions);

    const [data, [totalResult]] = await Promise.all([
        db.select().from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
        db.select({total: count()}).from(users).where(whereClause)    
    ]);

    const total = Number(totalResult?.total || 0);

    return {
        data,
        pagination: {
            page, limit, total, totalPages: Math.ceil(total/limit)
        }
    }
  },

  async findById(dbUrl: string, id: string) {
    const db = getDb(dbUrl);
    const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deletedAt)));

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async create(dbUrl: string, input: CreateUserInput) {
    const db = getDb(dbUrl);
    const [newUser] = await db.insert(users).values(input).returning();
    return newUser;
  },

  async update(dbUrl: string, id: string, input: UpdateUserInput) {
    const db = getDb(dbUrl);
    const [updatedUser] = await db
        .update(users)
        .set({...input, updatedAt: new Date()})
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
        .returning();

    if (!updatedUser) {
        throw new Error("User not found");
    }

    return updatedUser;
    },

    async softDelete(dbUrl: string, id: string) {
        const db = getDb(dbUrl);
        const [deletedUser] = await db
            .update(users)
            .set({ deletedAt: new Date()})
            .where(and(eq(users.id, id), isNull(users.deletedAt)))
            .returning()

        if (!deletedUser) {
            throw new Error("User not found");
        }

        return deletedUser;
    },

    async restore(dbUrl: string, id: string) {
        const db = getDb(dbUrl);
        const [restoredUser] = await db
            .update(users)
            .set({ deletedAt: null})
            .where(and(eq(users.id, id), isNotNull(users.deletedAt)))
            .returning()

        if (!restoredUser) {
            throw new Error("User not found or not deleted");
        }

        return restoredUser;
    }
};