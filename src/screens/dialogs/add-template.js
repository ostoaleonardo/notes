import { router } from 'expo-router'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import * as DocumentPicker from 'expo-document-picker'

import { NameDialog } from '@/components/name-dialog'

import { useHaptics } from '@/hooks/use-haptics'
import { useTemplates } from '@/hooks/use-templates'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/components'
import { FEEDBACK_TYPES } from '@/constants/feedback-types'
import { ROUTES } from '@/constants/routes'

export function AddTemplate({ visible, onDismiss, folder = '' }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { addTemplate, importTemplate } = useTemplates()

    const onSubmit = async (name) => {
        const filename = await addTemplate(name, '', folder)
        router.push(ROUTES.EDIT_TEMPLATE + encodeURIComponent(filename))
    }

    const onImport = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' })
        if (result.canceled) return

        await importTemplate(
            result.assets[0].uri,
            result.assets[0].name,
            folder
        )
        onDismiss()
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    const importAction = (
        <Button
            key='import'
            onPress={onImport}
            labelStyle={DIALOG_BUTTON_LABEL_STYLE}
        >
            {t('templates.import')}
        </Button>
    )

    return (
        <NameDialog
            title={t('templates.new')}
            visible={visible}
            onDismiss={onDismiss}
            onSubmit={onSubmit}
            extraActions={[importAction]}
        />
    )
}
