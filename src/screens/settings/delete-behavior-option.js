import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { Option } from './option'
import { MenuContainer } from '@/components/menu/menu-container'
import { SelectMenuItem } from '@/components/menu/select-menu-item'

import { useMenuAnchor } from '@/hooks/use-menu-anchor'
import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'

import { ArrowForward } from '@/icons/arrow-forward'

import { DEFAULT_DELETE_BEHAVIOR, DELETE_BEHAVIORS } from '@/constants/delete-behavior'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const OPTIONS = Object.values(DELETE_BEHAVIORS)

export function DeleteBehaviorOption() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { setItem } = useStorage()
    const menu = useMenuAnchor()
    const [behavior, setBehavior] = useState(DEFAULT_DELETE_BEHAVIOR)

    useStorageEffect(STORAGE_KEYS.DELETE_BEHAVIOR, (value) => {
        if (value) setBehavior(value)
    })

    const onSelect = (value) => {
        setBehavior(value)
        setItem(STORAGE_KEYS.DELETE_BEHAVIOR, value)
    }

    return (
        <View style={styles.group}>
            <View ref={menu.rowRef} collapsable={false}>
                <Option
                    title={t('settings.delete_behavior')}
                    description={t(`settings.delete_behavior_${behavior}`)}
                    rightContent={<ArrowForward color={colors.onBackground} />}
                    onPress={menu.onPressRow}
                    isFirst={true}
                    isLast={true}
                />
            </View>

            <MenuContainer
                visible={menu.visible}
                onClose={menu.onClose}
                anchor={menu.anchor}
            >
                {OPTIONS.map((value) => {
                    const selected = value === behavior

                    return (
                        <SelectMenuItem
                            key={value}
                            title={t(`settings.delete_behavior_${value}`)}
                            selected={selected}
                            onPress={() => menu.trigger(() => onSelect(value))}
                        />
                    )
                })}
            </MenuContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    group: {
        gap: 3
    }
})
