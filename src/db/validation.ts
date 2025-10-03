import * as z from "zod/mini";

// export const InsertTechnology = type({
//   name: "string",
//   description: "string",
//   x: "number >= 0 & number <= 1",
//   y: "number >= 0 & number <= 1",
//   org: /^org_[A-Za-z0-9]{27}$/,
// });

export const Category = z.enum([
  "languages",
  "platforms",
  "techniques",
  "tools",
]);
export type Category = z.infer<typeof Category>;

export const Ring = z.enum(["hold", "assess", "trial", "adopt"]);
export type Ring = z.infer<typeof Ring>;

export const InsertTechnology = z.object({
  name: z.string().check(z.minLength(1), z.maxLength(255)),
  description: z.string().check(z.minLength(1), z.maxLength(2048)),
  x: z.number().check(z.minimum(0), z.maximum(1)),
  y: z.number().check(z.minimum(0), z.maximum(1)),
  org: z.string().check(z.regex(/^org_[A-Za-z0-9]{27}$/)),
});

export type InsertTechnology = z.infer<typeof InsertTechnology>;
