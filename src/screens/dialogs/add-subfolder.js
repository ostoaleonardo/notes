import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'

import { NameDialog } from '@/components/name-dialog'

import { useRepositories } from '@/hooks/use-repositories'

import { REPOSITORY_RESULTS } from '@/constants/repository-results'

export function AddSubfolder({ visible, onDismiss, parentId }) {
    const { t } = useTranslation()
    const { addSubfolder } = useRepositories()

    const onSubmit = async (name) => {
        const result = await addSubfolder(parentId, name)

        if (result === REPOSITORY_RESULTS.PRO_REQUIRED) {
            ToastAndroid.show(t('repositories.pro_required'), ToastAndroid.SHORT)
            return false
        }
    }

    return (
        <NameDialog
            title={t('repositories.add_subfolder')}
            visible={visible}
            onDismiss={onDismiss}
            onSubmit={onSubmit}
        />
    )
}
