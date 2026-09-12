export const toggleSavedSearch = (saved, query, id) => {
    const trimmed = query.trim()
    const exists = saved.some((entry) => entry.query === trimmed)

    return exists
        ? saved.filter((entry) => entry.query !== trimmed)
        : [{ id, query: trimmed }, ...saved]
}

export const removeSavedSearch = (saved, id) => saved.filter((entry) => entry.id !== id)
