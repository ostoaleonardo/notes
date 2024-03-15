import { useEffect, useState } from 'react'
import { getLocales } from 'expo-localization'
import i18next from '@/i18n/i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function useLanguage() {
    const [deviceLanguage, setDeviceLanguage] = useState('')
    const currentLanguage = i18next.language

    useEffect(() => {
        const locales = getLocales()
        const { languageCode } = locales[0]

        setDeviceLanguage(languageCode)
    }, [])

    const getLanguage = (languageCode) => {
        const supportedLanguages = ['en', 'es']

        if (supportedLanguages.includes(languageCode)) {
            return languageCode
        } else {
            return 'en'
        }
    }

    const changeLanguage = (lan) => {
        i18next.changeLanguage(lan)
        saveLanguageToStorage(lan)
    }

    const initLanguage = () => {
        AsyncStorage.getItem('userLanguage')
            .then((lan) => {
                if (lan) {
                    changeLanguage(lan)
                } else {
                    const lan = getLanguage(deviceLanguage)
                    changeLanguage(lan)
                }
            })
    }

    const saveLanguageToStorage = (lan) => {
        AsyncStorage.setItem('userLanguage', lan)
    }

    return {
        currentLanguage,
        deviceLanguage,
        initLanguage,
        changeLanguage
    }
}
