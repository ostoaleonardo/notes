import { createAssetFontsHook } from './use-asset-fonts'

const FONT_MODULES = {
    body: require('../../assets/fonts/AzeretMono-Light.ttf'),
    bodyBold: require('../../assets/fonts/AzeretMono-Medium.ttf'),
    bodyItalic: require('../../assets/fonts/AzeretMono-Italic.ttf'),
    heading: require('../../assets/fonts/NType82-Headline.ttf')
}

export const useDomFonts = createAssetFontsHook(FONT_MODULES, 'font/ttf')
