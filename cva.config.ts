import { defineConfig, type VariantProps } from "cva";
import { twMerge } from "tailwind-merge";

export const { cva, cx, compose } = defineConfig({
  hooks: {
    onComplete: (className) => twMerge(className),
  },
});

export type RequiredVariantProps<
  T extends (...args: any) => any,
  R extends string & keyof VariantProps<T>,
> = VariantProps<T> & Required<Pick<VariantProps<T>, R>>;
