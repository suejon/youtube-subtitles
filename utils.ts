import { WATCH_URL } from "./constants";
import { Caption, TranscriptsMeta } from "./types";

export function isTranscripsMeta(value: any): value is TranscriptsMeta {
  return "translationLanguages" in value && "captionTracks" in value;
}

/**
 *  Retrieves the video transcript for a given language.
 *  @param {string} url - The URL of the transcript (this is not the video url)
 *  @return {Promise<Caption[]> | undefined} An object containing the transcript for the given language
 */
export async function fetch_transcript(
  url: string
): Promise<Caption[] | undefined> {
  // retrieve translated captions for target language

  const timed_text = await fetch(url, {
    headers: { "Accept-Language": "en-us" },
  });
  const html = await timed_text.text();
  try {
    const parser = new DOMParser();
    const xml_doc = parser.parseFromString(html, "application/xml");

    const captions: Caption[] = [];

    const root = xml_doc.childNodes[0];
    if (!root) {
      throw new Error("no root node found");
    }

    for (let i = 0; i < root.childNodes.length; i++) {
      const element = root.childNodes[i] as Element;
      if (!element) {
        continue;
      }
      const text = element.textContent;
      const start = element.getAttribute("start");
      const dur = element.getAttribute("dur");
      if (!text || !start || !dur) {
        continue;
      }
      captions.push({
        text: element.textContent?.replace(/<[^>]*>/, "") || "",
        start: parseInt(start),
        duration: parseInt(dur) ?? 0.0,
      });
    }
    return captions;
  } catch (error) {
    console.error("error: ", error);
  }
}
/**
 * Retrieves the video transcript for a given language.
 * @param {Array} subtitles - An array of objects containing the transcript for the given language
 * @param {number} video_curr_time - The current time of the video
 * @return {string} The subtitle text to display
 */
export function get_subtitle(
  subtitles: Caption[],
  video_curr_time: number
): Caption | undefined {
  return subtitles.filter((s) => s.start < video_curr_time).at(-1);
}
/**
 * Generate HTML for subtitle text
 * @param {string} text - The subtitle text to display
 * @return {string} HTML to display
 * */
function create_caption_element(text: string): string {
  const html = `<span style="display: block;" class="caption-visual-line"><span style="display: inline-block; white-space: pre-wrap; background: rgba(8, 8, 8, 0.75); font-size: 13.155556px; color: rgb(255, 255, 255); fill: rgb(255, 255, 255); font-family: &quot;YouTube Noto&quot;, Roboto, &quot;Arial Unicode Ms&quot;, Arial, Helvetica, Verdana, &quot;PT Sans Caption&quot;, sans-serif;" class="ytp-caption-segment">${text}</span></span>`;
  return html;
}
/**
 * Generate HTML for caption container
 * @return {HTMLSpanElement} The caption container
 * */
function create_caption_container(): HTMLSpanElement {
  const container = document.createElement("span");
  container.className = "captions-text";
  // container.style = "overflow-wrap: normal; display: block;";
  container.id = "caption-text-secondary";
  return container;
}
/**
 *  Retrieves the available captions for a given video.
 *  @param {string} video_id - The video's unique ID.
 *  @return {TranscriptsMeta} An object of available captions.
 */
export async function list_transcripts(
  video_id: string
): Promise<TranscriptsMeta> {
  console.log("fetching transcripts for video id: ", video_id);
  const data = await fetch(WATCH_URL + video_id, {
    headers: { "Accept-Language": "en-us" },
  });
  const html = await data.text();
  const captions = extract_json(html);
  if (!isTranscripsMeta(captions)) {
    throw new Error("error extracting captions");
  }
  return captions as TranscriptsMeta;
}

/**
 * Extracts the JSON object containing the captions from the HTML.
 * @param {string} html - The HTML of the YouTube video page.
 * @return {object} The JSON object containing the captions.
 * @throws {Error} If the captions cannot be found.
 */
function extract_json(html: string): object {
  const split_html = html.split(/"captions":/);

  if (split_html.length === 1) {
    throw new Error("captions not found");
  }
  try {
    const captions_text = split_html[1]
      ?.split(',"videoDetails"')[0]
      ?.replace("\n", "");
    if (!captions_text) {
      throw new Error("captions not found");
    }

    const captions_json =
      JSON.parse(captions_text).playerCaptionsTracklistRenderer;

    if (!captions_json) {
      throw new Error("captions not found");
    }

    return captions_json;
  } catch (error) {
    throw new Error("captions not found");
  }
}
