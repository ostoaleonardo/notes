import { createAssetFontsLoader } from './use-asset-fonts'

import { KATEX_FONT_MODULES } from '@/features/editor/native/constants/katex-font-modules'
import { MIME_TYPES } from '@/shared/constants/mime-types'

export const loadKatexFonts = createAssetFontsLoader(KATEX_FONT_MODULES, MIME_TYPES.FONT_WOFF2)
