import { useEffect, useState } from 'react'
import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'
import { bytesToBase64 } from '@/utils'

const KATEX_FONT_MODULES = {
    'KaTeX_AMS-Regular': require('katex/dist/fonts/KaTeX_AMS-Regular.woff2'),
    'KaTeX_Caligraphic-Bold': require('katex/dist/fonts/KaTeX_Caligraphic-Bold.woff2'),
    'KaTeX_Caligraphic-Regular': require('katex/dist/fonts/KaTeX_Caligraphic-Regular.woff2'),
    'KaTeX_Fraktur-Bold': require('katex/dist/fonts/KaTeX_Fraktur-Bold.woff2'),
    'KaTeX_Fraktur-Regular': require('katex/dist/fonts/KaTeX_Fraktur-Regular.woff2'),
    'KaTeX_Main-Bold': require('katex/dist/fonts/KaTeX_Main-Bold.woff2'),
    'KaTeX_Main-BoldItalic': require('katex/dist/fonts/KaTeX_Main-BoldItalic.woff2'),
    'KaTeX_Main-Italic': require('katex/dist/fonts/KaTeX_Main-Italic.woff2'),
    'KaTeX_Main-Regular': require('katex/dist/fonts/KaTeX_Main-Regular.woff2'),
    'KaTeX_Math-BoldItalic': require('katex/dist/fonts/KaTeX_Math-BoldItalic.woff2'),
    'KaTeX_Math-Italic': require('katex/dist/fonts/KaTeX_Math-Italic.woff2'),
    'KaTeX_SansSerif-Bold': require('katex/dist/fonts/KaTeX_SansSerif-Bold.woff2'),
    'KaTeX_SansSerif-Italic': require('katex/dist/fonts/KaTeX_SansSerif-Italic.woff2'),
    'KaTeX_SansSerif-Regular': require('katex/dist/fonts/KaTeX_SansSerif-Regular.woff2'),
    'KaTeX_Script-Regular': require('katex/dist/fonts/KaTeX_Script-Regular.woff2'),
    'KaTeX_Size1-Regular': require('katex/dist/fonts/KaTeX_Size1-Regular.woff2'),
    'KaTeX_Size2-Regular': require('katex/dist/fonts/KaTeX_Size2-Regular.woff2'),
    'KaTeX_Size3-Regular': require('katex/dist/fonts/KaTeX_Size3-Regular.woff2'),
    'KaTeX_Size4-Regular': require('katex/dist/fonts/KaTeX_Size4-Regular.woff2'),
    'KaTeX_Typewriter-Regular': require('katex/dist/fonts/KaTeX_Typewriter-Regular.woff2')
}

const resolveFontDataUrl = async (module) => {
    const asset = await Asset.fromModule(module).downloadAsync()
    const bytes = await new File(asset.localUri).bytes()
    return `data:font/woff2;base64,${bytesToBase64(bytes)}`
}

export const useKatexFonts = () => {
    const [fonts, setFonts] = useState(null)

    useEffect(() => {
        let cancelled = false
        const entries = Object.entries(KATEX_FONT_MODULES)

        Promise.all(entries.map(([name, module]) => resolveFontDataUrl(module)))
            .then((urls) => {
                if (cancelled) return
                const map = Object.fromEntries(entries.map(([name], index) => [name, urls[index]]))
                setFonts(map)
            })

        return () => { cancelled = true }
    }, [])

    return fonts
}
