import { useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { Option } from './option'
import { MenuContainer } from '@/components/menu/menu-container'
import { SelectMenuItem } from '@/components/menu/select-menu-item'

import { useMenuAnchor } from '@/hooks/use-menu-anchor'
import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'

import { ArrowForward } from '@/icons/arrow-forward'


export function EditorDisplayOption({
    storageKey,
    translationKey,
    options,
    defaultValue,
    isFirst,
    isLast
}) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { setItem } = useStorage()

    const menu = useMenuAnchor()

    const [current, setCurrent] = useState(defaultValue)

    useStorageEffect(storageKey, (value) => {
        if (value in options) setCurrent(value)
    })

    const onSelect = (value) => {
        setCurrent(value)
        setItem(storageKey, value)
    }

    return (
        <View>
            <View ref={menu.rowRef} collapsable={false}>
                <Option
                    title={t(`settings.${translationKey}`)}
                    description={t(`settings.${translationKey}_${current}`)}
                    rightContent={<ArrowForward color={colors.onBackground} />}
                    onPress={menu.onPressRow}
                    isFirst={isFirst}
                    isLast={isLast}
                />
            </View>

            <MenuContainer
                visible={menu.visible}
                onClose={menu.onClose}
                anchor={menu.anchor}
            >
                {Object.keys(options).map((value) => {
                    const selected = value === current

                    return (
                        <SelectMenuItem
                            key={value}
                            title={t(`settings.${translationKey}_${value}`)}
                            selected={selected}
                            onPress={() => menu.trigger(() => onSelect(value))}
                        />
                    )
                })}
            </MenuContainer>
        </View>
    )
}
