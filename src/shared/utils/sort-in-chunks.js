import { yieldToUi } from '@/shared/utils/yield-to-ui'

import { SEARCH_SORT_CHUNK_SIZE } from '@/shared/constants/search-scan'

const mergeRuns = (left, right, compare) => {
    const merged = new Array(left.length + right.length)
    let a = 0
    let b = 0

    for (let index = 0; index < merged.length; index += 1) {
        const takeLeft = b >= right.length || (a < left.length && compare(right[b], left[a]) >= 0)
        merged[index] = takeLeft ? left[a++] : right[b++]
    }

    return merged
}

export const sortInChunks = async (items, compare, options = {}) => {
    const { chunkSize = SEARCH_SORT_CHUNK_SIZE, yieldFn = yieldToUi } = options
    let runs = []

    for (let start = 0; start < items.length; start += chunkSize) {
        runs.push(items.slice(start, start + chunkSize).sort(compare))
        await yieldFn()
    }

    while (runs.length > 1) {
        const merged = []

        for (let index = 0; index < runs.length; index += 2) {
            merged.push(index + 1 < runs.length ? mergeRuns(runs[index], runs[index + 1], compare) : runs[index])
            await yieldFn()
        }

        runs = merged
    }

    return runs[0] || []
}
