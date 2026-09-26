import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/components/confirm-dialog'

import { useHaptics } from '@/hooks/use-haptics'
import { useRepositories } from '@/hooks/use-repositories'

import { FEEDBACK_TYPES } from '@/constants/feedback-types'

export function ForgetRepository({ visible, onDismiss, repositoryId }) {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { forgetRepository } = useRepositories()

    const onForget = () => {
        forgetRepository(repositoryId)
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    return (
        <ConfirmDialog
            title={t('repositories.forget')}
            message={t('repositories.forget_message')}
            confirmLabel={t('button.forget')}
            visible={visible}
            onDismiss={onDismiss}
            onConfirm={onForget}
        />
    )
}
