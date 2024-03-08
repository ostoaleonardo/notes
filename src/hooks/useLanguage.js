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

    const changeLanguage = (lan) => {
        i18next.changeLanguage(lan)
        saveLanguageToStorage(lan)
    }

    const initLanguage = () => {
        AsyncStorage.getItem('userLanguage')
            .then((lan) => {
                if (lan) {
                    i18next.changeLanguage(lan)
                } else {
                    i18next.changeLanguage(deviceLanguage)
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
