import { describe, expect, it } from "bun:test";
import app from "@/index";

describe("Users CRUD API Integration Tests", () => {
  let createdUserId: string;
  const testEmail = `test_${Date.now()}@karsa.dev`;

  it("GET /api/v1/users - Should return 200 OK and paginated users list", async () => {
    const res = await app.request("/api/v1/users?page=1&limit=10");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.meta).toBeDefined();
    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(10);
  });

  it("POST /api/v1/users - Should create a new user", async () => {
    const res = await app.request("/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        name: "Test User Unit",
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(testEmail);
    expect(body.data.name).toBe("Test User Unit");

    createdUserId = body.data.id;
  });

  it("GET /api/v1/users/:id - Should return 200 OK for created user", async () => {
    if (!createdUserId) return;

    const res = await app.request(`/api/v1/users/${createdUserId}`);
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdUserId);
  });

  it("GET /api/v1/users/:id - Should return 400 Bad Request for invalid UUID", async () => {
    const res = await app.request("/api/v1/users/invalid-uuid-123");
    expect(res.status).toBe(400);

    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("PATCH /api/v1/users/:id - Should update user name", async () => {
    if (!createdUserId) return;

    const res = await app.request(`/api/v1/users/${createdUserId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User Updated",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Test User Updated");
  });

  it("DELETE /api/v1/users/:id - Should soft delete user", async () => {
    if (!createdUserId) return;

    const res = await app.request(`/api/v1/users/${createdUserId}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
  });

  it("POST /api/v1/users/:id/restore - Should restore soft-deleted user", async () => {
    if (!createdUserId) return;

    const res = await app.request(`/api/v1/users/${createdUserId}/restore`, {
      method: "POST",
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdUserId);
  });
});
