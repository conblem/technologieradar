import { AlertDialog } from "@kobalte/core/alert-dialog";
import { ComponentProps } from "solid-js";

export function AlertDialogOverlay() {
  return <AlertDialog.Overlay class="fixed inset-0 z-40 bg-black/75" />;
}

export function AlertDialogContent(
  props: ComponentProps<typeof AlertDialog.Content>,
) {
  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <AlertDialog.Content {...props} />
    </div>
  );
}
