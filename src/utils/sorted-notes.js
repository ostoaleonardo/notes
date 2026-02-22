export const getSortedNotes = (a, b, sort) => {
    const order = sort.order === 'asc' ? 1 : -1

    if (sort.field === 'created') {
        return order * (new Date(a.createdAt) - new Date(b.createdAt))
    }

    if (sort.field === 'updated') {
        return order * (new Date(a.updatedAt) - new Date(b.updatedAt))
    }

    if (sort.field === 'title') {
        return order * a.title.localeCompare(b.title)
    }
}
