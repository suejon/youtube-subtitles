import { expect } from "vitest";
import { test } from "vitest";
import { getSubtitle } from "./index";

test("fetches caption at specific time", () => {
  const caption = {
    text: "Hello",
    start: 0,
    end: 1,
  };
  const value = getSubtitle([caption], 10);
  expect(value.text).toBe("Hello");
});
