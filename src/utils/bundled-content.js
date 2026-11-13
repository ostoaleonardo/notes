import i18n from '@/i18n/i18next'
import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'

import { BUNDLED_TEMPLATES, BUNDLED_WELCOME } from '@/constants/bundled-content'
import { DEFAULT_LANGUAGE } from '@/constants/languages'

let loaded = { welcome: {}, templates: {} }

const readText = async (module) => {
    const asset = Asset.fromModule(module)
    await asset.downloadAsync()

    return new File(asset.localUri).text()
}

const readEntries = async (entries) => Object.fromEntries(
    await Promise.all(Object.entries(entries).map(async ([key, module]) => [key, await readText(module)]))
)

export const loadBundledContent = async () => {
    const languages = Object.keys(BUNDLED_WELCOME)

    const welcome = await readEntries(BUNDLED_WELCOME)
    const templates = Object.fromEntries(await Promise.all(
        languages.map(async (language) => [language, await readEntries(BUNDLED_TEMPLATES[language])])
    ))

    loaded = { welcome, templates }
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
