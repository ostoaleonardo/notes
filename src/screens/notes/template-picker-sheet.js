import { memo } from 'react'
import { StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { TemplatePicker } from './template-picker'
import { Pressable } from '@/components/button/pressable'
import { ModalSheet } from '@/components/modal/modal-sheet'

import { SPACING } from '@/constants/spacing'

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
        <ModalSheet
            enableDynamicSizing
            ref={sheet.ref}
            onClose={sheet.onClose}
        >
            <TemplatePicker
                title={title}
                templates={templates}
                onSelect={onSelect}
            />

            <Pressable
                compact={true}
                onPress={onSave}
                style={styles.save}
                buttonColor={colors.surfaceVariant}
                textColor={colors.onBackground}
            >
                {t('button.save_as_template')}
            </Pressable>
        </ModalSheet>
    )
})

const styles = StyleSheet.create({
    save: {
        alignSelf: 'center',
        marginVertical: SPACING.md
    }
})
