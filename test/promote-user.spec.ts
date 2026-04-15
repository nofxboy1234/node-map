import { describe, expect, it, vi } from "vitest";
// @ts-expect-error script is plain .mjs without TypeScript declarations
import { buildPromoteUserSql, runPromoteUser } from "../scripts/promote-user.mjs";

describe("promote-user script", () => {
  it("builds the promote SQL for a valid email", () => {
    const sql = buildPromoteUserSql("you@example.com");

    expect(sql).toBe("UPDATE user SET role='internal_user' WHERE email='you@example.com';");
  });

  it("throws for emails containing single quotes", () => {
    expect(() => buildPromoteUserSql("o'hare@example.com")).toThrow(
      "USER_EMAIL cannot contain single quotes",
    );
  });

  it("runs wrangler with expected arguments", () => {
    const spawn = vi.fn<
      (
        command: string,
        args: string[],
        options: {
          stdio: "inherit";
        },
      ) => {
        status: number;
      }
    >(() => ({ status: 0 }));

    const exitCode = runPromoteUser({
      email: "you@example.com",
      spawn,
    });

    expect(exitCode).toBe(0);
    expect(spawn).toHaveBeenCalledWith(
      "pnpm",
      [
        "exec",
        "wrangler",
        "d1",
        "execute",
        "node-map",
        "--local",
        "--command",
        "UPDATE user SET role='internal_user' WHERE email='you@example.com';",
      ],
      {
        stdio: "inherit",
      },
    );
  });
});
