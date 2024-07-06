import i18next from '@/i18n/i18next'
import { getLocales } from 'expo-localization'
import { useStorage } from './useStorage'
import { STORAGE_KEYS } from '@/constants'

const SUPPORTED_LANGUAGES = ['en', 'es']

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
        setItem(STORAGE_KEYS.USER_LANGUAGE, lan)
    }

    const initLanguage = async () => {
        (async () => {
            const userLanguage = await getItem(STORAGE_KEYS.USER_LANGUAGE)
            const defaultLanguage = getLanguage()

            changeLanguage(userLanguage || defaultLanguage)
        })()
    }

    return {
        currentLanguage,
        initLanguage,
        changeLanguage
    }
}
