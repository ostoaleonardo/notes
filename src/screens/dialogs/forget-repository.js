import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/shared/components/confirm-dialog'

import { useHaptics } from '@/shared/hooks/use-haptics'
import { useRepositories } from '@/shared/hooks/use-repositories'

import { FEEDBACK_TYPES } from '@/shared/constants/feedback-types'

export const ForgetRepository = ({
    visible,
    onDismiss,
    repositoryId
}) => {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { forgetRepository } = useRepositories()

    const onForget = () => {
        forgetRepository(repositoryId)
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
