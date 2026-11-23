import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SelectOption } from './select-option'

import { useStorage } from '@/shared/hooks/use-storage'
import { useStorageEffect } from '@/shared/hooks/use-storage-effect'
import { getSettingTestId } from '@/features/settings/utils/test-ids'

export const StorageSelectOption = ({
    storageKey,
    translationKey,
    values,
    defaultValue,
    translateValues = true,
    countLabel = false,
    zeroValue = null
}) => {
    const { t } = useTranslation()
    const { setItem } = useStorage()

    const [current, setCurrent] = useState(defaultValue)

    useStorageEffect(storageKey, (value) => {
        if (values.includes(value)) setCurrent(value)
    })

    const getValueLabel = useCallback((value) => {
        if (value === zeroValue) return t(`${translationKey}.zero`)
        if (countLabel) return t(`${translationKey}.value`, { count: Number(value) })

        return translateValues ? t(`${translationKey}.${value}`) : String(value)
    }, [translateValues, countLabel, zeroValue, translationKey, t])

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
            testID={getSettingTestId(storageKey)}
        />
    )
}
