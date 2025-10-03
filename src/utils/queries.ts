import { Repo } from "../db/repo.ts";
import type { SelectTechnology } from "../db/schema.ts";
import { InsertTechnology } from "../db/validation.ts";
import { authMiddleware } from "../middleware/auth.ts";
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/solid-query";
import { createServerFn, useServerFn } from "@tanstack/solid-start";
import * as z from "zod/mini";

const getTechnologies = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { auth } }) => {
    if (!auth.orgId) {
      return [];
    }
    return await new Repo().getTechnologies(auth.orgId);
  });

export const technologies = () => {
  const queryFn = useServerFn(getTechnologies);
  return queryOptions({
    queryKey: ["technologies"],
    queryFn: ({ signal }) => queryFn({ signal }),
    deferStream: true,
  });
};

const getTechnology = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data) => z.number().check(z.int()).parse(data))
  .handler(async ({ context: { auth }, data }) => {
    if (!auth.orgId) {
      return null;
    }
    return (await new Repo().getTechnology(data, auth.orgId)) ?? null;
  });

export const technology = (id: number) => {
  const queryFn = useServerFn(getTechnology);
  return queryOptions({
    queryKey: ["technologies", id],
    // use null instead of undefined because tanstack query uses undefined for loading
    queryFn: async ({ signal }) =>
      (await queryFn({ data: id, signal })) ?? null,
  });
};

const createTechnology = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data) => InsertTechnology.parse(data))
  .handler(async ({ context: { auth }, data }) => {
    if (data.org !== auth.orgId) {
      throw new Error("Invalid org");
    }
    return await new Repo().createTechnology(data);
  });

export const create = () => {
  const client = useQueryClient();
  const mutationFn = useServerFn(createTechnology);
  return useMutation(() => ({
    mutationFn: (data: InsertTechnology) => mutationFn({ data }),
    onMutate: async (data) => {
      await client.cancelQueries({ queryKey: ["technologies"] });
      const previousTechnologies = client.getQueryData<SelectTechnology[]>([
        "technologies",
      ]);

      if (!previousTechnologies) {
        return;
      }

      client.setQueryData(["technologies"], () => [
        ...previousTechnologies,
        data,
      ]);

      return previousTechnologies;
    },
    onError: (_, _vars, previousTechnologies) => {
      if (previousTechnologies) {
        client.setQueryData(["technologies"], previousTechnologies);
      }
    },
    onSettled: () => client.invalidateQueries({ queryKey: ["technologies"] }),
  }));
};
