export const diffLines = (oldText, newText) => {
    const oldLines = (oldText || '').split('\n')
    const newLines = (newText || '').split('\n')

    const m = oldLines.length
    const n = newLines.length

    const lcs = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            lcs[i][j] = oldLines[i] === newLines[j]
                ? lcs[i + 1][j + 1] + 1
                : Math.max(lcs[i + 1][j], lcs[i][j + 1])
        }
    }

    const result = []
    let i = 0
    let j = 0

    while (i < m && j < n) {
        if (oldLines[i] === newLines[j]) {
            result.push({ type: 'unchanged', line: oldLines[i] })
            i++
            j++
        } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
            result.push({ type: 'removed', line: oldLines[i] })
            i++
        } else {
            result.push({ type: 'added', line: newLines[j] })
            j++
        }
    }

    while (i < m) {
        result.push({ type: 'removed', line: oldLines[i] })
        i++
    }

    while (j < n) {
        result.push({ type: 'added', line: newLines[j] })
        j++
    }

    return result
}
