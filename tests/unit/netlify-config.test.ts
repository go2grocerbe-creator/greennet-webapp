import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Netlify deployment configuration", () => {
  it("builds and publishes the Next.js output instead of the repository root", async () => {
    const config = await readFile(resolve(process.cwd(), "netlify.toml"), "utf8");
    const packageJson = JSON.parse(
      await readFile(resolve(process.cwd(), "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
    };

    expect(config).toMatch(/command\s*=\s*"npm run build"/);
    expect(config).toMatch(/publish\s*=\s*"\.next"/);
    expect(packageJson.dependencies?.["@opentelemetry/api"]).toMatch(/^\^1\./);
  });
});
