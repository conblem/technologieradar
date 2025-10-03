import { cx } from "../../cva.config";
import {
  toaster,
  Region,
  List,
  Toast as KobalteToast,
} from "@kobalte/core/toast";
import { ComponentProps, splitProps } from "solid-js";

export function ToastRegion() {
  return (
    <Region class="toast z-40 mb-14">
      <List />
    </Region>
  );
}

function Toast(props: ComponentProps<typeof KobalteToast> & { class: string }) {
  const [local, other] = splitProps(props, ["class"]);
  return <KobalteToast {...other} class={cx(local.class, "alert")} />;
}

export function successToast() {
  toaster.show((props) => (
    <Toast {...props} class="alert-success">
      Created
    </Toast>
  ));
}

export function errorToast(err: Error) {
  toaster.show((props) => (
    <Toast {...props} class="alert-error">
      {err.message}
    </Toast>
  ));
}
