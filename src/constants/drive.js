const GOOGLE_APIS = {
    FILES: 'https://www.googleapis.com/drive/v3/files',
    UPLOAD: 'https://www.googleapis.com/upload/drive/v3/files'
}

const UPLOAD_TYPES = {
    SIMPLE: '?uploadType=media',
    MULTIPART: '?uploadType=multipart',
}

const MIME_TYPES = {
    JSON: 'application/json',
}

const BOUNDARY = '\r\n--foo_bar_baz'
const DELIMITER = BOUNDARY + '\r\n'
const CLOSE_DELIMITER = BOUNDARY + '--'

export {
    GOOGLE_APIS,
    UPLOAD_TYPES,
    MIME_TYPES,
    DELIMITER,
    CLOSE_DELIMITER
}
