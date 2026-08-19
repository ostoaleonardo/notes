const ILLEGAL_CHARS = /[/\\:*?"<>|\x00-\x1F]/g

export const sanitizeFilename = (title) => {
    const clean = (title || '').replace(ILLEGAL_CHARS, ' ').trim().slice(0, 200)
    return clean || 'Untitled'
}

export const getUniqueFilename = (existingNames, title, currentFilename) => {
    const base = sanitizeFilename(title)
    const taken = new Set(existingNames.filter((name) => name !== currentFilename))

    let filename = base + '.md'
    let count = 2

    while (taken.has(filename)) {
        filename = `${base} (${count}).md`
        count++
    }

    return filename
}
