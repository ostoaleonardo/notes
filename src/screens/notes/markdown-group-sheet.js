import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ModalBottomSheet } from '@/ui/modal/modal-bottom-sheet'
import { SheetTitle } from '@/ui/modal/sheet-title'
import { ListItem } from '@/ui/list-item'
import { PositionGroup } from '@/ui/position-group'
import { useSheetBottomSpacing } from '@/ui/hooks/use-sheet-bottom-spacing'
import { useTheme } from '@/ui/hooks/use-theme'

import { MARKDOWN_GROUPS } from '@/constants/markdown-controls'
import { SPACING } from '@/constants/theme'

const GroupItem = memo(function GroupItem({ action, Icon, onSelect }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <ListItem
            uppercase={false}
            background={colors.surfaceVariant}
            title={t(`markdown_action.${action}`)}
            leftContent={<Icon color={colors.onBackground} />}
            onPress={() => onSelect(action)}
        />
    )
})

export const MarkdownGroupSheet = memo(function MarkdownGroupSheet({ sheet, group, onSelect }) {
    const { t } = useTranslation()
    const items = MARKDOWN_GROUPS[group]?.items
    const bottom = useSheetBottomSpacing()

    return (
        <ModalBottomSheet
            enableDynamicSizing
            ref={sheet.ref}
        >
            {group && <SheetTitle>{t(`markdown_group.${group}`)}</SheetTitle>}

            <View style={[styles.list, { paddingBottom: bottom }]}>
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
        paddingHorizontal: SPACING.lg
    }
})
