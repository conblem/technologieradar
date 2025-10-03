import { Blip } from "../components/Blip.tsx";
import { technology } from "../utils/queries.ts";
import { toCategory, toRing } from "../utils/transformations.ts";
import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { Show } from "solid-js";
import * as z from "zod/mini";

export const Route = createFileRoute("/technologies/$id/$name")({
  component: RouteComponent,
  params: {
    parse: ({ id, name }) => ({
      id: z.number().parse(parseInt(id)),
      name,
    }),
  },
});

function RouteComponent() {
  const params = Route.useParams();
  const query = useQuery(() => technology(params().id));
  return (
    <Show when={query.data}>
      {(technology) => {
        const category = () => toCategory(technology().angle);
        const ring = () => toRing(technology().radius);
        return (
          <div class="card-border card m-4 bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title flex justify-between text-lg">
                {technology().name}
                <div class="translate-1/2">
                  <Blip
                    technology={technology()}
                    category={category()}
                    ring={ring()}
                    disabled
                  />
                </div>
              </h2>
              <p>{technology().description}</p>
            </div>
          </div>
        );
      }}
    </Show>
  );
}
