type CaptionMetadata = {
  translationLanguages: Array<{
    languageCode: string;
  }>;
  captionTracks: Array<{ baseUrl: string }>;
};
type Caption = {
  text: string;
  start: number;
  duration: number;
};

/**
 *  Retrieves the video transcript for a given language.
 *  @param {object} meta caption metadata
 *  @param {string} language - e.g. en, fr, es en,
 *  @return {Promise<Caption[]> | undefined} An object containing the transcript for the given language
 */
export async function fetch_transcript(
  meta: CaptionMetadata,
  language: string = "en"
): Promise<Caption[] | undefined> {
  const transcript = meta.translationLanguages.filter(
    (lang) => lang.languageCode === language
  );
  if (!transcript) {
    throw new Error("language not found");
  }

  let url = meta.captionTracks[0]?.baseUrl;
  if (!url) {
    throw new Error("no caption track found");
  }

  // retrieve translated captions for target language
  if (language !== "en") {
    url = url + "&tlang=" + language;
  }

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
function getSubtitle(
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
