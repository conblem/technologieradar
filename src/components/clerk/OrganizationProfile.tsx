import { AlertDialogContent, AlertDialogOverlay } from "../AlertDialog.tsx";
import ClerkComponent from "./index.tsx";
import { AlertDialog } from "@kobalte/core/alert-dialog";
import Users from "lucide-solid/icons/users";

export function OrganizationProfile() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger>
        <Users />
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <ClerkComponent fn="OrganizationProfile" />
        </AlertDialogContent>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
