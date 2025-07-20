import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from '@/translations/ar.json'
import cs from '@/translations/cs.json'
import de from '@/translations/de.json'
import en from '@/translations/en.json'
import es from '@/translations/es.json'
import fr from '@/translations/fr.json'
import it from '@/translations/it.json'
import ja from '@/translations/ja.json'
import ko from '@/translations/ko.json'
import nl from '@/translations/nl.json'
import pt from '@/translations/pt.json'
import ru from '@/translations/ru.json'
import sv from '@/translations/sv.json'
import tr from '@/translations/tr.json'
import uk from '@/translations/uk.json'

const languageResources = {
    ar: { translation: ar },
    cs: { translation: cs },
    de: { translation: de },
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    it: { translation: it },
    ja: { translation: ja },
    ko: { translation: ko },
    nl: { translation: nl },
    pt: { translation: pt },
    ru: { translation: ru },
    sv: { translation: sv },
    tr: { translation: tr },
    uk: { translation: uk }
}

i18next.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    resources: languageResources
})

export default i18next
