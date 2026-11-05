import { getLocales } from 'expo-localization'

import { useStorage } from './use-storage'
import i18next from '@/i18n/i18next'
import { getSystemLanguage, isSupportedLanguage, resolveLanguage } from '@/utils/language'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useLanguage() {
    const { setItem, getItem } = useStorage()
    const currentLanguage = i18next.language

    const applyLanguage = (selected) => {
        i18next.changeLanguage(resolveLanguage(selected, getSystemLanguage(getLocales())))
    }

    const changeLanguage = (selected) => {
        applyLanguage(selected)
        setItem(STORAGE_KEYS.LANGUAGE, selected)
    }

    const initLanguage = async () => {
        applyLanguage(await getItem(STORAGE_KEYS.LANGUAGE))
    }

    const syncSystemLanguage = async () => {
        const selected = await getItem(STORAGE_KEYS.LANGUAGE)

        if (!isSupportedLanguage(selected)) applyLanguage(selected)
    }

    return {
        currentLanguage,
        initLanguage,
        changeLanguage,
        syncSystemLanguage
    }
}
