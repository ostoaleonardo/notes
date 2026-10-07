import { MIME_TYPES } from './mime-types'

export const IMAGE_EXTENSION_BY_MIME_TYPE = {
    [MIME_TYPES.JPEG]: 'jpg',
    [MIME_TYPES.PNG]: 'png',
    [MIME_TYPES.WEBP]: 'webp',
    [MIME_TYPES.GIF]: 'gif'
}

export const IMAGE_PICKER_OPTIONS = {
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 1
}

export const DEFAULT_IMAGE_EXTENSION = 'jpg'

export const IMAGE_EXTENSION_PATTERN = /\.(\w+)$/

export const MAX_PREVIEW_IMAGE_CACHE = 20

export const IMAGE_SOURCES = {
    CAMERA: 'camera',
    GALLERY: 'gallery'
}

export const IMAGE_VIEWER_MAX_SCALE = 6
