import { ToastRegion } from "../components/Toast.tsx";
import { QueryClientProvider, type QueryClient } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";
import { Suspense } from "solid-js";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      },
    ],
  }),
});

function RootComponent() {
  const context = Route.useRouteContext();
  return (
    <>
      <QueryClientProvider client={context().queryClient}>
        <Suspense>
          <Outlet />
        </Suspense>
        {import.meta.env.DEV ? (
          <>
            <SolidQueryDevtools buttonPosition="top-right" />
            <TanStackRouterDevtools position="top-left" />
          </>
        ) : null}
        <ToastRegion />
      </QueryClientProvider>
    </>
  );
}
