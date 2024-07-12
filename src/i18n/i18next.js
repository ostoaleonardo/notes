import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import de from '@/translations/de.json'
import en from '@/translations/en.json'
import es from '@/translations/es.json'
import nl from '@/translations/nl.json'

const languageResources = {
    de: { translation: de },
    en: { translation: en },
    es: { translation: es },
    nl: { translation: nl }
}

i18next.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    resources: languageResources
})

export default i18next
