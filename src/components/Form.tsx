import { cx } from "../../cva.config.ts";
import { useUnsavedChanges } from "./UnsavedChanges.tsx";
import { TextField } from "@kobalte/core/text-field";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/solid-form";
import { Block } from "@tanstack/solid-router";
import Save from "lucide-solid/icons/save";
import { children, ComponentProps, JSX, Show, splitProps } from "solid-js";
import * as z from "zod/mini";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const ZodError = z.object({
  message: z.string(),
});

function Input<T extends "input" | "textarea" = "input">(
  props: Omit<
    ComponentProps<typeof TextField.Input<T>>,
    "as" | "onInput" | "onBlur" | "value"
  > & { label?: string; as?: T },
) {
  const [local, other] = splitProps(
    // simplify props type so typescript can figure out the rest correctly
    props as {
      label?: string;
      class?: string;
      children?: JSX.Element;
      as?: T;
    },
    ["label", "class", "children", "as"],
  );
  const resolved = children(() => local.children);
  const as: () => "input" | "textarea" = () => local.as ?? "input";

  const field = useFieldContext<string>();
  const errors = () =>
    field()
      .state.meta.errors.filter(
        (error): error is z.infer<typeof ZodError> =>
          ZodError.safeParse(error).success,
      )
      .map(({ message }) => message)
      .join(", ");

  return (
    <TextField
      class="fieldset"
      value={field().state.value}
      name={field().name}
      validationState={field().state.meta.isValid ? "valid" : "invalid"}
    >
      <TextField.Label class="fieldset-legend">{local.label}</TextField.Label>
      <TextField.Input
        {...other}
        as={as()}
        onBlur={field().handleBlur}
        onInput={(e) => {
          field().handleChange(e.currentTarget.value);
        }}
        class={cx(
          local.class,
          // has to be hardcoded so tailwind can figure out the classes
          as() === "input" ? "input" : "textarea",
          "validator",
          {
            ["input-error"]: as() === "input" && !field().state.meta.isValid,
            ["textarea-error"]:
              as() === "textarea" && !field().state.meta.isValid,
          },
        )}
      />
      {resolved()}
      <TextField.ErrorMessage class="validator-hint">
        {errors()}
      </TextField.ErrorMessage>
    </TextField>
  );
}

function Submit(props: Omit<ComponentProps<"button">, "type" | "disabled">) {
  const [local, other] = splitProps(props, ["class", "children"]);
  const resolved = children(() => local.children);

  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button
          {...other}
          class={cx("btn btn-soft btn-primary", local.class)}
          type="submit"
          disabled={isSubmitting()}
        >
          <Show when={isSubmitting()} fallback={<Save />}>
            <span class="loading loading-spinner"></span>
          </Show>
          {resolved()}
        </button>
      )}
    </form.Subscribe>
  );
}

function UnsavedChanges() {
  const form = useFormContext();
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isDefaultValue = useStore(form.store, (state) => state.isDefaultValue);

  const unsavedChanges = useUnsavedChanges();

  return (
    <>
      <unsavedChanges.Component />
      <Block
        shouldBlockFn={async () => {
          if (isDefaultValue() || isSubmitting()) {
            return false;
          }
          return !(await unsavedChanges.open());
        }}
      />
    </>
  );
}

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Input,
  },
  formComponents: {
    Submit,
    UnsavedChanges,
  },
});
