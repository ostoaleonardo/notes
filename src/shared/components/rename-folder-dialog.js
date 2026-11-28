import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/ui/dialog'
import { FilledButton } from '@/ui/button/filled-button'
import { FilledTextField } from '@/ui/input/filled-text-field'

import { useEditDialogInput } from '@/shared/hooks/use-dialog-input'
import { useHaptics } from '@/shared/hooks/use-haptics'
import { useSingleFlight } from '@/shared/hooks/use-single-flight'
import { useFolders } from '@/shared/hooks/use-folders'

import { FEEDBACK_TYPES } from '@/shared/constants/feedback-types'
import { REPOSITORY_RESULTS } from '@/shared/constants/repository-results'

export const RenameFolderDialog = ({
    visible,
    onDismiss,
    folderId
}) => {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { folders, renameFolder } = useFolders()

    const isFolder = !!folders.find((folder) => folder.id === folderId)?.parentId

    const getInitialAlias = (id) => folders.find((folder) => folder.id === id)?.alias || ''
    const [alias, setAlias, placeholder, disabled] = useEditDialogInput(folderId, getInitialAlias)

    const [onUpdate, updating] = useSingleFlight(async () => {
        if (disabled) return

        const result = await renameFolder(folderId, alias.trim())
        onDismiss()

        if (result === REPOSITORY_RESULTS.ERROR) {
            ToastAndroid.show(t('repositories.rename.failed'), ToastAndroid.SHORT)
            return
        }

        vibrate(FEEDBACK_TYPES.SUCCESS)
    })

    return (
        <Dialog
            title={t(isFolder ? 'repositories.edit_folder' : 'repositories.rename.title')}
            visible={visible}
            onDismiss={onDismiss}
            locked={updating}
            confirm={(
                <FilledButton
                    loading={updating}
                    onPress={onUpdate}
                    disabled={disabled}
                >
                    {t('button.update')}
                </FilledButton>
            )}
        >
            <FilledTextField
                autoFocus
                multiline={false}
                disabled={updating}
                value={alias}
                placeholder={placeholder}
                onChangeText={setAlias}
            />
        </Dialog>
    )
}
