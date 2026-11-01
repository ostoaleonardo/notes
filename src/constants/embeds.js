export const EMBED_PATTERN = /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
export const EMBED_IMAGE_PATTERN = /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i
export const EMBED_AUDIO_PATTERN = /\.(mp3|wav|m4a|ogg|flac|3gp)$/i
export const EMBED_VIDEO_PATTERN = /\.(mp4|webm|ogv|mov|mkv)$/i
export const EMBED_MEDIA_PATTERN = /\.(png|jpe?g|gif|webp|svg|bmp|avif|mp3|wav|m4a|ogg|flac|3gp|mp4|webm|ogv|mov|mkv)$/i
export const EMBED_MEDIA_MAX_BYTES = 10 * 1024 * 1024
export const EMBED_PLAYER_PRELOAD = 'metadata'
export const EMBED_VIDEO_FRAME_FRAGMENT = '#t=0.001'
export const EMBED_WIDTH_PATTERN = /^\d+$/
export const EMBED_MAX_DEPTH = 2
export const EMBED_MARKER = '!'
export const EMBED_CLASS = 'embed'
export const EMBED_TITLE_CLASS = 'embed-title'
export const EMBED_LIVE_CLASS = 'cm-live-embed'
export const EMBED_LIVE_MEDIA_CLASS = 'cm-live-media'
export const EMBED_OPEN_CLASS = 'embed-open'
export const EMBED_OPEN_ICON_SIZE = '1em'
