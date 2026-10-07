export const toggleInSet = (set, value) => {
    const next = new Set(set)

    if (next.has(value)) {
        next.delete(value)
    } else {
        next.add(value)
    }

    return next
}
