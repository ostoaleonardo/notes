import { MIME_TYPES } from './mime-types'

export const FILE_KINDS = {
    IMAGE: 'image',
    AUDIO: 'audio',
    VIDEO: 'video',
    PDF: 'pdf',
    TEXT: 'text'
}

export const FILE_MIME_TYPES = {
    png: MIME_TYPES.PNG,
    jpg: MIME_TYPES.JPEG,
    jpeg: MIME_TYPES.JPEG,
    gif: MIME_TYPES.GIF,
    webp: MIME_TYPES.WEBP,
    svg: MIME_TYPES.SVG,
    bmp: MIME_TYPES.BMP,
    avif: MIME_TYPES.AVIF,
    mp3: MIME_TYPES.MP3,
    wav: MIME_TYPES.WAV,
    m4a: MIME_TYPES.M4A,
    ogg: MIME_TYPES.OGG_AUDIO,
    flac: MIME_TYPES.FLAC,
    '3gp': MIME_TYPES.GPP3,
    mp4: MIME_TYPES.MP4,
    webm: MIME_TYPES.WEBM,
    ogv: MIME_TYPES.OGG_VIDEO,
    mov: MIME_TYPES.QUICKTIME,
    mkv: MIME_TYPES.MATROSKA,
    pdf: MIME_TYPES.PDF,
    txt: MIME_TYPES.TEXT
}

export const FILE_KIND_BY_EXTENSION = {
    png: FILE_KINDS.IMAGE,
    jpg: FILE_KINDS.IMAGE,
    jpeg: FILE_KINDS.IMAGE,
    gif: FILE_KINDS.IMAGE,
    webp: FILE_KINDS.IMAGE,
    svg: FILE_KINDS.IMAGE,
    bmp: FILE_KINDS.IMAGE,
    avif: FILE_KINDS.IMAGE,
    mp3: FILE_KINDS.AUDIO,
    wav: FILE_KINDS.AUDIO,
    m4a: FILE_KINDS.AUDIO,
    ogg: FILE_KINDS.AUDIO,
    flac: FILE_KINDS.AUDIO,
    '3gp': FILE_KINDS.AUDIO,
    mp4: FILE_KINDS.VIDEO,
    webm: FILE_KINDS.VIDEO,
    ogv: FILE_KINDS.VIDEO,
    mov: FILE_KINDS.VIDEO,
    mkv: FILE_KINDS.VIDEO,
    pdf: FILE_KINDS.PDF,
    txt: FILE_KINDS.TEXT
}
