import { memo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'
import Animated from 'react-native-reanimated'

import { ModalSheet } from '@/components/modal/modal-sheet'
import { Typography } from '@/components/typography'

import { useGroupedCornerStyle } from '@/hooks/use-grouped-corner-style'

import { MARKDOWN_GROUPS } from '@/constants/markdown-controls'
import { SPACING } from '@/constants/spacing'
import { TRANSPARENT } from '@/constants/themes'

const GroupItem = memo(function GroupItem({ action, Icon, first, last, onSelect }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const [pressed, setPressed] = useState(false)
    const cornerStyle = useGroupedCornerStyle(first, last, pressed)

    return (
        <Animated.View style={[styles.card, { backgroundColor: colors.surfaceVariant }, cornerStyle]}>
            <Pressable
                accessibilityRole='button'
                onPress={() => onSelect(action)}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
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
    const items = MARKDOWN_GROUPS[group]?.items

    return (
        <ModalSheet
            enableDynamicSizing
            ref={sheet.ref}
            onClose={sheet.onClose}
        >
            <View style={styles.list}>
                {items?.map(({ action, Icon }, index) => (
                    <GroupItem
                        key={action}
                        action={action}
                        Icon={Icon}
                        first={index === 0}
                        last={index === items.length - 1}
                        onSelect={onSelect}
                    />
                ))}
            </View>
        </ModalSheet>
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
