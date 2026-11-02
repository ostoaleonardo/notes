import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ListItem } from '@/ui/list-item'
import { ModalBottomSheet } from '@/ui/modal/modal-bottom-sheet'
import { SheetTitle } from '@/ui/modal/sheet-title'
import { PositionGroup } from '@/ui/position-group'
import { Switch } from '@/ui/button/switch'
import { useSheetBottomSpacing } from '@/ui/hooks/use-sheet-bottom-spacing'
import { useTheme } from '@/ui/hooks/use-theme'

import { Commit } from '@/icons/commit'
import { FormatListBulleted } from '@/icons/format-list-bulleted'
import { Link } from '@/icons/link'
import { OpenInNew } from '@/icons/open-in-new'

import { ANIMATION_DURATION, SPACING } from '@/constants/theme'

const DetailRow = memo(function DetailRow({ title, icon, onPress, rightContent }) {
    const { colors } = useTheme()

    return (
        <ListItem
            uppercase={false}
            background={colors.surfaceVariant}
            title={title}
            onPress={onPress}
            rightContent={rightContent}
            leadingIcon={icon}
        />
    )
})

export const NoteDetailsSheet = memo(function NoteDetailsSheet({
    sheet,
    hasSlug,
    showBacklinks,
    onOpenOutline,
    onOpenOutgoingLinks,
    onOpenVersionHistory,
    onToggleShowBacklinks
}) {
    const { t } = useTranslation()
    const bottom = useSheetBottomSpacing()

    const run = useCallback((action) => () => {
        sheet.onClose()
        setTimeout(action, ANIMATION_DURATION)
    }, [sheet])

    return (
        <ModalBottomSheet
            enableDynamicSizing
            ref={sheet.ref}
        >
            <SheetTitle>{t('title.details')}</SheetTitle>

            <View style={[styles.list, { paddingBottom: bottom }]}>
                <PositionGroup>
                    <DetailRow
                        title={t('title.outline')}
                        icon={FormatListBulleted}
                        onPress={run(onOpenOutline)}
                    />
                    <DetailRow
                        title={t('title.outgoing_links')}
                        icon={OpenInNew}
                        onPress={run(onOpenOutgoingLinks)}
                    />
                    {hasSlug && (
                        <DetailRow
                            title={t('button.show_backlinks')}
                            icon={Link}
                            onPress={onToggleShowBacklinks}
                            rightContent={(
                                <Switch
                                    value={showBacklinks}
                                    onValueChange={onToggleShowBacklinks}
                                    accessibilityLabel={t('button.show_backlinks')}
                                />
                            )}
                        />
                    )}
                    <DetailRow
                        title={t('title.version_history')}
                        icon={Commit}
                        onPress={run(onOpenVersionHistory)}
                    />
                </PositionGroup>
            </View>
        </ModalBottomSheet>
    )
})

const styles = StyleSheet.create({
    list: {
        gap: SPACING.xxxs,
        paddingHorizontal: SPACING.lg
    }
})
