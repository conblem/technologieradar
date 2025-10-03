import { toAngle, toCategory, toRadius, toRing } from "./transformations";
import { test, expect, describe } from "vitest";

describe.each([
  [1, 0.5, 0, 0.5, "tools", "hold"],
  [0.5, 0.5, 0, 0, "tools", "adopt"],
  [0.5, 1, 270, 0.5, "languages", "hold"],
])("transformations %d %d", (x, y, angle, radius, category, ring) => {
  test("angle", () => {
    expect(toAngle(x, y)).toBe(angle);
  });
  test("radius", () => {
    expect(toRadius(x, y)).toBe(radius);
  });
  test("category", () => {
    expect(toCategory(angle)).toBe(category);
  });
  test("ring", () => {
    expect(toRing(radius)).toBe(ring);
  });
});
