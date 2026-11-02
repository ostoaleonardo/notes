import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { ButtonGroup } from '@/ui/button/button-group'
import { ListItem } from '@/ui/list-item'
import { useSheetBottomSpacing } from '@/ui/hooks/use-sheet-bottom-spacing'
import { ModalBottomSheet } from '@/ui/modal/modal-bottom-sheet'
import { SheetTitle } from '@/ui/modal/sheet-title'
import { PositionGroup } from '@/ui/position-group'
import { showSnackbar } from '@/ui/snackbar/snackbar-host'
import { useTheme } from '@/ui/hooks/use-theme'

import { usePro } from '@/hooks/use-pro'

import { Folder } from '@/icons/folder'
import { Share } from '@/icons/share'

import { EXPORT_FORMATS, PRO_EXPORT_FORMATS } from '@/constants/export'
import { ICON_SIZE, SPACING } from '@/constants/theme'

export const ExportSheet = memo(function ExportSheet({ sheet, onExport, onShare }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const bottom = useSheetBottomSpacing()
    const { pro } = usePro()

    const [format, setFormat] = useState(EXPORT_FORMATS.MARKDOWN)

    const select = useCallback((value) => {
        if (!pro && PRO_EXPORT_FORMATS.includes(value)) {
            showSnackbar(t('repositories.pro_required'))
            return
        }

        setFormat(value)
    }, [pro, t])

    const run = useCallback((action) => {
        sheet.onClose()
        action(format)
    }, [sheet, format])

    const formats = [
        { value: EXPORT_FORMATS.MARKDOWN, label: t('export.markdown') },
        { value: EXPORT_FORMATS.HTML, label: t('export.html') },
        { value: EXPORT_FORMATS.PDF, label: t('export.pdf') }
    ]

    return (
        <ModalBottomSheet
            enableDynamicSizing
            ref={sheet.ref}
            onClose={sheet.onClose}
        >
            <SheetTitle>{t('button.export_share')}</SheetTitle>

            <ButtonGroup
                chip
                style={styles.chips}
                buttons={formats.map(({ value, label }) => ({
                    label,
                    selected: format === value,
                    onPress: () => select(value)
                }))}
            />

            <View style={[styles.rows, { paddingBottom: bottom }]}>
                <PositionGroup>
                    <ListItem
                        uppercase={false}
                        title={t('button.share')}
                        background={colors.surfaceVariant}
                        onPress={() => run(onShare)}
                        rightContent={<Share width={ICON_SIZE.lg} height={ICON_SIZE.lg} color={colors.onBackground} />}
                    />
                    <ListItem
                        uppercase={false}
                        title={t('export.save_to_device')}
                        background={colors.surfaceVariant}
                        onPress={() => run(onExport)}
                        rightContent={<Folder width={ICON_SIZE.lg} height={ICON_SIZE.lg} color={colors.onBackground} />}
                    />
                </PositionGroup>
            </View>
        </ModalBottomSheet>
    )
})

const styles = StyleSheet.create({
    chips: {
        justifyContent: 'center',
        marginBottom: SPACING.lg
    },
    rows: {
        gap: SPACING.xxxs,
        paddingHorizontal: SPACING.lg
    }
})
