import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { TemplatePicker } from './template-picker'
import { useSingleFlight } from '@/hooks/use-single-flight'
import { TonalButton } from '@/ui/button/tonal-button'
import { ModalBottomSheet } from '@/ui/modal/modal-bottom-sheet'
import { SheetActions } from '@/ui/modal/sheet-actions'
import { SheetTitle } from '@/ui/modal/sheet-title'
import { TEST_IDS } from '@/constants/test-ids'

export const TemplatePickerSheet = memo(({
    sheet,
    title,
    templates,
    onSelect,
    onSaveAsTemplate
}) => {
    const { t } = useTranslation()

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

            <SheetActions>
                <TonalButton
                    loading={saving}
                    onPress={onSave}
                    testID={TEST_IDS.TEMPLATE_SAVE}
                >
                    {t('button.save_as_template')}
                </TonalButton>
            </SheetActions>
        </ModalBottomSheet>
    )
})
