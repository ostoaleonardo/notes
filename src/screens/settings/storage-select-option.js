import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SelectOption } from './select-option'

import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'

export function StorageSelectOption({
    storageKey,
    translationKey,
    values,
    defaultValue,
    translateValues = true
}) {
    const { t } = useTranslation()
    const { setItem } = useStorage()

    const [current, setCurrent] = useState(defaultValue)

    useStorageEffect(storageKey, (value) => {
        if (values.includes(value)) setCurrent(value)
    })

    const getValueLabel = useCallback(
        (value) => translateValues ? t(`${translationKey}.${value}`) : String(value),
        [translateValues, translationKey, t]
    )

    const items = useMemo(() => values.map((value) => ({
        value,
        title: getValueLabel(value)
    })), [values, getValueLabel])

    const onSelect = (value) => {
        setCurrent(value)
        setItem(storageKey, value)
    }

    return (
        <SelectOption
            title={t(`${translationKey}.title`)}
            description={getValueLabel(current)}
            items={items}
            selectedValue={current}
            onSelect={onSelect}
        />
    )
}
