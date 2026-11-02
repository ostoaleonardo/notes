import { useEffect, useState } from 'react'
import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'

import { logError } from '@/utils/log-error'

import { LOG_MESSAGES } from '@/constants/log-messages'

const NO_FONTS = {}

const resolveFontDataUrl = async (module, mimeType) => {
    const asset = await Asset.fromModule(module).downloadAsync()
    const base64 = await new File(asset.localUri).base64()
    return `data:${mimeType};base64,${base64}`
}

export const createAssetFontsHook = (fontModules, mimeType) => {
    let fontsPromise = null

    const loadFonts = () => {
        if (!fontsPromise) {
            const entries = Object.entries(fontModules)

            fontsPromise = Promise.all(entries.map(([, module]) => resolveFontDataUrl(module, mimeType)))
                .then((urls) => Object.fromEntries(entries.map(([name], index) => [name, urls[index]])))
                .catch((error) => {
                    fontsPromise = null
                    logError(LOG_MESSAGES.ERROR_LOADING_EDITOR_FONTS, error)
                    return NO_FONTS
                })
        }

        return fontsPromise
    }

    return function useAssetFonts(enabled = true) {
        const [fonts, setFonts] = useState(null)

        useEffect(() => {
            if (!enabled) return undefined

            let cancelled = false

            loadFonts().then((resolvedFonts) => {
                if (!cancelled) setFonts(resolvedFonts)
            })

            return () => { cancelled = true }
        }, [enabled])

        return fonts
    }
}
