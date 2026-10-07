import { memo } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { MenuContainer } from '@/components/menu/menu-container'
import { MenuItem } from '@/components/menu/menu-item'
import { Typography } from '@/components/typography'

import { useMenuAction } from '@/hooks/use-menu-action'

import { Check } from '@/icons/check'
import { KeyboardArrowDown } from '@/icons/keyboard-arrow-down'
import { KeyboardArrowUp } from '@/icons/keyboard-arrow-up'

import { BUTTON } from '@/constants/components'
import { DRAWER_VIEWS, DRAWER_VIEW_LABELS } from '@/constants/drawer-views'
import { TRANSPARENT } from '@/constants/themes'
import { RADIUS, SPACING, ICON_SIZE, OPACITY } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

const VIEW_OPTIONS = Object.values(DRAWER_VIEWS)

export const DrawerViewSwitcher = memo(function DrawerViewSwitcher({ view, onChange }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { visible, onOpen, onClose, trigger } = useMenuAction()
    const Chevron = visible ? KeyboardArrowDown : KeyboardArrowUp

    return (
        <MenuContainer
            visible={visible}
            onClose={onClose}
            anchor={(
                <Pressable
                    accessibilityRole='button'
                    onPress={onOpen}
                    testID={TEST_IDS.DRAWER_VIEW_SWITCHER}
                    accessibilityLabel={t('drawer.change_view')}
                    style={({ pressed }) => [
                        styles.pill,
                        {
                            opacity: pressed ? OPACITY.pressed : 1,
                            backgroundColor: colors.onBackground + TRANSPARENT[10]
                        }
                    ]}
                >
                    <Typography
                        bold={true}
                        uppercase={true}
                    >
                        {t(DRAWER_VIEW_LABELS[view])}
                    </Typography>
                    <Chevron
                        width={ICON_SIZE.md}
                        height={ICON_SIZE.md}
                        color={colors.onBackground}
                    />
                </Pressable>
            )}
        >
            {VIEW_OPTIONS.map((option) => (
                <MenuItem
                    key={option}
                    title={t(DRAWER_VIEW_LABELS[option])}
                    trailingIcon={option === view
                        ? (props) => <Check {...props} />
                        : undefined}
                    onPress={() => trigger(() => onChange(option))}
                />
            ))}
        </MenuContainer>
    )
})

const styles = StyleSheet.create({
    pill: {
        gap: SPACING.sm,
        height: BUTTON.size,
        paddingStart: SPACING.lg,
        paddingEnd: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: RADIUS.xl
    }
})
