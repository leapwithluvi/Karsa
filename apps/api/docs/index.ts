import usersSpec from "./users.spec.json";

/**
 * Central API Specification Merger
 *
 * How to add a new module:
 * 1. Create a new spec file: docs/<module>.spec.json
 * 2. Import it here
 * 3. Add its paths and components into the merge below
 *
 * Example for next module:
 *   import foldersSpec from "./folders.spec.json";
 */

export const apiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Karsa API",
    version: "1.0.0",
    description:
      "Karsa SaaS REST API — Distraction-free text management platform",
  },
  servers: [
    {
      url: "http://localhost:8787/api/v1",
      description: "Local Development",
    },
    {
      url: "https://api.karsa.app/api/v1",
      description: "Production",
    },
  ],
  // Merge paths from all module specs
  paths: {
    ...usersSpec.paths,
    // Add new module paths here:
    // ...foldersSpec.paths,
    // ...documentsSpec.paths,
  },
  components: {
    schemas: {
      ...(usersSpec.components?.schemas ?? {}),
    },
  },
};
