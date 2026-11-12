import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ListItem } from '@/ui/list-item'
import { FreshSheet } from '@/ui/modal/fresh-sheet'
import { SheetGroup } from '@/ui/modal/sheet-group'
import { SheetTitle } from '@/ui/modal/sheet-title'
import { useTheme } from '@/ui/hooks/use-theme'

export const ShareSheet = memo(({
    sheet,
    onNew,
    onDaily,
    onPickNote
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const run = useCallback((action) => () => {
        sheet.onClose()
        action()
    }, [sheet])

    return (
        <FreshSheet sheet={sheet}>
            <SheetTitle>{t('share.title')}</SheetTitle>

            <SheetGroup>
                <ListItem
                    uppercase={false}
                    title={t('share.new_note')}
                    background={colors.surfaceVariant}
                    onPress={run(onNew)}
                />
                <ListItem
                    uppercase={false}
                    title={t('share.add_to_daily')}
                    background={colors.surfaceVariant}
                    onPress={run(onDaily)}
                />
                <ListItem
                    uppercase={false}
                    title={t('share.add_to_note')}
                    background={colors.surfaceVariant}
                    onPress={run(onPickNote)}
                />
            </SheetGroup>
        </FreshSheet>
    )
})
