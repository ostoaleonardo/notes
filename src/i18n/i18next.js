import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import de from '@/translations/de.json'
import en from '@/translations/en.json'
import es from '@/translations/es.json'
import it from '@/translations/it.json'
import ja from '@/translations/ja.json'
import nl from '@/translations/nl.json'
import ru from '@/translations/ru.json'

const languageResources = {
    de: { translation: de },
    en: { translation: en },
    es: { translation: es },
    it: { translation: it },
    ja: { translation: ja },
    nl: { translation: nl },
    ru: { translation: ru }
}

i18next.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    resources: languageResources
})

export default i18next
