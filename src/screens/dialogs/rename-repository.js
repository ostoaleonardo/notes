import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/ui/dialog'
import { Button } from '@/ui/button/button'
import { FilledTextField } from '@/ui/input/filled-text-field'

import { useEditDialogInput } from '@/hooks/use-dialog-input'
import { useHaptics } from '@/hooks/use-haptics'
import { useSingleFlight } from '@/hooks/use-single-flight'
import { useRepositories } from '@/hooks/use-repositories'

import { DIALOG_BUTTON_LABEL_STYLE } from '@/constants/components'
import { FEEDBACK_TYPES } from '@/constants/feedback-types'
import { REPOSITORY_RESULTS } from '@/constants/repository-results'

export function RenameRepository({ visible, onDismiss, repositoryId }) {
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
            actions={
                <Button
                    mode='contained'
                    loading={updating}
                    onPress={onUpdate}
                    disabled={disabled}
                    labelStyle={DIALOG_BUTTON_LABEL_STYLE}
                >
                    {t('button.update')}
                </Button>
            }
        >
            <FilledTextField
                autoFocus
                multiline={false}
                value={alias}
                placeholder={placeholder}
                onChangeText={setAlias}
            />
        </Dialog>
    )
}
