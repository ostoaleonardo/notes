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

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { STARTUP_BEHAVIORS } from '@/constants/startup-behavior'

const OPTIONS = Object.values(STARTUP_BEHAVIORS)

export function StartupOption() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { setItem } = useStorage()

    const behaviorMenu = useMenuAnchor()

    const [behavior, setBehavior] = useState(STARTUP_BEHAVIORS.LAST_OPENED)

    useStorageEffect(STORAGE_KEYS.STARTUP_BEHAVIOR, (value) => {
        if (value) setBehavior(value)
    })

    const onSelectBehavior = (value) => {
        setBehavior(value)
        setItem(STORAGE_KEYS.STARTUP_BEHAVIOR, value)
    }

    return (
        <View>
            <View ref={behaviorMenu.rowRef} collapsable={false}>
                <Option
                    title={t('settings.startup_behavior')}
                    description={t(`settings.startup_behavior_${behavior}`)}
                    rightContent={<ArrowForward color={colors.onBackground} />}
                    onPress={behaviorMenu.onPressRow}
                    isFirst={true}
                    isLast={false}
                />
            </View>

            <MenuContainer
                visible={behaviorMenu.visible}
                onClose={behaviorMenu.onClose}
                anchor={behaviorMenu.anchor}
            >
                {OPTIONS.map((value) => {
                    const selected = value === behavior

                    return (
                        <SelectMenuItem
                            key={value}
                            title={t(`settings.startup_behavior_${value}`)}
                            selected={selected}
                            onPress={() => behaviorMenu.trigger(() => onSelectBehavior(value))}
                        />
                    )
                })}
            </MenuContainer>
        </View>
    )
}
