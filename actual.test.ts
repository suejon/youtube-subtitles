import { expect, test } from "vitest";
import { get_transcripts_for_video } from "./index";

/**
 * @vitest-environment jsdom
 */
test.skip("actually fetches transcript", async () => {
  const transcript = await get_transcripts_for_video("lz0l-YGJlwI");
  console.log(transcript);
  expect(transcript).toBeDefined();
});
