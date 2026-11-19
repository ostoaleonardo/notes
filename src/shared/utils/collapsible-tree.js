export const markChildren = (items) => items.map((item, position) => ({
    ...item,
    hasChildren: items[position + 1]?.depth > item.depth
}))

export const getVisibleTree = (items, collapsed, getKey) => {
    const visible = []
    let hiddenFrom = null

    for (const item of items) {
        if (hiddenFrom !== null && item.depth > hiddenFrom) continue

        hiddenFrom = collapsed.has(getKey(item)) ? item.depth : null
        visible.push(item)
    }

    return visible
}
