import { StyleSheet, ToastAndroid } from 'react-native'
import { useEffect, useState } from 'react'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { DialogModal, LargeInput } from '@/components'
import { useHaptics, useRepositories } from '@/hooks'
import { FEEDBACK_TYPES, FONTS } from '@/constants'

export function AddSubfolder({ visible, onDismiss, parentId }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { addSubfolder } = useRepositories()

    const [name, setName] = useState('')
    const isDisabled = !name || !name.trim()

    useEffect(() => {
        if (visible) setName('')
    }, [visible])

    const onCreate = async () => {
        if (isDisabled) return

        const result = await addSubfolder(parentId, name.trim())

        if (result === 'pro_required') {
            onDismiss()
            ToastAndroid.show(t('repositories.pro_required'), ToastAndroid.SHORT)
            return
        }

        onDismiss()
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <DialogModal
            title={t('repositories.add_subfolder')}
            visible={visible}
            onDismiss={onDismiss}
            actions={
                <Button
                    mode='contained'
                    onPress={onCreate}
                    disabled={isDisabled}
                    labelStyle={styles.label}
                >
                    {t('button.create')}
                </Button>
            }
        >
            <LargeInput
                autoFocus
                value={name}
                placeholder={t('repositories.add_subfolder')}
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
