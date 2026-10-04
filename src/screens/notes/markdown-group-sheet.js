import { memo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'react-native-paper'

import { MenuGroup } from '@/components/menu/menu-group'
import { ModalSheet } from '@/components/modal/modal-sheet'
import { Typography } from '@/components/typography'

import { MARKDOWN_GROUPS } from '@/constants/markdown-controls'
import { SPACING } from '@/constants/spacing'
import { TRANSPARENT } from '@/constants/themes'

const GroupItem = memo(function GroupItem({ action, Icon, onSelect }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <Pressable
            accessibilityRole='button'
            onPress={() => onSelect(action)}
            android_ripple={{ color: colors.onBackground + TRANSPARENT[10] }}
            style={styles.item}
        >
            <Icon color={colors.onBackground} />
            <Typography>{t(`markdown_action.${action}`)}</Typography>
        </Pressable>
    )
})

export const MarkdownGroupSheet = memo(function MarkdownGroupSheet({ sheet, group, onSelect }) {
    const { colors } = useTheme()
    const items = MARKDOWN_GROUPS[group]?.items

    return (
        <ModalSheet
            enableDynamicSizing
            ref={sheet.ref}
            onClose={sheet.onClose}
        >
            <View style={styles.list}>
                {items?.map(({ action, Icon }, index) => (
                    <MenuGroup
                        key={action}
                        color={colors.surfaceVariant}
                        first={index === 0}
                        last={index === items.length - 1}
                    >
                        <GroupItem
                            action={action}
                            Icon={Icon}
                            onSelect={onSelect}
                        />
                    </MenuGroup>
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
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg
    }
})
