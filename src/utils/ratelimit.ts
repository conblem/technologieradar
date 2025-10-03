import { getAuth } from "./clerk.ts";
import { createMiddleware } from "@tanstack/solid-start";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { waitUntil } from "@vercel/functions";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, "5 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const ratelimiting = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const { userId } = getAuth();
  const { success, pending } = await ratelimit.limit(userId ?? "");

  // upstash does some background work to persist analytics
  // on vercel we have to make sure the function doesn't stop before it's done
  // https://upstash.com/docs/redis/sdks/ratelimit-ts/gettingstarted#serverless-environments
  waitUntil(pending);

  if (success) {
    return next();
  }

  // todo: figure out if there is a better way
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw new Response("Too many requests", { status: 429 });
});
