const sameContent = (a, b) => (a ?? '').trim() === (b ?? '').trim()

const sameList = (a, b) => a.length === b.length && a.every((item, index) => item === b[index])

const matches = (left, right) => (
    sameContent(left.note, right.note) &&
    sameList(left.tags, right.tags) &&
    JSON.stringify(left.properties) === JSON.stringify(right.properties) &&
    left.invalidFrontmatter === right.invalidFrontmatter
)

export const planExternalSync = ({ draft, original, incoming }) => {
    if (!incoming || !matches(draft, original)) return null
    return matches(incoming, original) ? null : incoming
}
