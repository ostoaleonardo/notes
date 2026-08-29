export const collectMarks = (node) => {
    const marks = []
    let child = node.firstChild

    while (child) {
        if (child.name.endsWith('Mark')) marks.push({ from: child.from, to: child.to })
        child = child.nextSibling
    }

    return marks
}

export const isRangeSelected = (selection, from, to) => selection.from <= to && selection.to >= from

export const overlapsAny = (from, to, ranges) => ranges.some((range) => from < range.to && to > range.from)
