import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SelectOption } from './select-option'

import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'

export function StorageSelectOption({
    storageKey,
    translationKey,
    values,
    defaultValue,
    isFirst,
    isLast
}) {
    const { t } = useTranslation()
    const { setItem } = useStorage()

    const [current, setCurrent] = useState(defaultValue)

    useStorageEffect(storageKey, (value) => {
        if (values.includes(value)) setCurrent(value)
    })

    const items = useMemo(() => values.map((value) => ({
        value,
        title: t(`settings.${translationKey}_${value}`)
    })), [values, translationKey, t])

    const onSelect = (value) => {
        setCurrent(value)
        setItem(storageKey, value)
    }

    return (
        <SelectOption
            title={t(`settings.${translationKey}`)}
            description={t(`settings.${translationKey}_${current}`)}
            items={items}
            selectedValue={current}
            onSelect={onSelect}
            isFirst={isFirst}
            isLast={isLast}
        />
    )
}
