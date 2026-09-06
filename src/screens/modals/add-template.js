import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import * as DocumentPicker from 'expo-document-picker'
import { DialogButton, DialogModal } from '@/components/dialog'
import { LargeInput } from '@/components/input'
import { useHaptics, useTemplates } from '@/hooks'
import { FEEDBACK_TYPES, ROUTES } from '@/constants'

export function AddTemplate({ visible, onDismiss }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { addTemplate, importTemplate } = useTemplates()

    const [name, setName] = useState('')
    const isDisabled = !name || !name.trim()

    useEffect(() => {
        if (visible) setName('')
    }, [visible])

    const onCreate = async () => {
        if (isDisabled) return

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
                <DialogButton
                    key='import'
                    onPress={onImport}
                >
                    {t('templates.import')}
                </DialogButton>,
                <DialogButton
                    key='create'
                    mode='contained'
                    onPress={onCreate}
                    disabled={isDisabled}
                >
                    {t('button.create')}
                </DialogButton>
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
