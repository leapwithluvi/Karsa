import z from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

export const createConfig = (rawEnv: unknown) => {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const errorMsg =
      "Invalid environment variables:\n" +
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2);
    console.error(errorMsg);
    throw new Error("Environment configuration is incorrect or incomplete");
  }

  const _env = parsed.data;

  return {
    nodeEnv: _env.NODE_ENV,
    isDev: _env.NODE_ENV === "development",
    isProd: _env.NODE_ENV === "production",
    db: {
      url: _env.DATABASE_URL,
    },
    cors: {
      origin: _env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    },
  } as const;
};

export type AppConfig = ReturnType<typeof createConfig>;
