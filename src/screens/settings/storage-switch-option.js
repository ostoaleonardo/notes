import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ListItem } from '../../ui/list-item'
import { Switch } from '@/ui/button/switch'

import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'

import { EDITOR_TOGGLE } from '@/constants/editor-display'

const ON = 'on'
const OFF = 'off'

export const StorageSwitchOption = ({
    storageKey,
    translationKey,
    defaultValue
}) => {
    const { t } = useTranslation()
    const { setItem } = useStorage()

    const [enabled, setEnabled] = useState(EDITOR_TOGGLE[defaultValue])

    useStorageEffect(storageKey, (value) => {
        if (value in EDITOR_TOGGLE) setEnabled(EDITOR_TOGGLE[value])
    })

    const onToggle = (value) => {
        setEnabled(value)
        setItem(storageKey, value ? ON : OFF)
    }

    const title = t(`${translationKey}.title`)

    return (
        <ListItem
            title={title}
            rightContent={(
                <Switch
                    value={enabled}
                    onValueChange={onToggle}
                    accessibilityLabel={title}
                />
            )}
        />
    )
}
