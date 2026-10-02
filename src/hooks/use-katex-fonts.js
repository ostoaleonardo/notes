import { createAssetFontsHook } from './use-asset-fonts'

import { KATEX_FONT_MODULES } from '@/constants/katex-font-modules'
import { MIME_TYPES } from '@/constants/mime-types'

export const useKatexFonts = createAssetFontsHook(KATEX_FONT_MODULES, MIME_TYPES.FONT_WOFF2)
