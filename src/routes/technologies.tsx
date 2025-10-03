import { cx } from "../../cva.config.ts";
import { StaticBlip } from "../components/Blip.tsx";
import { Header } from "../components/Header.tsx";
import { Radar, RadarContext } from "../components/Radar.tsx";
import type { SelectTechnology } from "../db/schema.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { getAuth } from "../utils/clerk.ts";
import { technologies } from "../utils/queries.ts";
import { useQuery } from "@tanstack/solid-query";
import {
  createFileRoute,
  Outlet,
  useMatchRoute,
  useNavigate,
  useRouter,
} from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import {
  For,
  type ComponentProps,
  splitProps,
  children,
  Suspense,
} from "solid-js";

const auth = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) => {
    return context;
  });

export const Route = createFileRoute("/technologies")({
  component: RouteComponent,
  beforeLoad: () => auth(),
});

function RouteComponent() {
  const context = Route.useRouteContext();
  const query = useQuery(technologies);

  return (
    <>
      <RadarContext>
        <div class="flex h-full flex-col">
          <div class="grid h-full max-h-full grid-cols-1 grid-rows-[auto_min-content] overflow-y-auto bg-base-300 md:grid-cols-[auto_min-content] md:grid-rows-1">
            <RadarWithBlips
              class="max-h-full p-4"
              technologies={query.data ?? []}
            />
            <div class="m-4 md:min-w-100">
              <Suspense>
                <Outlet />
              </Suspense>
            </div>
          </div>
          <Header class="static" cto={context().cto} />
        </div>
      </RadarContext>
    </>
  );
}

function RadarWithBlips(
  props: ComponentProps<typeof Radar> & {
    technologies: SelectTechnology[];
  },
) {
  const [local, other] = splitProps(props, ["technologies", "children"]);
  const resolved = children(() => local.children);
  const navigate = useNavigate();

  const matchRoute = useMatchRoute();
  const matchDetail = matchRoute({ to: "/technologies/$id/$name" });
  const selectedId = () => {
    const match = matchDetail();
    if (!match) {
      return undefined;
    }
    // typing is not correct all params are strings actually
    return parseInt(match.id.toString());
  };

  const router = useRouter();

  return (
    <Radar
      {...other}
      categoryClicked={(category) =>
        void navigate({
          to: "/technologies/$category",
          params: { category },
        })
      }
    >
      <For each={local.technologies}>
        {(technology) => {
          const route = {
            to: `/technologies/$id/$name`,
            params: {
              id: technology.id,
              name: technology.name,
            },
          } as const;

          return (
            <StaticBlip
              technology={technology}
              class={cx("absolute", {
                "outline-white": selectedId() === technology.id,
              })}
              on:click={() => void navigate(route)}
              on:mouseover={() => void router.preloadRoute(route)}
              style={{
                left: `calc(${technology.x.toString()} * 100%)`,
                top: `calc(${technology.y.toString()} * 100%)`,
              }}
            />
          );
        }}
      </For>
      {resolved()}
    </Radar>
  );
}
