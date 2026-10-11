export const replaceInSet = (set, from, to) => {
    const next = new Set(set)
    next.delete(from)
    next.add(to)
    return next
}
