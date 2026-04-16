import { queryOptions } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";
import type { Role } from "../shared";

export type Session = Awaited<ReturnType<typeof authClient.getSession>>["data"];

type AssertExtends<_SubType extends _SuperType, _SuperType> = true;
type SessionRole = NonNullable<Session>["user"]["role"];
declare const _sessionRoleTypeCheck: [
  AssertExtends<SessionRole, Role>,
  AssertExtends<Role, SessionRole>,
];

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const result = await authClient.getSession();

    if (result.error) {
      throw new Error(result.error.message!);
    }

    return result.data;
  },
});
