export const FILE_KINDS = {
    IMAGE: 'image',
    AUDIO: 'audio',
    VIDEO: 'video',
    PDF: 'pdf'
}

export const FILE_MIME_TYPES = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    avif: 'image/avif',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    '3gp': 'audio/3gpp',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    pdf: 'application/pdf'
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
    pdf: FILE_KINDS.PDF
}
