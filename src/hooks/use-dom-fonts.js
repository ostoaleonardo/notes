import { useEffect, useState } from 'react'
import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'
import { bytesToBase64 } from '@/utils'

const FONT_MODULES = {
    body: require('../../assets/fonts/AzeretMono-Light.ttf'),
    bodyBold: require('../../assets/fonts/AzeretMono-Medium.ttf'),
    bodyItalic: require('../../assets/fonts/AzeretMono-Italic.ttf'),
    heading: require('../../assets/fonts/NType82-Headline.ttf')
}

const resolveFontDataUrl = async (module) => {
    const asset = await Asset.fromModule(module).downloadAsync()
    const bytes = await new File(asset.localUri).bytes()
    return `data:font/ttf;base64,${bytesToBase64(bytes)}`
}

export const useDomFonts = () => {
    const [fonts, setFonts] = useState(null)

    useEffect(() => {
        let cancelled = false

        Promise.all([
            resolveFontDataUrl(FONT_MODULES.body),
            resolveFontDataUrl(FONT_MODULES.bodyBold),
            resolveFontDataUrl(FONT_MODULES.bodyItalic),
            resolveFontDataUrl(FONT_MODULES.heading)
        ]).then(([body, bodyBold, bodyItalic, heading]) => {
            if (!cancelled) setFonts({ body, bodyBold, bodyItalic, heading })
        })

        return () => { cancelled = true }
    }, [])

    return fonts
}
