export const SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata'
]

export const GOOGLE_APIS = {
    FILES: 'https://www.googleapis.com/drive/v3/files',
    UPLOAD: 'https://www.googleapis.com/upload/drive/v3/files',
    CHANGES: 'https://www.googleapis.com/drive/v3/changes'
}

export const UPLOAD_TYPES = {
    SIMPLE: 'media',
    MULTIPART: 'multipart'
}

export const MIME_TYPES = {
    JSON: 'application/json',
}

const BOUNDARY = 'foo_bar_baz'
export const DELIMITER = '\r\n--' + BOUNDARY + '\r\n'
export const CLOSE_DELIMITER = '\r\n--' + BOUNDARY + '--'
export const CONTENT_TYPE = 'multipart/related; boundary=' + BOUNDARY

export const SYNC_INTERVAL = 5 * 60 * 1000
