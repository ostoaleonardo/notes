import { CLOSE_DELIMITER, DELIMITER, MIME_TYPES } from '@/constants'

export const getMultipartRequestBody = (metadata, content) => {
    const metadataString = JSON.stringify(metadata)
    const contentString = JSON.stringify(content)

    const multipartRequestBody =
        DELIMITER +
        'Content-Type: ' + MIME_TYPES.JSON + '\r\n\r\n' +
        metadataString +
        DELIMITER +
        'Content-Type: ' + MIME_TYPES.JSON + '\r\n\r\n' +
        contentString +
        CLOSE_DELIMITER

    return multipartRequestBody
}
