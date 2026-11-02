import { memo } from 'react'
import { StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import { TemplatePicker } from './template-picker'
import { useSingleFlight } from '@/hooks/use-single-flight'
import { TonalButton } from '@/ui/button/tonal-button'
import { ModalBottomSheet } from '@/ui/modal/modal-bottom-sheet'
import { SheetTitle } from '@/ui/modal/sheet-title'
import { useSheetBottomSpacing } from '@/ui/hooks/use-sheet-bottom-spacing'

import { SPACING } from '@/constants/theme'

export const TemplatePickerSheet = memo(function TemplatePickerSheet({
    sheet,
    title,
    templates,
    onSelect,
    onSaveAsTemplate
}) {
    const { t } = useTranslation()
    const bottom = useSheetBottomSpacing()

    const [onSave, saving] = useSingleFlight(async () => {
        await onSaveAsTemplate()
        sheet.onClose()
    })

    return (
        <ModalBottomSheet
            enableDynamicSizing
            ref={sheet.ref}
        >
            <SheetTitle>
                {t('title.templates')}
            </SheetTitle>

            <TemplatePicker
                title={title}
                templates={templates}
                onSelect={onSelect}
            />

            <TonalButton
                loading={saving}
                onPress={onSave}
                style={[styles.save, { marginBottom: bottom }]}
            >
                {t('button.save_as_template')}
            </TonalButton>
        </ModalBottomSheet>
    )
})

const styles = StyleSheet.create({
    save: {
        alignSelf: 'center',
        marginTop: SPACING.xxs
    }
})
