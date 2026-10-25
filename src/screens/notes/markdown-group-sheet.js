import { memo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'
import Animated from 'react-native-reanimated'

import { ModalBottomSheet } from '@/components/modal/modal-bottom-sheet'
import { SheetTitle } from '@/components/modal/sheet-title'
import { PositionGroup } from '@/components/position-group'
import { Typography } from '@/components/typography'

import { useGroupCornerStyle } from '@/hooks/use-group-corner-style'
import { usePressed } from '@/hooks/use-pressed'

import { GROUP_AXES } from '@/utils/group-position'

import { MARKDOWN_GROUPS } from '@/constants/markdown-controls'
import { SPACING } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

const GroupItem = memo(function GroupItem({ action, Icon, onSelect }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { pressed, onPressIn, onPressOut } = usePressed()
    const cornerStyle = useGroupCornerStyle(GROUP_AXES.STACKED, pressed)

    return (
        <Animated.View style={[styles.card, { backgroundColor: colors.surfaceVariant }, cornerStyle]}>
            <Pressable
                accessibilityRole='button'
                onPress={() => onSelect(action)}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                android_ripple={{ color: colors.onBackground + TRANSPARENT[10] }}
                style={styles.item}
            >
                <Icon color={colors.onBackground} />
                <Typography>{t(`markdown_action.${action}`)}</Typography>
            </Pressable>
        </Animated.View>
    )
})

export const MarkdownGroupSheet = memo(function MarkdownGroupSheet({ sheet, group, onSelect }) {
    const { t } = useTranslation()
    const items = MARKDOWN_GROUPS[group]?.items

    return (
        <ModalBottomSheet
            enableDynamicSizing
            ref={sheet.ref}
            onClose={sheet.onClose}
        >
            {group && <SheetTitle>{t(`markdown_group.${group}`)}</SheetTitle>}

            <View style={styles.list}>
                <PositionGroup>
                    {items?.map(({ action, Icon }) => (
                        <GroupItem
                            key={action}
                            action={action}
                            Icon={Icon}
                            onSelect={onSelect}
                        />
                    ))}
                </PositionGroup>
            </View>
        </ModalBottomSheet>
    )
})

const styles = StyleSheet.create({
    list: {
        gap: SPACING.xxs,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg
    },
    card: {
        overflow: 'hidden'
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg
    }
})
