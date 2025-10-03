// why get is needed https://github.com/TanStack/router/issues/4651
import { InsertTechnology } from "../db/validation.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { ratelimiting } from "./ratelimit.ts";
import {
  experimental_streamedQuery as streamedQuery,
  useQuery,
} from "@tanstack/solid-query";
import { createServerFn, useServerFn } from "@tanstack/solid-start";
import { streamText } from "ai";
import { Accessor, createEffect, createSignal } from "solid-js";
import { createWorkersAI } from "workers-ai-provider";

// why get is needed: https://github.com/TanStack/router/issues/4651
export const getCompletion = createServerFn({ method: "GET", response: "raw" })
  .middleware([authMiddleware, ratelimiting])
  .validator(InsertTechnology.shape.name)
  .handler(({ data, signal }) => {
    const workersAi = createWorkersAI({
      apiKey: process.env.AI_KEY,
      accountId: process.env.AI_ACCOUNT_ID,
    });
    const result = streamText({
      model: workersAi("@cf/meta/llama-3.2-3b-instruct"),
      prompt: `
        You are a software technology expert adding technologies to a Technologyradar.
        Write a description for the technology "${data}" that is concise and informative.
        The description should be around 50 words long and highlight the key features, benefits, and use cases of the technology.
        Use a professional and engaging tone suitable for an audience of software developers and IT professionals.
        Only reply with the description, do not add any other text or thank you etc.
        Don't put your response in quotes.
      `,
      abortSignal: signal,
    });
    return result.toTextStreamResponse({
      headers: {
        "Content-Type": "text/x-unknown",
        "content-encoding": "identity",
        "transfer-encoding": "chunked",
      },
    });
  });

async function* toAsyncIterable(response: Response) {
  if (!response.body) {
    throw new Error("No response body");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    yield decoder.decode(value);
  }
}

export function useCompletion(technology: Accessor<string>) {
  const [data, setData] = createSignal("");
  const [enabled, setEnabled] = createSignal(false);

  const queryFn = useServerFn(getCompletion);
  const query = import.meta.env.SSR
    ? undefined
    : useQuery(() => ({
        queryKey: ["technologies", "completion", technology()],
        staleTime: Infinity,
        queryFn: streamedQuery({
          queryFn: async () =>
            toAsyncIterable(await queryFn({ data: technology() })),
        }),
        enabled: enabled(),
      }));

  createEffect(() => {
    if (!query?.data?.length) {
      return;
    }
    setData(query.data.join(""));
  });

  createEffect(() => {
    if (enabled() && query?.fetchStatus === "idle") {
      // when the query is enabled and has finished fetching, disable it again
      setEnabled(false);
    }
  });

  return {
    data: data,
    fetching: () => query?.fetchStatus === "fetching",
    load: () => {
      setEnabled(true);
    },
  };
}
