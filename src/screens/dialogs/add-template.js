import { router } from 'expo-router'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import * as DocumentPicker from 'expo-document-picker'

import { DialogModal } from '@/components/dialog'
import { LargeInput } from '@/components/input/large-input'

import { useCreateDialogInput } from '@/hooks/use-dialog-input'
import { useHaptics } from '@/hooks/use-haptics'
import { useTemplates } from '@/hooks/use-templates'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/dialog'
import { FEEDBACK_TYPES } from '@/constants/feedback-types'
import { ROUTES } from '@/constants/routes'

export function AddTemplate({ visible, onDismiss }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { addTemplate, importTemplate } = useTemplates()

    const [name, setName, disabled] = useCreateDialogInput(visible)

    const onCreate = async () => {
        if (disabled) return

        const filename = await addTemplate(name.trim())
        onDismiss()
        vibrate(FEEDBACK_TYPES.SUCCESS)
        router.push(ROUTES.EDIT_TEMPLATE + encodeURIComponent(filename))
    }

    const onImport = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' })
        if (result.canceled) return

        await importTemplate(result.assets[0].uri, result.assets[0].name)
        onDismiss()
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <DialogModal
            title={t('templates.new')}
            visible={visible}
            onDismiss={onDismiss}
            actions={[
                <Button
                    key='import'
                    onPress={onImport}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('templates.import')}
                </Button>,
                <Button
                    key='create'
                    mode='contained'
                    onPress={onCreate}
                    disabled={disabled}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.create')}
                </Button>
            ]}
        >
            <LargeInput
                autoFocus
                value={name}
                placeholder={t('templates.new')}
                onChangeText={setName}
            />
        </DialogModal>
    )
}
