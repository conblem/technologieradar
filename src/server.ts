import { defaultStreamHandler } from "./customHead.tsx";
import { createRouter } from "./router";
import { createClerkHandler } from "./utils/clerk.ts";
import {
  createStartHandler,
  // defaultStreamHandler,
  defineHandlerCallback,
} from "@tanstack/solid-start/server";
import * as z from "zod/mini";

const EnvVariables = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  DATABASE_URL: z.string(),
  AI_KEY: z.string(),
  AI_ACCOUNT_ID: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
});

EnvVariables.parse(process.env);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof EnvVariables> {}
  }
}

const handlerFactory = createClerkHandler(
  createStartHandler({
    createRouter,
  }),
);

export default defineHandlerCallback(async (event) => {
  const startHandler = await handlerFactory(defaultStreamHandler);
  return startHandler(event);
});
