const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

export const bytesToBase64 = (bytes) => {
    let result = ''

    for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i]
        const b1 = bytes[i + 1]
        const b2 = bytes[i + 2]

        result += BASE64_CHARS[b0 >> 2]
        result += BASE64_CHARS[((b0 & 3) << 4) | (b1 >> 4)]
        result += b1 === undefined ? '=' : BASE64_CHARS[((b1 & 15) << 2) | (b2 >> 6)]
        result += b2 === undefined ? '=' : BASE64_CHARS[b2 & 63]
    }

    return result
}
