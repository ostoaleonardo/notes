import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { Option } from './option'
import { MenuContainer } from '@/components/menu/menu-container'
import { MenuItem } from '@/components/menu/menu-item'

import { useMenuAnchor } from '@/hooks/use-menu-anchor'
import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'

import { ArrowForward } from '@/icons/arrow-forward'
import { Check } from '@/icons/check'

import { TRANSPARENT } from '@/constants/themes'
import { SPACING } from '@/constants/spacing'

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
                        <MenuItem
                            key={value}
                            contentStyle={styles.item}
                            title={t(`settings.${translationKey}_${value}`)}
                            trailingIcon={selected ? (props) => <Check {...props} color={colors.tertiary} /> : undefined}
                            style={selected && { backgroundColor: colors.tertiary + TRANSPARENT[10] }}
                            onPress={() => menu.trigger(() => onSelect(value))}
                        />
                    )
                })}
            </MenuContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    item: {
        flexGrow: 1,
        marginRight: SPACING.md
    }
})
