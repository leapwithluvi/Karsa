import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { ApiResponse } from "./types";
import { env } from "hono/adapter";
import { createConfig } from "./config/env";
import apiRouter from "./routes";

const startTime = performance.now();
const app = new Hono();

app.use(logger());
app.use(secureHeaders());

app.use("*", async (c, next) => {
  const rawEnv = env(c);
  const AppConfig = createConfig(rawEnv);

  const allowedOrigins = AppConfig.cors.origin;

  const corsMiddlware = cors({
    origin: (origin) => {
      if (!origin) return allowedOrigins[0] || "http://localhost:3000";
      const isAllowed = allowedOrigins.some((o) =>
        origin.includes(o.replace(/^https?:\/\//, "")),
      );
      if (isAllowed || origin.startsWith("http://localhost")) {
        return origin;
      }
      return allowedOrigins[0] || "http://localhost:3000";
    },
    credentials: AppConfig.cors.credentials,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposeHeaders: ["Set-Cookie"],
  });

  return corsMiddlware(c, next);
});

app.use(compress());

// HEALTH CHECK
app.get("/health", (c) => {
  const rawEnv = env(c);
  const appConfig = createConfig(rawEnv);

  return c.json<ApiResponse>({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((performance.now() - startTime) / 1000),
      env: appConfig.nodeEnv,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  });
});

// API ROUTES
app.route("/api/v1", apiRouter);

// 404 NOT FOUND
app.notFound((c) => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  };
  return c.json(response, 404);
});

app.onError((err, c) => {
  console.error("[Error]", err);

  const rawEnv = env(c);
  const appConfig = createConfig(rawEnv);

  const response: ApiResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: appConfig.isDev ? err.message : "An unexpected error occurred",
      ...(appConfig.isDev && { stack: err.stack }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  };
  return c.json(response, 500);
});

export default app;
