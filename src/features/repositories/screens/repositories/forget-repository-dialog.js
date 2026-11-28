import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/shared/components/confirm-dialog'

import { useHaptics } from '@/shared/hooks/use-haptics'
import { useFolders } from '@/shared/hooks/use-folders'

import { FEEDBACK_TYPES } from '@/shared/constants/feedback-types'

export const ForgetRepositoryDialog = ({
    visible,
    onDismiss,
    folderId
}) => {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { forgetRepository } = useFolders()

    const onForget = () => {
        forgetRepository(folderId)
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <ConfirmDialog
            title={t('repositories.forget.title')}
            message={t('repositories.forget.message')}
            confirmLabel={t('button.forget')}
            visible={visible}
            onDismiss={onDismiss}
            onConfirm={onForget}
        />
    )
}
