import { TranscriptsMeta } from "./types";

export function isTranscripsMeta(value: any): value is TranscriptsMeta {
  return "translationLanguages" in value && "captionTracks" in value;
}
