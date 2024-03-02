import { fetch_transcript, list_transcripts } from "./utils";

export async function get_subtitles_for_video(
  video_id: string,
  language: string = "en"
) {
  const transcriptsMeta = await list_transcripts(video_id);
  const transcriptLang = transcriptsMeta.translationLanguages.filter(
    (lang) => lang.languageCode === language
  );
  if (transcriptLang.length === 0) {
    throw new Error("No transcript found for language: " + language);
  }
  let url = transcriptsMeta.captionTracks[0]?.baseUrl;
  if (url === undefined) {
    throw new Error("No transcript URL found");
  }
  // retrieve translated captions for target language
  if (language !== "en") {
    url = url + "&tlang=" + language;
  }
  return fetch_transcript(url);
}

export async function get_available_languages(
  video_id: string
): Promise<string[]> {
  const transcriptsMeta = await list_transcripts(video_id);
  return transcriptsMeta.translationLanguages.map((x) => x.languageCode);
}
