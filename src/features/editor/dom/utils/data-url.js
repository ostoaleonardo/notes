const BASE64_MARKER = ';base64,'

export const dataUrlToBytes = (dataUrl) => {
    const start = dataUrl.indexOf(BASE64_MARKER)
    if (start === -1) return null

    const binary = atob(dataUrl.slice(start + BASE64_MARKER.length))
    const bytes = new Uint8Array(binary.length)

    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

    return bytes
}
