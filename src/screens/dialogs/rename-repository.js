import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/ui/dialog'
import { FilledButton } from '@/ui/button/filled-button'
import { FilledTextField } from '@/ui/input/filled-text-field'

import { useEditDialogInput } from '@/hooks/use-dialog-input'
import { useHaptics } from '@/hooks/use-haptics'
import { useSingleFlight } from '@/hooks/use-single-flight'
import { useRepositories } from '@/hooks/use-repositories'

import { FEEDBACK_TYPES } from '@/constants/feedback-types'
import { REPOSITORY_RESULTS } from '@/constants/repository-results'

export const RenameRepository = ({
    visible,
    onDismiss,
    repositoryId
}) => {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { repositories, renameRepository } = useRepositories()

    const isFolder = !!repositories.find((repository) => repository.id === repositoryId)?.parentId

    const getInitialAlias = (id) => repositories.find((repository) => repository.id === id)?.alias || ''
    const [alias, setAlias, placeholder, disabled] = useEditDialogInput(repositoryId, getInitialAlias)

    const [onUpdate, updating] = useSingleFlight(async () => {
        if (disabled) return

        const result = await renameRepository(repositoryId, alias.trim())
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
