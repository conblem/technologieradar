import { createSignal, onCleanup } from "solid-js";

export function useResizeObserver<T extends Element>(
  callback: (el: T) => void,
) {
  const [ref, setRef] = createSignal<{ el?: T }>({});

  /* v8 ignore next 3 */
  if (import.meta.env.SSR) {
    return () => {
      /* empty */
    };
  }

  const observer = new ResizeObserver(() => {
    const { el } = ref();
    // observe is only ever called after el is set
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    callback(el!);
  });

  onCleanup(() => {
    observer.disconnect();
  });

  return (el: T) => {
    setRef((old) => {
      // the first time this is called old will have the default value
      if (old.el) {
        observer.unobserve(old.el);
      }
      return { el };
    });
    observer.observe(el);
    callback(el);
  };
}
