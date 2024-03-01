export type CaptionMetadata = {
  translationLanguages: Array<{
    languageCode: string;
  }>;
  captionTracks: Array<{ baseUrl: string }>;
};
export type Caption = {
  text: string;
  start: number;
  duration: number;
};
