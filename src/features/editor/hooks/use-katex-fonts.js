import { createAssetFontsLoader } from './use-asset-fonts'

import { KATEX_FONT_MODULES } from '@/features/editor/constants/katex-font-modules'
import { MIME_TYPES } from '@/constants/mime-types'

export const loadKatexFonts = createAssetFontsLoader(KATEX_FONT_MODULES, MIME_TYPES.FONT_WOFF2)
