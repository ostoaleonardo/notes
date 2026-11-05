import { DEFAULT_LANGUAGE, LANGUAGES } from '@/constants/languages'

const SUPPORTED_LANGUAGES = LANGUAGES.map(({ code }) => code)

export const isSupportedLanguage = (code) => SUPPORTED_LANGUAGES.includes(code)

export const getSystemLanguage = (locales) => {
    const code = locales?.[0]?.languageCode

    return isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE
}

export const resolveLanguage = (selected, systemLanguage) => (
    isSupportedLanguage(selected) ? selected : systemLanguage
)
