import { expect } from "vitest";
import { test } from "vitest";
import { get_subtitle, fetch_transcript } from "./index";
import { vi } from "vitest";

global.fetch = vi.fn();

function createFetchResponse(data) {
  return {
    json: () => new Promise((resolve) => resolve(data)),
    text: () => new Promise((resolve) => resolve(data)),
  };
}

test("fetches caption at specific time", () => {
  const caption = {
    text: "Hello",
    start: 0,
    end: 1,
  };
  const value = get_subtitle([caption], 10);
  expect(value.text).toBe("Hello");
});

test("it tries to fetch captions for a video url", () => {
  fetch.mockResolvedValue(createFetchResponse({}));
  const url = "https://www.youtube.com/watch?v=9bZkp7q19f0";
  fetch_transcript(url);
  expect(fetch).toHaveBeenCalledWith(url, {
    headers: { "Accept-Language": "en-us" },
  });
});
