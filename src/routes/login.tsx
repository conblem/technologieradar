import ClerkComponent from "../components/clerk";
import { getAuth } from "../utils/clerk.ts";
import { createFileRoute, redirect } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import * as z from "zod/mini";

const Search = z.object({
  redirect: z.string(),
});

export const alreadyAuth = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(({ data }) => {
    const auth = getAuth();
    if (auth.userId) {
      throw redirect({ to: data });
    }
  });

export const Route = createFileRoute("/login")({
  component: LoginComponent,
  validateSearch: (unknown) => {
    try {
      return Search.parse(unknown);
    } catch {
      return { redirect: "/" };
    }
  },
  beforeLoad: ({ search }) => alreadyAuth({ data: search.redirect }),
});

function LoginComponent() {
  return (
    <div class="flex h-full w-full items-center justify-center">
      <ClerkComponent fn="SignIn" />
    </div>
  );
}
