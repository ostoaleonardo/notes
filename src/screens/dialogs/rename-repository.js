import { ToastAndroid } from 'react-native'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { DialogModal } from '@/components/dialog'
import { LargeInput } from '@/components/input/large-input'

import { useEditDialogInput } from '@/hooks/use-dialog-input'
import { useHaptics } from '@/hooks/use-haptics'
import { useRepositories } from '@/hooks/use-repositories'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/dialog'
import { FEEDBACK_TYPES } from '@/constants/feedback-types'

export function RenameRepository({ visible, onDismiss, repositoryId }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { repositories, renameRepository } = useRepositories()

    const isFolder = !!repositories.find((repository) => repository.id === repositoryId)?.parentId

    const getInitialAlias = (id) => repositories.find((repository) => repository.id === id)?.alias || ''
    const [alias, setAlias, placeholder, disabled] = useEditDialogInput(repositoryId, getInitialAlias)

    const onUpdate = async () => {
        if (disabled) return

        const result = await renameRepository(repositoryId, alias.trim())
        onDismiss()

        if (result === 'error') {
            ToastAndroid.show(t('repositories.rename_failed'), ToastAndroid.SHORT)
            return
        }

        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <DialogModal
            title={t(isFolder ? 'repositories.edit_folder' : 'repositories.rename')}
            visible={visible}
            onDismiss={onDismiss}
            actions={
                <Button
                    mode='contained'
                    onPress={onUpdate}
                    disabled={disabled}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.update')}
                </Button>
            }
        >
            <LargeInput
                autoFocus
                value={alias}
                placeholder={placeholder}
                onChangeText={setAlias}
            />
        </DialogModal>
    )
}
