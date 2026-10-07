import { NON_WORD_PATTERN } from '@/constants/markdown-patterns'
import { FUZZY_SCORES, FUZZY_NO_PREVIOUS_INDEX } from '@/constants/fuzzy-match'

export const fuzzyMatch = (query, text) => {
    if (!query) return { matches: true, score: 0 }

    const q = query.toLowerCase()
    const t = text.toLowerCase()

    let qi = 0
    let score = 0
    let lastIndex = FUZZY_NO_PREVIOUS_INDEX

    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] !== q[qi]) continue

        score += lastIndex === ti - 1 ? FUZZY_SCORES.CONSECUTIVE : FUZZY_SCORES.MATCH
        if (ti === 0 || NON_WORD_PATTERN.test(t[ti - 1])) score += FUZZY_SCORES.WORD_START

        lastIndex = ti
        qi++
    }

    return qi === q.length ? { matches: true, score } : { matches: false, score: 0 }
}
