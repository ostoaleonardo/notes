export const getRepositoryPath = (uri) => {
    try {
        const decoded = decodeURIComponent(uri)
        const treeIndex = decoded.indexOf('/tree/')
        const raw = treeIndex >= 0 ? decoded.slice(treeIndex + 6) : decoded
        const colonIndex = raw.indexOf(':')

        return colonIndex >= 0 ? raw.slice(colonIndex + 1) : raw
    } catch {
        return uri
    }
}
