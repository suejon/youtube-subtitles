# Youtube Captions

A zero dependency tool for downloading youtube captions.

## How to install

```bash
npm install @suejon/youtube-subtitles
```

## How to use

### Fetch subtitles for a video

The `video_id` can be found in the url of the video. For example, in the url `https://www.youtube.com/watch?v=abcdef`, the `video_id` is `abcdef`.

Here is an example of fetching french subtitles for a video:

```javascript
const subtitles = await get_subtitles_for_video("video_id", "fr");
```

If the language is not specified, it defaults to english ("en"). Valid codes are in the [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format.

The subtitles will be an array of objects, each object representing the subtitle text including the `start` time when they should be displayed and the `dur`ation they should be displayed for (in seconds). Each object has the following structure:

```javascript
{
  start: 241,
  dur: 6,
  text: "one of the great fish of the world to"
}
```
