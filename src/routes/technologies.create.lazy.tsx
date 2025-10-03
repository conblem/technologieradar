import { cx } from "../../cva.config.ts";
import { blip, Blip, NewBlip } from "../components/Blip.tsx";
import { CreateTechnologyForm } from "../components/CreateTechnologyForm.tsx";
import { DragDropProvider } from "../components/DragDropProvider.tsx";
import { RadarPortal } from "../components/Radar.tsx";
import { errorToast, successToast } from "../components/Toast.tsx";
import { create } from "../utils/queries.ts";
import {
  toAngle,
  toCategory,
  toRadius,
  toRing,
} from "../utils/transformations.ts";
import { useResizeObserver } from "../utils/useResizeObserver.ts";
import { createLazyFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

export const Route = createLazyFileRoute("/technologies/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const context = Route.useRouteContext();
  const navigate = Route.useNavigate();

  const [width, setWidth] = createSignal(1);
  const resizeObserver = useResizeObserver<HTMLDivElement>((el) => {
    // make sure we don't set width to 0
    if (el.clientWidth) {
      setWidth(el.clientWidth);
    }
  });
  const [formData, setFormData] = createSignal({ name: "", description: "" });
  const [position, setPosition] = createSignal({
    left: 0.5,
    top: 0.5,
  });
  const [transform, setTransform] = createSignal({ x: 0, y: 0 });
  const left = () => position().left + transform().x / width();
  const top = () => position().top + transform().y / width();
  const category = () => toCategory(toAngle(left(), top()));
  const ring = () => toRing(toRadius(left(), top()));
  const mutation = create();
  return (
    <>
      <div class="card-border card h-full bg-base-100 shadow-sm">
        <div class="card-body h-full">
          <div class="card-title items-center justify-between">
            <div class="flex items-center gap-1">
              <div
                class={cx(
                  blip({ ring: ring() }),
                  // remove the outline from the badge height
                  "badge h-[calc(var(--size)-4px)] badge-xl outline-2",
                )}
              >
                {ring()}
              </div>
              <div class={cx(blip({ category: category() }), "badge badge-xl")}>
                {category()}
              </div>
            </div>
            <div class="translate-1/2">
              <Blip
                technology={{
                  id: 0,
                  name: "",
                }}
                category={category()}
                ring={ring()}
                disabled
              />
            </div>
          </div>
          <CreateTechnologyForm
            class="h-full overflow-y-auto"
            onSubmit={async ({ name, description }) => {
              try {
                await new Promise((res) => setTimeout(res, 2000));
                const { id } = await mutation.mutateAsync({
                  name,
                  description,
                  x: position().left,
                  y: position().top,
                  org: context().auth.orgId,
                });
                successToast();
                await navigate({
                  to: "/technologies/$id/$name",
                  params: { id, name },
                });
              } catch (error) {
                errorToast(error as Error);
              }
            }}
            onChange={setFormData}
          />
        </div>
      </div>
      <DragDropProvider
        onDragEnd={() => {
          setPosition(({ left, top }) => ({
            left: left + transform().x / width(),
            top: top + transform().y / width(),
          }));
          setTransform({ x: 0, y: 0 });
        }}
        onDragMove={({
          draggable: {
            transform: { x, y },
          },
        }) => {
          setTransform({ x, y });
        }}
      >
        <RadarPortal ref={resizeObserver}>
          <NewBlip
            style={{
              left: `calc(${position().left.toString()} * 100%)`,
              top: `calc(${position().top.toString()} * 100%)`,
            }}
            technology={{ id: 0, name: formData().name }}
            category={category()}
            ring={ring()}
            class="absolute"
          />
        </RadarPortal>
      </DragDropProvider>
    </>
  );
}
