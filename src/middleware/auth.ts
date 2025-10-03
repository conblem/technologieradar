import { getAuth } from "../utils/clerk.ts";
import { locationMiddleware } from "./location.ts";
import { redirect } from "@tanstack/solid-router";
import { createMiddleware } from "@tanstack/solid-start";

export const authMiddleware = createMiddleware({ type: "function" })
  .middleware([locationMiddleware])
  .server(async ({ next, context }) => {
    const auth = getAuth();

    if (!auth.userId || !auth.orgId) {
      throw redirect({
        to: "/login",
        search: {
          redirect: context.location,
        },
      });
    }

    return next({
      context: {
        auth: { userId: auth.userId, orgId: auth.orgId },
      },
    });
  });
