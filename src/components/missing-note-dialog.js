import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/components/confirm-dialog'

export function MissingNoteDialog({ missing, onDismiss, onConfirm }) {
    const { t } = useTranslation()

    return (
        <ConfirmDialog
            visible={!!missing}
            title={t('message.wiki_links.missing.title')}
            message={t('message.wiki_links.missing.message', { title: missing?.title })}
            confirmLabel={t('button.create')}
            onDismiss={onDismiss}
            onConfirm={onConfirm}
        />
    )
}
