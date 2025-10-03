import { cva, cx, type RequiredVariantProps } from "../../cva.config.ts";
import type { SelectTechnology } from "../db/schema.ts";
import {
  toAngle,
  toCategory,
  toRadius,
  toRing,
} from "../utils/transformations.ts";
import { type PolymorphicProps } from "@kobalte/core/polymorphic";
import { Tooltip, type TooltipTriggerProps } from "@kobalte/core/tooltip";
import { createDraggable } from "@thisbeyond/solid-dnd";
import { type ComponentProps, splitProps } from "solid-js";

export const blip = cva({
  base: "blip",
  variants: {
    category: {
      languages: ["bg-red-400"],
      platforms: ["bg-orange-400"],
      techniques: ["bg-blue-400"],
      tools: ["bg-green-400"],
    },
    ring: {
      hold: ["outline-red-400"],
      assess: ["outline-orange-400"],
      trial: ["outline-blue-400"],
      adopt: ["outline-green-400"],
    },
  },
});

export function Blip(
  props: {
    technology: Pick<SelectTechnology, "id" | "name">;
    disabled?: boolean;
  } & RequiredVariantProps<typeof blip, "category" | "ring"> &
    PolymorphicProps<"div", TooltipTriggerProps<"div">>,
) {
  const [local, others] = splitProps(props, [
    "technology",
    "class",
    "category",
    "ring",
    "disabled",
  ]);
  return (
    <Tooltip openDelay={0} disabled={local.disabled ?? false}>
      <Tooltip.Trigger
        as="div"
        {...others}
        class={cx(
          blip({ category: local.category, ring: local.ring }),
          local.class,
          "flex h-[6vw] w-[6vw] -translate-1/2 items-center justify-center rounded-full outline-[0.5vw] outline-offset-2 md:h-[3vw] md:w-[3vw] md:outline-[0.25vw]",
        )}
      >
        <span class="text-[3vw] select-none md:text-[1.5vw]">
          {local.technology.id}
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          class={cx(
            "z-50 origin-[var(--kb-tooltip-content-transform-origin)] rounded-sm bg-white p-2 drop-shadow-md",
            { invisible: !local.technology.name },
          )}
        >
          <Tooltip.Arrow />
          <h1>{local.technology.name}</h1>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  );
}

export function StaticBlip(
  props: Omit<ComponentProps<typeof Blip>, "ring" | "category"> & {
    technology: SelectTechnology;
  },
) {
  return (
    <Blip
      {...props}
      category={toCategory(toAngle(props.technology.x, props.technology.y))}
      ring={toRing(toRadius(props.technology.x, props.technology.y))}
    />
  );
}

export function NewBlip(props: ComponentProps<typeof Blip>) {
  const draggable = createDraggable("new");
  return (
    <Blip {...props} ref={draggable} disabled={draggable.isActiveDraggable} />
  );
}
