import { createAuthClient } from "better-auth/react";
import { apiBaseUrl } from "./api-base-url";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { roles } from "../shared";

export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: [...roles],
          required: true,
          input: false,
          defaultValue: "civilian",
        },
      },
    }),
  ],
});
