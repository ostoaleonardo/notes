import i18n from '@/i18n/i18next'
import { parseBundledKey, readBundledText } from '@/utils/bundled-asset'

import { BUNDLED_CONTENT_KINDS, BUNDLED_MARKDOWN_EXTENSION } from '@/constants/bundled-content'
import { bundledContent } from '@/constants/bundled-context'
import { DEFAULT_LANGUAGE } from '@/constants/languages'

let loaded = { welcome: {}, templates: {} }

const stripExtension = (filename) => filename.slice(0, -BUNDLED_MARKDOWN_EXTENSION.length)

export const loadBundledContent = async () => {
    const next = { welcome: {}, templates: {} }

    await Promise.all(bundledContent.keys().map(async (key) => {
        const { kind, folder, filename } = parseBundledKey(key)
        const text = await readBundledText(bundledContent(key))

        if (kind === BUNDLED_CONTENT_KINDS.WELCOME) {
            next.welcome[stripExtension(filename)] = text
            return
        }

        const [language] = folder
        next.templates[language] = { ...next.templates[language], [stripExtension(filename)]: text }
    }))

    loaded = next
}

export const setBundledContent = (content) => {
    loaded = content
}

const pickLanguage = (available) => {
    const language = (i18n.language || DEFAULT_LANGUAGE).split('-')[0]

    return available[language] ? language : DEFAULT_LANGUAGE
}

export const getBundledWelcome = () => loaded.welcome[pickLanguage(loaded.welcome)]

export const getBundledTemplates = () => loaded.templates[pickLanguage(loaded.templates)] || {}
