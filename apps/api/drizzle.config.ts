import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",

  dbCredentials: {
    url: "postgresql://karsa_user:karsa_password@localhost:5432/karsa_db_local",
  },
  extensionsFilters: ["postgis"],
  schemaFilter: ["public"],
  tablesFilter: ["*"],

  introspect: {
    casing: "camel",
  },
  migrations: {
    table: "__drizzle_migrations__",
    schema: "drizzle",
  },
  breakpoints: true,
  verbose: true,
  strict: true,
});
