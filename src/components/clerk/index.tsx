import { type Clerk } from "@clerk/clerk-js";
import {
  createEffect,
  createResource,
  createSignal,
  onCleanup,
} from "solid-js";

const clerkPromise = import.meta.env.SSR
  ? Promise.resolve(undefined)
  : (async () => {
      const pkg = await import("@clerk/clerk-js");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const clerk = new pkg.Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
      await clerk.load();
      return clerk;
    })();

type MountFunctions = {
  [K in keyof Clerk as K extends `mount${infer M}`
    ? M
    : never]: Clerk[K] extends (el: HTMLDivElement, props: infer P) => void
    ? P
    : never;
};

// this helps typescript figure out the types
type NarrowedClerk<T extends keyof MountFunctions> = Record<
  `mount${T}`,
  (el: HTMLDivElement, prop: MountFunctions[T]) => void
>;

export default function ClerkComponent<T extends keyof MountFunctions>(props: {
  fn: T;
  props?: MountFunctions[T];
}) {
  const [clerk] = createResource(() => clerkPromise);
  const [ref, setRef] = createSignal<HTMLDivElement>();

  createEffect(() => {
    const el = ref();
    if (clerk.latest && el) {
      (clerk.latest as NarrowedClerk<T>)[`mount${props.fn}`](el, props.props);
    }
  });

  onCleanup(() => {
    const el = ref();
    if (clerk.latest && el) {
      clerk.latest[`unmount${props.fn}`](el);
    }
  });

  return <div ref={setRef} />;
}
