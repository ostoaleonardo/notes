import { useEffect, useEffectEvent, useMemo, useState } from 'react'

import { fontFacesCss } from './markdown-dom-fonts'
import { katexFontFacesCss } from './markdown-dom-katex-fonts'

import { NO_KATEX_FONTS } from '@/constants/markdown-math'

export const useEditorFonts = ({ loadFonts, loadKatexFonts, hasMath }) => {
    const [fonts, setFonts] = useState(null)
    const [loadedKatexFonts, setLoadedKatexFonts] = useState(null)
    const katexFonts = hasMath ? loadedKatexFonts : NO_KATEX_FONTS

    const fetchFonts = useEffectEvent(() => loadFonts().then(setFonts))
    const fetchKatexFonts = useEffectEvent(() => loadKatexFonts().then(setLoadedKatexFonts))

    useEffect(() => {
        fetchFonts()
    }, [])

    useEffect(() => {
        if (hasMath) fetchKatexFonts()
    }, [hasMath])

    const fontsCss = useMemo(() => (
        fontFacesCss(fonts) + katexFontFacesCss(katexFonts)
    ), [fonts, katexFonts])

    return { fontsReady: !!fonts && !!katexFonts, fontsCss }
}
