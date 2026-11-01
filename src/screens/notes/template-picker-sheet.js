import { memo } from 'react'
import { StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { TemplatePicker } from './template-picker'
import { Button } from '@/ui/button/button'
import { ModalBottomSheet } from '@/ui/modal/modal-bottom-sheet'
import { SheetTitle } from '@/ui/modal/sheet-title'

import { SPACING } from '@/constants/theme'

export const TemplatePickerSheet = memo(function TemplatePickerSheet({
    sheet,
    title,
    templates,
    onSelect,
    onSaveAsTemplate
}) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const onSave = () => {
        sheet.onClose()
        onSaveAsTemplate()
    }

    return (
        <ModalBottomSheet
            enableDynamicSizing
            ref={sheet.ref}
            onClose={sheet.onClose}
        >
            <SheetTitle>{t('title.templates')}</SheetTitle>

            <TemplatePicker
                title={title}
                templates={templates}
                onSelect={onSelect}
            />

            <Button
                compact={true}
                onPress={onSave}
                style={styles.save}
                buttonColor={colors.surfaceVariant}
                textColor={colors.onBackground}
            >
                {t('button.save_as_template')}
            </Button>
        </ModalBottomSheet>
    )
})

const styles = StyleSheet.create({
    save: {
        alignSelf: 'center',
        marginVertical: SPACING.md
    }
})
