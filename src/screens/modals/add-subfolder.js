import { ToastAndroid } from 'react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DialogButton, DialogModal } from '@/components/dialog'
import { LargeInput } from '@/components/input'
import { useHaptics, useRepositories } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

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
                <DialogButton
                    mode='contained'
                    onPress={onCreate}
                    disabled={isDisabled}
                >
                    {t('button.create')}
                </DialogButton>
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
