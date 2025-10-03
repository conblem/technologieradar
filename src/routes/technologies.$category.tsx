import { Category } from "../db/validation.ts";
import { technologies } from "../utils/queries.ts";
import { toCategory } from "../utils/transformations.ts";
import { useQuery } from "@tanstack/solid-query";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";

export const Route = createFileRoute("/technologies/$category")({
  component: RouteComponent,
  params: {
    parse: ({ category }) => ({
      category: Category.parse(category),
    }),
  },
});

function RouteComponent() {
  const params = Route.useParams();
  const query = useQuery(technologies);
  return (
    <div>
      <Show when={query.data}>
        {(technologies) => {
          const filteredTechnologies = () =>
            technologies().filter(
              (technology) =>
                toCategory(technology.angle) === params().category,
            );

          return (
            <For each={filteredTechnologies()}>
              {(technology) => (
                <Link
                  class="block"
                  to={"/technologies/$id/$name"}
                  params={{ id: technology.id, name: technology.name }}
                >
                  {technology.name}
                </Link>
              )}
            </For>
          );
        }}
      </Show>
    </div>
  );
}
