import { createAssetFontsHook } from './use-asset-fonts'

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

export const useKatexFonts = createAssetFontsHook(KATEX_FONT_MODULES, 'font/woff2')
