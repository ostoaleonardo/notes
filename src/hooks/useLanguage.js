import i18next from '@/i18n/i18next'
import { getLocales } from 'expo-localization'
import { useStorage } from './useStorage'
import { LANGUAGES, STORAGE_KEYS } from '@/constants'

const SUPPORTED_LANGUAGES = LANGUAGES.map(({ code }) => code)

export function useLanguage() {
    const { setItem, getItem } = useStorage()
    const currentLanguage = i18next.language

    const getLanguage = () => {
        const locales = getLocales()
        const { languageCode } = locales[0]

        return SUPPORTED_LANGUAGES.includes(languageCode) ? languageCode : 'en'
    }

    const changeLanguage = (lan) => {
        i18next.changeLanguage(lan)
        setItem(STORAGE_KEYS.LANGUAGE, lan)
    }

    const initLanguage = async () => {
        const userLanguage = await getItem(STORAGE_KEYS.LANGUAGE)
        const defaultLanguage = getLanguage()

        changeLanguage(userLanguage || defaultLanguage)
    }

    return {
        currentLanguage,
        initLanguage,
        changeLanguage
    }
}
