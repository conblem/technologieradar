// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { QueryClient } from "@tanstack/solid-query";
import { createRouter as createTanstackRouter } from "@tanstack/solid-router";

// on dev we use css modules but in production we inline the css directly into the head in the customHead.tsx file
if (import.meta.env.DEV) {
  await import("./styles.css");
}

// Create a new router instance
export const createRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        experimental_prefetchInRender: true,
      },
    },
  });
  return createTanstackRouter({
    routeTree,
    scrollRestoration: true,
    context: {
      queryClient,
    },
    defaultPreload: "intent",
    // apparently these are not needed because it's done automatically
    // but leaving here for reference if this is not true
    // dehydrate: () => dehydrate(queryClient),
    // hydrate: (dehydratedState) => {
    //   hydrate(queryClient, dehydratedState);
    // },
  });
};

// Register the router instance for type safety
declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
