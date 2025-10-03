import { InsertTechnology } from "../db/validation.ts";
import { useCompletion } from "../utils/useCompletion.ts";
import { useAppForm } from "./Form.tsx";
import { useStore } from "@tanstack/solid-form";
import Bot from "lucide-solid/icons/bot";
import { type ComponentProps, createEffect, Show, splitProps } from "solid-js";

interface FormData {
  name: string;
  description: string;
}

export function CreateTechnologyForm(
  props: {
    onSubmit?: (value: FormData) => void | Promise<void>;
    onChange?: (value: FormData) => void | Promise<void>;
  } & Omit<ComponentProps<"form">, "onSubmit" | "children">,
) {
  const [local, other] = splitProps(props, ["onSubmit", "onChange"]);
  const form = useAppForm(() => ({
    defaultValues: {
      name: "",
      description: "",
    } satisfies FormData,
    onSubmit: ({ value }) => local.onSubmit?.(value),
  }));

  const values = useStore(form.store, (s) => s.values);
  createEffect(() => void local.onChange?.(values()));

  const completion = useCompletion(() => values().name);
  createEffect(() => {
    if (!completion.data()) {
      return;
    }
    form.setFieldValue("description", completion.data());
  });

  return (
    <>
      <form
        {...other}
        on:submit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.AppField
          name="name"
          validators={{ onChange: InsertTechnology.shape.name }}
        >
          {(field) => <field.Input label="Name" class="input-lg w-full" />}
        </form.AppField>
        <form.AppField
          name="description"
          validators={{ onChange: InsertTechnology.shape.description }}
        >
          {(field) => (
            <field.Input
              as="textarea"
              class="w-full textarea-lg break-words whitespace-pre-wrap"
              disabled={completion.fetching()}
              label="Description"
              rows="10"
            ></field.Input>
          )}
        </form.AppField>
        <div class="flex flex-row justify-between">
          <form.Subscribe selector={(state) => state.values.name}>
            {(name) => (
              <button
                type="button"
                class="btn btn-soft btn-info"
                disabled={!name() || completion.fetching()}
                on:click={completion.load}
              >
                <Show when={completion.fetching()} fallback={<Bot />}>
                  <span class="loading loading-spinner"></span>
                </Show>
              </button>
            )}
          </form.Subscribe>
          <form.AppForm>
            <form.Submit />
          </form.AppForm>
        </div>
        <form.AppForm>
          <form.UnsavedChanges />
        </form.AppForm>
      </form>
    </>
  );
}
