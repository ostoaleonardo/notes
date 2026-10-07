import { DEFAULT_ATTACHMENT_FOLDER } from './attachments'

export const NOTE_FILE_EXTENSION = '.md'
export const VERSIONS_FILENAME_SUFFIX = '.versions.json'
export const CORRUPT_FILE_SUFFIX = '.corrupt'
export const NOTE_PATH_SEPARATOR = '::'

export const WRITE_ATTEMPTS = 2

export const NOTE_READ_CONCURRENCY = 16

export const TEMPLATES_FOLDER_NAME = 'templates'
export const IMAGES_FOLDER_NAME = 'images'
const FILES_FOLDER_NAME = DEFAULT_ATTACHMENT_FOLDER
export const VAULT_TRASH_FOLDER_NAME = '.trash'
export const NOTES_FOLDER_NAME = '.notes'

export const RESERVED_FOLDER_NAMES = [
    TEMPLATES_FOLDER_NAME,
    IMAGES_FOLDER_NAME,
    FILES_FOLDER_NAME
]
