import { ApiResponse } from "@/common/types";
import { createConfig } from "@/config/env";
import { Context, Hono } from "hono";
import { env } from "hono/adapter";
import { UserService } from "./users.service";
import { createUserSchema, getUsersQuerySchema, updateUserSchema, userIdParamSchema } from "./users.schema";

const userRoutes = new Hono();
const getDbUrl = (c: Context) => createConfig(env(c)).db.url;

const buildResponse = <T>(data?: T, error?: ApiResponse["error"]): ApiResponse<T> => ({
    success: !error,
    ...(data !== undefined && {data}),
    ...(error && {error}),
    meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
    },
});

// GET /api/v1/users
userRoutes.get("/", async (c) => {
    const queryResult = getUsersQuerySchema.safeParse(c.req.query());
    if (!queryResult.success) {
        return c.json(buildResponse(undefined, {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: queryResult.error.flatten().fieldErrors,
        }), 400);
    }

    const result = await UserService.findPaginated(getDbUrl(c), queryResult.data);
    return c.json({
        ...buildResponse(result.data),
        meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            ...result.pagination,
        }
    })
})

// POST /api/v1/users
userRoutes.post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parseResult = createUserSchema.safeParse(body)

    if (!parseResult.success) {
        return c.json(buildResponse(undefined, {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: parseResult.error.flatten().fieldErrors,
        }),
        400 
       );
    }

    const newUser = await UserService.create(getDbUrl(c), parseResult.data);
    return c.json(buildResponse(newUser), 201)
})

// GET /api/v1/users/:id
userRoutes.get("/:id", async (c) => {
    const paramResult = userIdParamSchema.safeParse(c.req.param());
    if (!paramResult.success) {
        return c.json(buildResponse(undefined, {
            code: "BAD_REQUEST",
            message: "Invalid UUID format",
            details: paramResult.error.flatten().fieldErrors,
        }),
        400
    )
    }

    const user = await UserService.findById(getDbUrl(c), paramResult.data.id)
    if (!user) {
        return c.json(buildResponse(undefined, {
            code: "NOT_FOUND",
            message: "User not found",
        }), 404);
    }
    return c.json(buildResponse(user))
})

// PATCH /api/v1/users/:id
userRoutes.patch("/:id", async (c) => {
    const paramResult = userIdParamSchema.safeParse(c.req.param());
    if (!paramResult.success) {
        return c.json(buildResponse(undefined, {
            code: "BAD_REQUEST",
            message: "Invalid UUID format",
            details: paramResult.error.flatten().fieldErrors,
        }),
        400
    )
    }

    const body = await c.req.json().catch(() => ({}));
    const bodyResult = updateUserSchema.safeParse(body)

    if (!bodyResult.success) {
        return c.json(buildResponse(undefined, {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: bodyResult.error.flatten().fieldErrors,
        }),
        400
    )
    }

    const updatedUser = await UserService.update(getDbUrl(c), paramResult.data.id, bodyResult.data);
    if (!updatedUser) {
        return c.json(buildResponse(undefined, {
            code: "NOT_FOUND",
            message: "User not found",
        }), 404);
    }
    return c.json(buildResponse(updatedUser))
})

// DELETE /api/v1/users/:id
userRoutes.delete("/:id", async (c) => {
    const paramResult = userIdParamSchema.safeParse(c.req.param());
    if (!paramResult.success) {
        return c.json(buildResponse(undefined, {
            code: "BAD_REQUEST",
            message: "Invalid UUID format",
            details: paramResult.error.flatten().fieldErrors,
        }),
        400
    )
    }

    const deletedUser = await UserService.softDelete(getDbUrl(c), paramResult.data.id);
    if (!deletedUser) {
        return c.json(buildResponse(undefined, {
            code: "NOT_FOUND",
            message: "User not found",
        }), 404);
    }
    return c.json(buildResponse(deletedUser))
})

// POST /api/v1/users/:id/restore
userRoutes.post("/:id/restore", async (c) => {
    const paramResult = userIdParamSchema.safeParse(c.req.param());
    if (!paramResult.success) {
        return c.json(buildResponse(undefined, {
            code: "BAD_REQUEST",
            message: "Invalid UUID format",
            details: paramResult.error.flatten().fieldErrors,
        }),
        400
    )
    }

    const restoredUser = await UserService.restore(getDbUrl(c), paramResult.data.id);
    if (!restoredUser) {
        return c.json(buildResponse(undefined, {
            code: "NOT_FOUND",
            message: "User not found",
        }), 404);
    }
    return c.json(buildResponse(restoredUser))
})

export default userRoutes;