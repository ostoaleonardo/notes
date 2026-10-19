import { useTranslation } from 'react-i18next'

import { SelectOption } from './select-option'

import { useLanguage } from '@/hooks/use-language'

import { LANGUAGES } from '@/constants/languages'

const LANGUAGE_ITEMS = LANGUAGES.map(({ code, name }) => ({ value: code, title: name }))

export function LanguageOption() {
    const { t } = useTranslation()
    const { currentLanguage, changeLanguage } = useLanguage()

    return (
        <SelectOption
            title={t('settings.general.language')}
            description={t('language')}
            items={LANGUAGE_ITEMS}
            selectedValue={currentLanguage}
            onSelect={changeLanguage}
        />
    )
}
