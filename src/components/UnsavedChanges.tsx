import { AlertDialogContent, AlertDialogOverlay } from "./AlertDialog";
import { AlertDialog } from "@kobalte/core/alert-dialog";
import { Button } from "@kobalte/core/button";
import CircleAlert from "lucide-solid/icons/circle-alert";
import { createSignal } from "solid-js";

export function useUnsavedChanges() {
  const [open, setOpen] = createSignal(false);
  const [onConfirm, setOnConfirm] = createSignal({
    fn: () => {
      /* empty */
    },
  });
  const [onCancel, setOnCancel] = createSignal({
    fn: () => {
      /* empty */
    },
  });
  return {
    open: () =>
      new Promise<boolean>((res) => {
        setOnConfirm({
          fn: () => {
            res(true);
            setOpen(false);
          },
        });
        setOnCancel({
          fn: () => {
            res(false);
            setOpen(false);
          },
        });
        setOpen(true);
      }),
    Component: () => (
      <UnsavedChanges
        open={open()}
        onConfirm={onConfirm().fn}
        onCancel={onCancel().fn}
      />
    ),
  };
}

function UnsavedChanges(props: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AlertDialog open={props.open}>
      <AlertDialog.Portal>
        <AlertDialogOverlay />
        <AlertDialogContent class="alert alert-vertical sm:alert-horizontal">
          <CircleAlert />
          <div>
            <AlertDialog.Title as="h3" class="font-bold">
              Warning
            </AlertDialog.Title>
            <AlertDialog.Description>
              You have unsaved changes, are you sure you want to leave?
            </AlertDialog.Description>
          </div>
          <div class="flex gap-1">
            <AlertDialog.CloseButton
              class="btn"
              on:click={() => {
                props.onCancel();
              }}
            >
              Stay
            </AlertDialog.CloseButton>
            <Button
              class="btn btn-warning"
              on:click={() => {
                props.onConfirm();
              }}
            >
              Leave
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
