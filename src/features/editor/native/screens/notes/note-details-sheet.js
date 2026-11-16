import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ListItem } from '@/ui/list-item'
import { ModalBottomSheet } from '@/ui/modal/modal-bottom-sheet'
import { SheetTitle } from '@/ui/modal/sheet-title'
import { SheetGroup } from '@/ui/modal/sheet-group'
import { Switch } from '@/ui/button/switch'
import { useTheme } from '@/ui/hooks/use-theme'

import { Commit } from '@/icons/commit'
import { FormatListBulleted } from '@/icons/format-list-bulleted'
import { Link } from '@/icons/link'
import { OpenInNew } from '@/icons/open-in-new'

import { ANIMATION_DURATION } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

const DetailRow = memo(({
    title,
    icon,
    onPress,
    testID,
    rightContent
}) => {
    const { colors } = useTheme()

    return (
        <ListItem
            uppercase={false}
            background={colors.surfaceVariant}
            title={title}
            onPress={onPress}
            rightContent={rightContent}
            leadingIcon={icon}
            testID={testID}
        />
    )
})

export const NoteDetailsSheet = memo(({
    sheet,
    hasSlug,
    showBacklinks,
    onOpenOutline,
    onOpenOutgoingLinks,
    onOpenVersionHistory,
    onToggleShowBacklinks
}) => {
    const { t } = useTranslation()

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

            <SheetGroup>
                <DetailRow
                    title={t('title.outline')}
                    testID={TEST_IDS.DETAILS_OUTLINE}
                    icon={FormatListBulleted}
                    onPress={run(onOpenOutline)}
                />
                <DetailRow
                    title={t('title.outgoing_links')}
                    testID={TEST_IDS.DETAILS_OUTGOING_LINKS}
                    icon={OpenInNew}
                    onPress={run(onOpenOutgoingLinks)}
                />
                {hasSlug && (
                    <DetailRow
                        title={t('button.show_backlinks')}
                        testID={TEST_IDS.DETAILS_BACKLINKS}
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
                    testID={TEST_IDS.DETAILS_VERSION_HISTORY}
                    icon={Commit}
                    onPress={run(onOpenVersionHistory)}
                />
            </SheetGroup>
        </ModalBottomSheet>
    )
})
