import { useTranslation } from 'react-i18next'

import { NameDialog } from '@/components/name-dialog'

import { useTemplates } from '@/hooks/use-templates'

export function AddTemplateFolder({ visible, onDismiss, parent = '' }) {
    const { t } = useTranslation()
    const { addTemplateFolder } = useTemplates()

    const onSubmit = (name) => addTemplateFolder(name, parent)

    return (
        <NameDialog
            title={t('repositories.add_subfolder')}
            visible={visible}
            onDismiss={onDismiss}
            onSubmit={onSubmit}
        />
    )
}
