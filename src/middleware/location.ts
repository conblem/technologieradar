import { createMiddleware } from "@tanstack/solid-start";

export const locationMiddleware = createMiddleware({ type: "function" }).client(
  ({ next, router }) => {
    return next({
      sendContext: {
        location: router.latestLocation.href,
      },
    });
  },
);
