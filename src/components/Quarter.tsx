import { useResizeObserver } from "../utils/useResizeObserver.ts";
import { ComponentProps, createSignal, splitProps } from "solid-js";

const VIEWBOX = 600;
const STROKE_WIDTH = 3;

export function Quarter(
  props: Omit<ComponentProps<"svg">, "ref"> & {
    spacing: number;
    backgroundClass?: string;
  },
) {
  const [local, other] = splitProps(props, ["spacing", "backgroundClass"]);
  const [spacing, setSpacing] = createSignal(0.00001);
  const [borderWidth, setBorderWidth] = createSignal(1);
  const resizeObserver = useResizeObserver((el) => {
    // ignore zero
    if (!el.clientWidth) {
      return;
    }
    // spacing is an absolute value in pixel so we convert it to relative value between 0 and 1
    setSpacing(local.spacing / el.clientWidth);
    setBorderWidth((STROKE_WIDTH / VIEWBOX) * el.clientWidth);
  });

  const HigherPath = (props: { radius: number }) => (
    <Path
      strokeWidth={STROKE_WIDTH}
      viewbox={600}
      radius={props.radius}
      spacing={spacing()}
    />
  );

  return (
    <svg
      {...other}
      style={{
        "border-bottom": `${borderWidth().toString()}px solid currentcolor`,
        "border-right": `${borderWidth().toString()}px solid currentcolor`,
      }}
      ref={resizeObserver}
      viewBox="0 0 600 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx={600 + spacing() * 600}
        cy={600 + spacing() * 600}
        r={600 + spacing() * 600}
        fill="currentColor"
        class={local.backgroundClass}
      />
      <HigherPath radius={600} />
      <HigherPath radius={500} />
      <HigherPath radius={400} />
      <HigherPath radius={200} />
    </svg>
  );
}

function Path(props: {
  viewbox: number;
  radius: number;
  strokeWidth: number;
  spacing: number;
}) {
  const diff = () => props.viewbox - props.radius + props.strokeWidth / 2;
  // spacing is relative to viewbox size
  const spacing = () => props.viewbox * props.spacing;
  const viewbox = () => props.viewbox + spacing();
  const radius = () => props.radius + spacing();

  return (
    <path
      d={`M ${viewbox().toString()} ${diff().toString()} A ${radius().toString()} ${radius().toString()} 0 0 0 ${diff().toString()} ${viewbox().toString()}`}
      fill="none"
      stroke="currentColor"
      stroke-width={props.strokeWidth}
    />
  );
}
