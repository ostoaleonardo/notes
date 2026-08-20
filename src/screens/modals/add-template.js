import { StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import { Button } from 'react-native-paper'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import * as DocumentPicker from 'expo-document-picker'
import { DialogModal, LargeInput } from '@/components'
import { useHaptics, useTemplates } from '@/hooks'
import { FEEDBACK_TYPES, FONTS, ROUTES } from '@/constants'

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
                <Button
                    key='import'
                    onPress={onImport}
                    labelStyle={styles.label}
                >
                    {t('templates.import')}
                </Button>,
                <Button
                    key='create'
                    mode='contained'
                    onPress={onCreate}
                    disabled={isDisabled}
                    labelStyle={styles.label}
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

const styles = StyleSheet.create({
    label: {
        fontSize: 12,
        paddingHorizontal: 8,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})
