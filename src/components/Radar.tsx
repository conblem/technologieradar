import { cx } from "../../cva.config.ts";
import { type Category } from "../db/validation.ts";
import { toAngle, toCategory } from "../utils/transformations.ts";
import { Quarter } from "./Quarter.tsx";
import {
  children,
  type ComponentProps,
  type JSX,
  splitProps,
  createContext,
  type Accessor,
  Show,
  useContext,
  createEffect,
  createSignal,
} from "solid-js";
import { Portal } from "solid-js/web";

const SetRefContext = createContext<(el: HTMLDivElement) => void>(() => {
  /* empty */
});

// radar is a static component without sideeffects that just renders an empty radar
// blips etc. are rendered as children
export function Radar(
  props: Omit<ComponentProps<"div">, "ref"> & {
    categoryClicked?: (category: Category) => void;
  },
) {
  const [local, other] = splitProps(props, [
    "class",
    "children",
    "categoryClicked",
  ]);
  const resolved = children(() => local.children);

  const [leftHover, setLeftHover] = createSignal(0);
  const [topHover, setTopHover] = createSignal(0);
  const category = () => {
    if (!leftHover() && !topHover()) {
      return null;
    }
    return toCategory(toAngle(leftHover(), topHover()));
  };

  const setRef = useContext(SetRefContext);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let ref: HTMLDivElement = undefined!;

  const HigherQuarter = (props: { class?: string; category: Category }) => (
    <Quarter
      backgroundClass="text-base-200"
      spacing={10}
      class={cx(
        props.class,
        "h-full w-full",
        category() && category() !== props.category && "opacity-50",
      )}
      on:click={() => local.categoryClicked?.(props.category)}
    />
  );
  return (
    <div
      {...other}
      ref={(el) => {
        setRef(el);
        ref = el;
      }}
      on:mouseover={(event) => {
        setLeftHover((event.clientX - ref.offsetLeft) / ref.clientWidth);
        setTopHover((event.clientY - ref.offsetTop) / ref.clientHeight);
      }}
      on:mouseout={() => {
        setLeftHover(0);
        setTopHover(0);
      }}
      class={cx(
        "relative grid aspect-square grid-cols-2 grid-rows-2 gap-[20px]",
        local.class,
      )}
    >
      <HigherQuarter category={"techniques"} />
      <HigherQuarter category={"tools"} class="rotate-90" />
      <HigherQuarter category={"platforms"} class="rotate-270" />
      <HigherQuarter category={"languages"} class="rotate-180" />
      {resolved()}
    </div>
  );
}

const RefContext = createContext<Accessor<HTMLDivElement | undefined>>();

export function RadarPortal(
  props: Pick<ComponentProps<typeof Portal>, "children"> &
    Pick<ComponentProps<"div">, "ref">,
) {
  const radar = useContext(RefContext);
  createEffect(() => {
    const ref = radar?.();
    if (!props.ref || !ref) {
      return;
    }
    if (typeof props.ref === "function") {
      props.ref(ref);
    } else {
      props.ref = ref;
    }
  });

  return (
    <Show when={radar?.()}>
      {(ref) => (
        <Portal
          ref={(el) => {
            el.className = "contents";
          }}
          mount={ref()}
        >
          {props.children}
        </Portal>
      )}
    </Show>
  );
}

// there is possibly a race condition if the radar portal gets rendered before the radar itself
export function RadarContext(props: { children: JSX.Element }) {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  return (
    <SetRefContext.Provider value={setRef}>
      <RefContext.Provider value={ref}>{props.children}</RefContext.Provider>
    </SetRefContext.Provider>
  );
}
