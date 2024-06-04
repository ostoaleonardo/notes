const GOOGLE_APIS = {
    FILES_LIST: 'https://www.googleapis.com/drive/v3/files',
    SIMPLE_UPLOAD: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=media',
    MULTIPART_UPLOAD: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
}

const MIME_TYPES = {
    JSON: 'application/json',
}

const BOUNDARY = '\r\n--foo_bar_baz'
const DELIMITER = BOUNDARY + '\r\n'
const CLOSE_DELIMITER = BOUNDARY + '--'

export {
    GOOGLE_APIS,
    MIME_TYPES,
    DELIMITER,
    CLOSE_DELIMITER
}
