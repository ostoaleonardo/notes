import { createAssetFontsHook } from './use-asset-fonts'

import { FONT_MODULES } from '@/constants/dom-fonts'
import { MIME_TYPES } from '@/constants/mime-types'

export const useDomFonts = createAssetFontsHook(FONT_MODULES, MIME_TYPES.FONT_TTF)
