import { useResizeObserver } from "./useResizeObserver.ts";
import { renderHook } from "@solidjs/testing-library";
import { test, expect, vi } from "vitest";

export function expectToBeDefined<T>(value: T | undefined): asserts value is T {
  expect(value).toBeDefined();
}

test("useResizeObserver", () => {
  const ResizeObserverMock = vi.fn((_: (el: HTMLDivElement) => void) => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);

  const callback = vi.fn();
  const { result, cleanup } = renderHook(useResizeObserver<HTMLDivElement>, {
    initialProps: [callback],
  });

  const target1 = document.createElement("div");
  result(target1);

  expect(callback).toHaveBeenCalledExactlyOnceWith(target1);

  const [fn] = ResizeObserverMock.mock.calls[0] ?? [];
  expectToBeDefined(fn);

  fn(target1);
  expect(callback).toHaveBeenNthCalledWith(2, target1);

  const target2 = document.createElement("div");
  result(target2);
  expect(callback).toHaveBeenNthCalledWith(3, target2);

  // todo: write cleanup test
  cleanup();
});
