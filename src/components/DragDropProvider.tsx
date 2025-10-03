import { ClientOnly } from "@tanstack/solid-router";
import {
  DragDropProvider as DndDragDropProvider,
  DragDropSensors,
} from "@thisbeyond/solid-dnd";
import { type ComponentProps, createSignal, splitProps } from "solid-js";
import createPreventScroll from "solid-prevent-scroll";

export function DragDropProvider(
  props: ComponentProps<typeof DndDragDropProvider>,
) {
  const [local, other] = splitProps(props, [
    "onDragStart",
    "onDragEnd",
    "children",
  ]);
  const [preventScroll, setPreventScroll] = createSignal(false);
  createPreventScroll({
    enabled: preventScroll,
  });

  return (
    <DndDragDropProvider
      {...other}
      onDragStart={(ev) => {
        setPreventScroll(true);
        local.onDragStart?.(ev);
      }}
      onDragEnd={(ev) => {
        setPreventScroll(false);
        local.onDragEnd?.(ev);
      }}
    >
      <ClientOnly>
        <DragDropSensors />
      </ClientOnly>
      {local.children}
    </DndDragDropProvider>
  );
}
