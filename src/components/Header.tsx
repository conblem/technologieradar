import { cx } from "../../cva.config.ts";
import ClerkComponent from "./clerk";
import { OrganizationProfile } from "./clerk/OrganizationProfile.tsx";
import { Link } from "@tanstack/solid-router";
import MapPinPlus from "lucide-solid/icons/map-pin-plus";
import { ComponentProps, splitProps, Suspense, children, Show } from "solid-js";

export function Header(props: ComponentProps<"header"> & { cto: boolean }) {
  const [local, other] = splitProps(props, ["class", "children", "cto"]);
  const resolved = children(() => local.children);

  return (
    <header {...other} class={cx(local.class, "dock")}>
      {resolved()}
      <Show when={local.cto} fallback={<span />}>
        <Link
          activeProps={{ class: "dock-active" }}
          to={"/technologies/create"}
        >
          <MapPinPlus />
        </Link>
      </Show>
      <Suspense fallback={<span />}>
        <OrganizationProfile />
      </Suspense>
      <Suspense fallback={<span />}>
        <ClerkComponent fn="UserButton" />
      </Suspense>
    </header>
  );
}
