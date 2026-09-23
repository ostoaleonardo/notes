export const fuzzyMatch = (query, text) => {
    if (!query) return { matches: true, score: 0 }

    const q = query.toLowerCase()
    const t = text.toLowerCase()

    let qi = 0
    let score = 0
    let lastIndex = -2

    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] !== q[qi]) continue

        score += lastIndex === ti - 1 ? 3 : 1
        if (ti === 0 || /\W/.test(t[ti - 1])) score += 2

        lastIndex = ti
        qi++
    }

    return qi === q.length ? { matches: true, score } : { matches: false, score: 0 }
}
