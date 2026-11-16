export const getRepositoryPath = (uri) => {
    try {
        const decoded = decodeURIComponent(uri)
        const documentIndex = decoded.lastIndexOf('/document/')
        const treeIndex = decoded.indexOf('/tree/')

        const start = documentIndex >= 0
            ? documentIndex + '/document/'.length
            : (treeIndex >= 0 ? treeIndex + '/tree/'.length : 0)

        const raw = decoded.slice(start)
        const colonIndex = raw.indexOf(':')

        return colonIndex >= 0 ? raw.slice(colonIndex + 1) : raw
    } catch {
        return uri
    }
}
