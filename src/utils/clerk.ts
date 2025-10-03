import { createClerkClient } from "@clerk/backend";
import {
  SignedInAuthObject,
  SignedOutAuthObject,
} from "@clerk/backend/internal";
import { type AnyRouter } from "@tanstack/solid-router";
import {
  CustomizeStartHandler,
  getEvent,
  getWebRequest,
  HandlerCallback,
  RequestHandler,
  getContext,
} from "@tanstack/solid-start/server";

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
});

export function createClerkHandler(
  eventHandler: CustomizeStartHandler<AnyRouter>,
) {
  return async (cb: HandlerCallback<AnyRouter>): Promise<RequestHandler> => {
    const auth = await clerkClient.authenticateRequest(getWebRequest());

    const event = getEvent();
    event.context.auth = () => auth.toAuth();

    return eventHandler(async ({ request, router, responseHeaders }) => {
      const locationHeader = auth.headers.get("location");
      if (locationHeader) {
        return new Response(null, {
          status: 307,
          headers: auth.headers,
        });
      }

      if (auth.status === "handshake") {
        throw new Error("Clerk: unexpected handshake without redirect");
      }

      return cb({ request, router, responseHeaders });
    });
  };
}

export function getAuth() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const auth: () => SignedInAuthObject | SignedOutAuthObject =
    getContext("auth");
  return auth();
}
