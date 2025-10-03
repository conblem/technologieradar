import css from "./styles.css?inline";
import { MetaProvider } from "@solidjs/meta";
import {
  AnyRouter,
  Asset,
  RouterProvider,
  Scripts,
  useTags,
} from "@tanstack/solid-router";
import { renderRouterToStream } from "@tanstack/solid-router/ssr/server";
import { defineHandlerCallback } from "@tanstack/solid-start/server";
import {
  Hydration,
  HydrationScript,
  NoHydration,
  ssr,
  useAssets,
} from "solid-js/web";

// type LinkRouterTag = Extract<RouterManagedTag, { tag: "meta" | "link" }>;
//
// function isStyle(tag: RouterManagedTag): tag is LinkRouterTag & {
//   attrs: { rel: "stylesheet"; href: string };
// } {
//   return tag?.attrs?.rel === "stylesheet";
// }

// copied from https://github.com/TanStack/router/blob/4a6dcd09cf16f7586228d0f68fe134a520a10033/packages/solid-start-server/src/StartServer.tsx
function ServerHeadContent() {
  const tags = useTags();

  useAssets(() => {
    return (
      <MetaProvider>
        {tags().map((tag) => (
          <Asset {...tag} />
        ))}
      </MetaProvider>
    );
  });
  return null;
}

const docType = ssr("<!DOCTYPE html>");

function StartServer(props: { router: AnyRouter }) {
  return (
    <NoHydration>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {docType as any}
      <html>
        <head>
          {import.meta.env.DEV ? null : <style innerHTML={css} />}
          <HydrationScript />
        </head>
        <body>
          <Hydration>
            <RouterProvider
              router={props.router}
              InnerWrap={(props) => (
                <NoHydration>
                  <MetaProvider>
                    <Hydration>{props.children}</Hydration>
                    <Scripts />
                    <ServerHeadContent />
                  </MetaProvider>
                </NoHydration>
              )}
            />
          </Hydration>
        </body>
      </html>
    </NoHydration>
  );
}

// copied from https://github.com/TanStack/router/blob/4a6dcd09cf16f7586228d0f68fe134a520a10033/packages/solid-start-server/src/defaultStreamHandler.tsx
export const defaultStreamHandler = defineHandlerCallback(
  async ({ request, router, responseHeaders }) =>
    await renderRouterToStream({
      request,
      router,
      responseHeaders,
      children: () => <StartServer router={router} />,
    }),
);
