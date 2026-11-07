import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SelectOption } from './select-option'

import { useLanguage } from '@/hooks/use-language'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { isSupportedLanguage } from '@/utils/language'

import { LANGUAGES, SYSTEM_LANGUAGE } from '@/constants/languages'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { getSettingTestId } from '@/utils/test-ids'

export const LanguageOption = () => {
    const { t } = useTranslation()
    const { changeLanguage } = useLanguage()
    const [selected, setSelected] = useState(SYSTEM_LANGUAGE)

    useStorageEffect(STORAGE_KEYS.LANGUAGE, (value) => {
        setSelected(isSupportedLanguage(value) ? value : SYSTEM_LANGUAGE)
    })

    const items = useMemo(() => [
        { value: SYSTEM_LANGUAGE, title: t('settings.general.language_system') },
        ...LANGUAGES.map(({ code, name }) => ({ value: code, title: name }))
    ], [t])

    const onSelect = (value) => {
        setSelected(value)
        changeLanguage(value)
    }

    const description = selected === SYSTEM_LANGUAGE
        ? `${t('settings.general.language_system')} (${t('language')})`
        : t('language')

    return (
        <SelectOption
            title={t('settings.general.language')}
            description={description}
            items={items}
            selectedValue={selected}
            onSelect={onSelect}
            testID={getSettingTestId(STORAGE_KEYS.LANGUAGE)}
        />
    )
}
