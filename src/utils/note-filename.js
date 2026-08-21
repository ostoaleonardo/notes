const ILLEGAL_CHARS = /[/\\:*?"<>|\x00-\x1F]/g

export const sanitizeFilename = (title) => {
    const clean = (title || '').replace(ILLEGAL_CHARS, ' ').trim().slice(0, 200)
    return clean || 'Untitled'
}

export const getUniqueTitle = (existingTitles, base) => {
    const taken = new Set(existingTitles)
    let title = base
    let count = 2

    while (taken.has(title)) {
        title = `${base} (${count})`
        count++
    }

    return title
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
